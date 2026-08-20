import { useMemo, useState } from 'react'
import { BookOpen, CalendarClock } from 'lucide-react'
import { STAGES, formatDate, money } from '../constants'

export function Pipeline({ students, deals, onMove, onStudent }) {
  const [dragged, setDragged] = useState(null)
  const studentMap = useMemo(() => Object.fromEntries(students.map((student) => [student.id, student])), [students])

  return (
    <div className="kanban-wrap">
      <div className="kanban">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage.key)
          const total = stageDeals.reduce((sum, deal) => sum + deal.amount, 0)
          return (
            <section
              className="kanban-column"
              key={stage.key}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => { if (dragged && dragged.stage !== stage.key) onMove(dragged, stage); setDragged(null) }}
            >
              <div className="kanban-header">
                <div><span className={`stage-dot stage-${stage.key}`} />{stage.label}<b>{stageDeals.length}</b></div>
                <strong>{money(total)}</strong>
              </div>
              <div className="kanban-cards">
                {stageDeals.map((deal) => {
                  const student = studentMap[deal.student_id]
                  return (
                    <article
                      className="deal-card"
                      key={deal.id}
                      draggable
                      onDragStart={() => setDragged(deal)}
                      onClick={() => student && onStudent(student)}
                    >
                      <div className="deal-card-top">
                        <div className="contact-avatar small">{student?.full_name?.[0] || '?'}</div>
                        <div><strong>{student?.full_name || `Ученик #${deal.student_id}`}</strong><span>{student?.source || 'Источник не указан'}</span></div>
                      </div>
                      <div className="deal-product"><BookOpen size={15} />{deal.product}</div>
                      <div className="deal-card-bottom"><strong>{money(deal.amount)}</strong><span>{deal.probability}%</span></div>
                      {deal.next_contact_at && <div className="deal-next"><CalendarClock size={14} />{formatDate(deal.next_contact_at)}</div>}
                    </article>
                  )
                })}
                {stageDeals.length === 0 && <div className="kanban-empty">Перетащите сделку сюда</div>}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
