import { useEffect, useState } from 'react'
import { api } from '../api'
import { Field, Modal } from './Common'

export function AddStudentModal({ open, onClose, onCreated }) {
  const initial = {
    full_name: '', phone: '', telegram: '', parent_name: '', parent_phone: '', grade: '',
    exam: 'ОГЭ', subject: 'Математика', status: 'lead', source: 'Telegram', owner: 'Егор', notes: '',
    deal_amount: '', next_contact_at: '',
  }
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (open) { setForm(initial); setError('') } }, [open])
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true); setError('')
    try {
      const { deal_amount, next_contact_at, ...studentForm } = form
      const payload = { ...studentForm, grade: studentForm.grade ? Number(studentForm.grade) : null }
      Object.keys(payload).forEach((key) => { if (payload[key] === '') payload[key] = null })
      const student = await api.createStudent(payload)
      await api.createDeal({
        student_id: student.id,
        stage: 'new',
        product: `${student.exam || 'ОГЭ'} ${student.subject || 'Математика'}`,
        amount: deal_amount ? Number(deal_amount) : 0,
        probability: 10,
        next_contact_at: next_contact_at || null,
      })
      onCreated(student)
      onClose()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Новый ученик">
      <form className="form-stack" onSubmit={submit}>
        <div className="form-grid">
          <Field label="Имя и фамилия" required><input value={form.full_name} onChange={set('full_name')} placeholder="Анна Смирнова" required /></Field>
          <Field label="Класс"><input type="number" min="1" max="11" value={form.grade} onChange={set('grade')} placeholder="9" /></Field>
          <Field label="Telegram"><input value={form.telegram} onChange={set('telegram')} placeholder="@username" /></Field>
          <Field label="Телефон"><input value={form.phone} onChange={set('phone')} placeholder="+7 999 000-00-00" /></Field>
          <Field label="Экзамен"><select value={form.exam} onChange={set('exam')}><option>ОГЭ</option><option>ЕГЭ</option><option>Школьная программа</option></select></Field>
          <Field label="Предмет"><select value={form.subject} onChange={set('subject')}><option>Математика</option><option>Информатика</option></select></Field>
          <Field label="Источник"><select value={form.source} onChange={set('source')}><option>Telegram</option><option>Рекомендация</option><option>Диагностика</option><option>VK</option><option>Другое</option></select></Field>
          <Field label="Ответственный"><input value={form.owner} onChange={set('owner')} placeholder="Егор" /></Field>
          <Field label="Стоимость, ₽"><input type="number" min="0" step="500" value={form.deal_amount} onChange={set('deal_amount')} placeholder="6000" /></Field>
          <Field label="Следующее касание"><input type="datetime-local" value={form.next_contact_at} onChange={set('next_contact_at')} /></Field>
          <Field label="Имя родителя"><input value={form.parent_name} onChange={set('parent_name')} placeholder="Елена" /></Field>
          <Field label="Телефон родителя"><input value={form.parent_phone} onChange={set('parent_phone')} placeholder="+7 999 000-00-00" /></Field>
        </div>
        <Field label="Заметка"><textarea value={form.notes} onChange={set('notes')} placeholder="Что важно знать о запросе ученика" rows="3" /></Field>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>Отмена</button><button className="primary-button" disabled={saving}>{saving ? 'Сохраняю…' : 'Добавить в CRM'}</button></div>
      </form>
    </Modal>
  )
}
