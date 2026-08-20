import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, CalendarPlus, CheckCircle2, Clock3, ListTodo } from 'lucide-react'
import { formatDate } from '../constants'
import { followupSortValue, getFollowupBucket, getFollowupMeta, isOpenDeal } from '../followups'
import { EmptyState } from './Common'

const FILTERS = [
  { key: 'focus', label: 'В фокусе' },
  { key: 'all', label: 'Все' },
  { key: 'overdue', label: 'Просрочено' },
  { key: 'today', label: 'Сегодня' },
  { key: 'tomorrow', label: 'Завтра' },
  { key: 'none', label: 'Без даты' },
]

export function Tasks({ students, deals, onStudent, onComplete, onReschedule, busyId }) {
  const [filter, setFilter] = useState('focus')
  const studentMap = useMemo(() => Object.fromEntries(students.map((student) => [student.id, student])), [students])
  const openDeals = useMemo(() => deals.filter(isOpenDeal), [deals])

  const counts = useMemo(() => openDeals.reduce((result, deal) => {
    const bucket = getFollowupBucket(deal.next_contact_at)
    result[bucket] = (result[bucket] || 0) + 1
    return result
  }, { overdue: 0, today: 0, tomorrow: 0, later: 0, none: 0 }), [openDeals])

  const visibleDeals = useMemo(() => openDeals
    .filter((deal) => {
      const bucket = getFollowupBucket(deal.next_contact_at)
      if (filter === 'all') return true
      if (filter === 'focus') return bucket === 'overdue' || bucket === 'today'
      return bucket === filter
    })
    .sort((a, b) => followupSortValue(a) - followupSortValue(b)), [openDeals, filter])

  const focusCount = counts.overdue + counts.today

  return (
    <div className="tasks-page">
      <section className="task-summary" aria-label="Сводка по касаниям">
        <SummaryItem icon={AlertTriangle} label="Просрочено" value={counts.overdue} tone="danger" onClick={() => setFilter('overdue')} active={filter === 'overdue'} />
        <SummaryItem icon={Clock3} label="Сегодня" value={counts.today} tone="today" onClick={() => setFilter('today')} active={filter === 'today'} />
        <SummaryItem icon={CalendarClock} label="Завтра" value={counts.tomorrow} tone="tomorrow" onClick={() => setFilter('tomorrow')} active={filter === 'tomorrow'} />
        <SummaryItem icon={ListTodo} label="Без даты" value={counts.none} tone="none" onClick={() => setFilter('none')} active={filter === 'none'} />
      </section>

      <section className="panel tasks-panel">
        <div className="tasks-toolbar">
          <div>
            <h2>Работа с касаниями</h2>
            <p>{focusCount > 0 ? `Требуют внимания: ${focusCount}` : 'На сегодня обязательных касаний нет'}</p>
          </div>
          <div className="task-filter-chips">
            {FILTERS.map((item) => (
              <button key={item.key} className={`task-filter ${filter === item.key ? 'active' : ''}`} onClick={() => setFilter(item.key)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="task-list">
          {visibleDeals.map((deal) => {
            const student = studentMap[deal.student_id]
            const due = getFollowupMeta(deal.next_contact_at)
            const isBusy = busyId === deal.id
            return (
              <article className={`task-row task-${due.key}`} key={deal.id}>
                <button className="task-student" onClick={() => student && onStudent(student)}>
                  <div className="contact-avatar">{student?.full_name?.[0] || '?'}</div>
                  <div className="task-main">
                    <strong>{student?.full_name || `Ученик #${deal.student_id}`}</strong>
                    <span>{deal.product} · {student?.owner || 'Без ответственного'}</span>
                  </div>
                </button>
                <div className="task-due">
                  <span className={`due-badge due-${due.key}`}>{due.label}</span>
                  <small>{deal.next_contact_at ? formatDate(deal.next_contact_at) : 'Назначьте следующее касание'}</small>
                </div>
                <div className="task-actions">
                  <button className="secondary-button task-action" disabled={isBusy} onClick={() => onReschedule(deal)} title="Перенести на завтра">
                    <CalendarPlus size={15} />На завтра
                  </button>
                  {deal.next_contact_at && (
                    <button className="primary-button task-action" disabled={isBusy} onClick={() => onComplete(deal)} title="Отметить касание выполненным">
                      <CheckCircle2 size={15} />{isBusy ? '...' : 'Выполнено'}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
          {visibleDeals.length === 0 && (
            <EmptyState compact icon={CheckCircle2} title="Здесь всё разобрано" text="Переключите фильтр или назначьте новые касания в сделках." />
          )}
        </div>
      </section>
    </div>
  )
}

function SummaryItem({ icon: Icon, label, value, tone, onClick, active }) {
  return (
    <button className={`task-summary-item summary-${tone} ${active ? 'active' : ''}`} onClick={onClick}>
      <Icon size={18} />
      <div><strong>{value}</strong><span>{label}</span></div>
    </button>
  )
}
