import { useMemo, useState } from 'react'
import { BookOpen, CalendarClock, Filter } from 'lucide-react'
import { STAGES, formatDate, money } from '../constants'
import { getFollowupBucket, getFollowupMeta, isOpenDeal } from '../followups'

const FOLLOWUP_FILTERS = [
  { key: 'all', label: 'Все' },
  { key: 'focus', label: 'В фокусе' },
  { key: 'overdue', label: 'Просрочено' },
  { key: 'today', label: 'Сегодня' },
  { key: 'tomorrow', label: 'Завтра' },
  { key: 'none', label: 'Без даты' },
]

export function Pipeline({ students, deals, onMove, onStudent }) {
  const [dragged, setDragged] = useState(null)
  const [followupFilter, setFollowupFilter] = useState('all')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const studentMap = useMemo(() => Object.fromEntries(students.map((student) => [student.id, student])), [students])
  const owners = useMemo(() => [...new Set(students.map((student) => student.owner).filter(Boolean))].sort(), [students])

  const visibleDeals = useMemo(() => deals.filter((deal) => {
    const student = studentMap[deal.student_id]
    const bucket = getFollowupBucket(deal.next_contact_at)
    const matchesOwner = ownerFilter === 'all' || student?.owner === ownerFilter
    const matchesFollowup = followupFilter === 'all'
      || (isOpenDeal(deal) && followupFilter === 'focus' && (bucket === 'overdue' || bucket === 'today'))
      || (isOpenDeal(deal) && bucket === followupFilter)
    return matchesOwner && matchesFollowup
  }), [deals, studentMap, ownerFilter, followupFilter])

  return (
    <div className="pipeline-page">
      <div className="pipeline-toolbar">
        <div className="pipeline-filter-group">
          <Filter size={16} />
          {FOLLOWUP_FILTERS.map((item) => (
            <button key={item.key} className={`pipeline-filter ${followupFilter === item.key ? 'active' : ''}`} onClick={() => setFollowupFilter(item.key)}>
              {item.label}
            </button>
          ))}
        </div>
        <label className="pipeline-owner-filter">
          <span>Ответственный</span>
          <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
            <option value="all">Все</option>
            {owners.map((owner) => <option key={owner}>{owner}</option>)}
          </select>
        </label>
      </div>

      <div className="kanban-wrap">
        <div className="kanban">
          {STAGES.map((stage) => {
            const stageDeals = visibleDeals.filter((deal) => deal.stage === stage.key)
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
                    const due = getFollowupMeta(deal.next_contact_at)
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
                        {isOpenDeal(deal) && <div className={`deal-next due-line due-${due.key}`}><CalendarClock size={14} />{deal.next_contact_at ? `${due.label} · ${formatDate(deal.next_contact_at)}` : due.label}</div>}
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
    </div>
  )
}
