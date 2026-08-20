import { ChevronRight, UsersRound } from 'lucide-react'
import { EmptyState, StatusBadge } from './Common'

export function Students({ students, onStudent }) {
  return (
    <section className="panel table-panel">
      <div className="table-header-row desktop-only">
        <span>Ученик</span><span>Подготовка</span><span>Контакт</span><span>Источник</span><span>Статус</span><span>Ответственный</span><span />
      </div>
      <div className="students-table">
        {students.map((student) => (
          <button className="student-row" key={student.id} onClick={() => onStudent(student)}>
            <div className="student-name-cell"><div className="contact-avatar">{student.full_name[0]}</div><div><strong>{student.full_name}</strong><span>{student.grade ? `${student.grade} класс` : 'Класс не указан'}</span></div></div>
            <div><strong>{student.exam || '—'}</strong><span>{student.subject || 'Предмет не указан'}</span></div>
            <div><strong>{student.telegram || student.phone || '—'}</strong><span>{student.parent_name ? `Родитель: ${student.parent_name}` : 'Без родителя'}</span></div>
            <div><strong>{student.source || '—'}</strong><span>Источник</span></div>
            <div><StatusBadge status={student.status} /></div>
            <div><strong>{student.owner || '—'}</strong><span>Ответственный</span></div>
            <ChevronRight size={18} />
          </button>
        ))}
        {students.length === 0 && <EmptyState icon={UsersRound} title="Учеников пока нет" text="Создайте первый контакт, чтобы начать вести воронку." />}
      </div>
    </section>
  )
}
