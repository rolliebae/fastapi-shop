import { useEffect, useState } from 'react'
import { Activity, BarChart3, BookOpen, MessageCircle, Phone, Plus, Save, Send, X } from 'lucide-react'
import { api } from '../api'
import { STAGES, formatDate } from '../constants'
import { EmptyState } from './Common'

function toDateTimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function StudentDrawer({ student, deals, onClose, onRefresh }) {
  const [activities, setActivities] = useState([])
  const [activityText, setActivityText] = useState('')
  const [kind, setKind] = useState('telegram')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(student?.status || 'lead')
  const [dealAmount, setDealAmount] = useState('')
  const [nextContactAt, setNextContactAt] = useState('')
  const [dealSaving, setDealSaving] = useState(false)
  const [dealSaved, setDealSaved] = useState(false)
  const [dealError, setDealError] = useState('')

  const deal = deals.find((item) => item.student_id === student?.id)
  const stage = STAGES.find((item) => item.key === deal?.stage)

  useEffect(() => {
    if (!student) return
    setStatus(student.status)
    api.activities(student.id).then(setActivities).catch(() => setActivities([]))
  }, [student])

  useEffect(() => {
    if (!deal) {
      setDealAmount('')
      setNextContactAt('')
      return
    }
    setDealAmount(String(deal.amount ?? 0))
    setNextContactAt(toDateTimeLocal(deal.next_contact_at))
    setDealSaved(false)
    setDealError('')
  }, [deal?.id, deal?.amount, deal?.next_contact_at])

  if (!student) return null

  const addActivity = async (event) => {
    event.preventDefault()
    if (!activityText.trim()) return
    setSaving(true)
    try {
      await api.createActivity({ student_id: student.id, kind, text: activityText.trim(), created_by: 'Егор' })
      setActivityText('')
      setActivities(await api.activities(student.id))
    } finally { setSaving(false) }
  }

  const updateStatus = async (nextStatus) => {
    setStatus(nextStatus)
    await api.updateStudent(student.id, { status: nextStatus })
    onRefresh()
  }

  const saveDeal = async (event) => {
    event.preventDefault()
    if (!deal) return
    setDealSaving(true)
    setDealSaved(false)
    setDealError('')
    try {
      await api.updateDeal(deal.id, {
        amount: dealAmount === '' ? 0 : Number(dealAmount),
        next_contact_at: nextContactAt || null,
      })
      await onRefresh()
      setDealSaved(true)
    } catch (error) {
      setDealError(error.message)
    } finally {
      setDealSaving(false)
    }
  }

  return (
    <div className="drawer-shell">
      <button className="drawer-backdrop" onClick={onClose} aria-label="Закрыть карточку" />
      <aside className="drawer">
        <div className="drawer-header">
          <div className="drawer-person"><div className="contact-avatar large">{student.full_name[0]}</div><div><h2>{student.full_name}</h2><p>{student.grade ? `${student.grade} класс` : 'Класс не указан'} · {student.exam || 'Экзамен'} {student.subject || ''}</p></div></div>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="drawer-body">
          <div className="quick-actions">
            {student.telegram && <a className="quick-action" href={`https://t.me/${student.telegram.replace('@', '')}`} target="_blank" rel="noreferrer"><Send size={17} />Telegram</a>}
            {student.phone && <a className="quick-action" href={`tel:${student.phone}`}><Phone size={17} />Позвонить</a>}
          </div>

          <section className="detail-section">
            <div className="detail-title">Статус ученика</div>
            <select className="status-select" value={status} onChange={(event) => updateStatus(event.target.value)}>
              <option value="lead">Лид</option><option value="active">Активный</option><option value="paused">Пауза</option><option value="archived">Архив</option>
            </select>
          </section>

          <section className="detail-section deal-summary">
            <div className="detail-title">Сделка</div>
            {deal ? (
              <>
                <div className="deal-summary-grid compact">
                  <div><span>Этап</span><strong>{stage?.label || deal.stage}</strong></div>
                  <div><span>Вероятность</span><strong>{deal.probability}%</strong></div>
                </div>
                <form className="deal-edit-form" onSubmit={saveDeal}>
                  <label className="deal-edit-field">
                    <span>Сумма, ₽</span>
                    <input type="number" min="0" step="500" value={dealAmount} onChange={(event) => { setDealAmount(event.target.value); setDealSaved(false) }} />
                  </label>
                  <label className="deal-edit-field">
                    <span>Следующее касание</span>
                    <input type="datetime-local" value={nextContactAt} onChange={(event) => { setNextContactAt(event.target.value); setDealSaved(false) }} />
                  </label>
                  <div className="deal-edit-actions">
                    <div className="deal-save-message">
                      {dealError && <span className="deal-edit-error">{dealError}</span>}
                      {dealSaved && !dealError && <span className="deal-edit-success">Сохранено</span>}
                    </div>
                    <button className="secondary-button deal-save-button" disabled={dealSaving}>
                      <Save size={15} />{dealSaving ? 'Сохраняю…' : 'Сохранить сделку'}
                    </button>
                  </div>
                </form>
              </>
            ) : <span className="muted">Сделка не создана</span>}
          </section>

          <section className="detail-section">
            <div className="detail-title">Контакты и источник</div>
            <div className="info-list">
              <Info label="Telegram" value={student.telegram} /><Info label="Телефон" value={student.phone} /><Info label="Родитель" value={student.parent_name} /><Info label="Телефон родителя" value={student.parent_phone} /><Info label="Источник" value={student.source} /><Info label="Ответственный" value={student.owner} />
            </div>
          </section>

          {student.notes && <section className="detail-section"><div className="detail-title">Заметка</div><p className="notes-box">{student.notes}</p></section>}

          <section className="detail-section timeline-section">
            <div className="detail-title">История взаимодействий</div>
            <form className="activity-form" onSubmit={addActivity}>
              <select value={kind} onChange={(event) => setKind(event.target.value)}><option value="telegram">Telegram</option><option value="call">Звонок</option><option value="diagnostic">Диагностика</option><option value="lesson">Занятие</option><option value="note">Заметка</option></select>
              <input value={activityText} onChange={(event) => setActivityText(event.target.value)} placeholder="Например: отправил результаты диагностики" />
              <button className="icon-button strong" disabled={saving}><Plus size={18} /></button>
            </form>
            <div className="timeline">
              {activities.map((item) => <TimelineItem key={item.id} activity={item} />)}
              {activities.length === 0 && <EmptyState compact icon={Activity} title="История пуста" text="Добавьте первое касание с учеником." />}
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}

function Info({ label, value }) { return <div className="info-row"><span>{label}</span><strong>{value || '—'}</strong></div> }

function TimelineItem({ activity }) {
  const icons = { telegram: Send, call: Phone, diagnostic: BarChart3, lesson: BookOpen, note: MessageCircle }
  const Icon = icons[activity.kind] || Activity
  return <div className="timeline-item"><div className="timeline-icon"><Icon size={15} /></div><div><strong>{activity.text}</strong><span>{formatDate(activity.happened_at)}{activity.created_by ? ` · ${activity.created_by}` : ''}</span></div></div>
}
