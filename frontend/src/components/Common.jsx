import { X } from 'lucide-react'

export function StatusBadge({ status }) {
  const labels = { lead: 'Лид', active: 'Активный', paused: 'Пауза', archived: 'Архив' }
  return <span className={`status status-${status}`}>{labels[status] || status}</span>
}

export function EmptyState({ icon: Icon, title, text, compact = false }) {
  return <div className={`empty-state ${compact ? 'compact' : ''}`}><div className="empty-icon"><Icon size={20} /></div><strong>{title}</strong><span>{text}</span></div>
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <button className="modal-backdrop" aria-label="Закрыть" onClick={onClose} />
      <div className="modal-card">
        <div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={19} /></button></div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, required, children }) {
  return <label className="field"><span>{label}{required && <b>*</b>}</span>{children}</label>
}
