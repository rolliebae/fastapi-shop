import { useMemo } from 'react'
import { ArrowRight, CalendarClock, Check, ChevronRight, CircleDollarSign, GraduationCap, Target, UsersRound } from 'lucide-react'
import { STAGES, formatDate, money } from '../constants'
import { followupSortValue, getFollowupBucket, getFollowupMeta, isOpenDeal } from '../followups'
import { EmptyState, StatusBadge } from './Common'

function MetricCard({ icon: Icon, label, value, helper, accent = false }) {
  return (
    <section className={`metric-card ${accent ? 'metric-accent' : ''}`}>
      <div className="metric-icon"><Icon size={19} /></div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-helper">{helper}</div>
    </section>
  )
}

export function Dashboard({ data, students, deals, onStudent, onTasks }) {
  const openDeals = useMemo(() => deals.filter(isOpenDeal), [deals])
  const upcoming = useMemo(() => openDeals
    .filter((deal) => deal.next_contact_at)
    .sort((a, b) => followupSortValue(a) - followupSortValue(b))
    .slice(0, 5), [openDeals])

  const overdueCount = openDeals.filter((deal) => getFollowupBucket(deal.next_contact_at) === 'overdue').length
  const todayCount = openDeals.filter((deal) => getFollowupBucket(deal.next_contact_at) === 'today').length
  const withoutDateCount = openDeals.filter((deal) => getFollowupBucket(deal.next_contact_at) === 'none').length
  const studentMap = useMemo(() => Object.fromEntries(students.map((student) => [student.id, student])), [students])
  const stageCounts = STAGES.filter((stage) => !['won', 'lost'].includes(stage.key)).map((stage) => ({
    ...stage,
    count: deals.filter((deal) => deal.stage === stage.key).length,
  }))
  const maxStage = Math.max(1, ...stageCounts.map((stage) => stage.count))

  return (
    <div className="page-stack">
      <div className="metrics-grid">
        <MetricCard icon={UsersRound} label="Всего контактов" value={data?.total_students ?? 0} helper="Лиды и ученики" />
        <MetricCard icon={GraduationCap} label="Активные ученики" value={data?.active_students ?? 0} helper="Сейчас занимаются" accent />
        <MetricCard icon={Target} label="Открытая воронка" value={money(data?.open_pipeline_amount ?? 0)} helper={`Взвешенно ${money(data?.weighted_pipeline_amount ?? 0)}`} />
        <MetricCard icon={CircleDollarSign} label="Успешные сделки" value={data?.won_deals ?? 0} helper="Этап «Ученик»" />
      </div>

      <div className="dashboard-grid">
        <section className="panel pipeline-overview">
          <div className="panel-header">
            <div><h2>Воронка продаж</h2><p>Сколько лидов находится на каждом этапе</p></div>
            <Target size={20} />
          </div>
          <div className="funnel-list">
            {stageCounts.map((stage) => {
              const width = stage.count === 0 ? 0 : Math.max(8, (stage.count / maxStage) * 100)
              return (
                <div className="funnel-row" key={stage.key}>
                  <div className="funnel-meta"><span>{stage.label}</span><strong>{stage.count}</strong></div>
                  <div className="funnel-track"><div className="funnel-fill" style={{ width: `${width}%` }} /></div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="panel followups-panel">
          <div className="panel-header">
            <div><h2>Работа на сегодня</h2><p>{overdueCount > 0 ? `Просрочено ${overdueCount} · сегодня ${todayCount}` : todayCount > 0 ? `Сегодня ${todayCount} касаний` : 'Критичных касаний на сегодня нет'}</p></div>
            <button className="panel-link" onClick={onTasks}>Все задачи</button>
          </div>
          <div className="followups-list">
            {upcoming.length === 0 ? (
              <EmptyState compact icon={Check} title="Касания под контролем" text={withoutDateCount > 0 ? `${withoutDateCount} сделок пока без даты — назначьте их в задачах.` : 'Новых касаний пока нет.'} />
            ) : upcoming.map((deal) => {
              const student = studentMap[deal.student_id]
              const due = getFollowupMeta(deal.next_contact_at)
              return (
                <button className="followup-row" key={deal.id} onClick={() => student && onStudent(student)}>
                  <div className="contact-avatar">{student?.full_name?.[0] || '?'}</div>
                  <div className="followup-main"><strong>{student?.full_name || `Ученик #${deal.student_id}`}</strong><span>{deal.product}</span></div>
                  <div className="followup-when"><span className={`due-badge due-${due.key}`}>{due.label}</span><small>{formatDate(deal.next_contact_at)}</small></div>
                  <ChevronRight size={17} />
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <section className="panel recent-panel">
        <div className="panel-header">
          <div><h2>Последние контакты</h2><p>Новые лиды и недавние обновления</p></div>
          <UsersRound size={20} />
        </div>
        <div className="student-list-compact">
          {students.slice(0, 6).map((student) => (
            <button key={student.id} className="compact-student" onClick={() => onStudent(student)}>
              <div className="contact-avatar">{student.full_name[0]}</div>
              <div className="compact-main"><strong>{student.full_name}</strong><span>{student.exam || 'Экзамен не указан'} · {student.subject || 'Предмет не указан'}</span></div>
              <StatusBadge status={student.status} />
              <span className="muted desktop-only">{student.owner || 'Без ответственного'}</span>
              <ArrowRight size={17} />
            </button>
          ))}
          {students.length === 0 && <EmptyState compact icon={UsersRound} title="Пока пусто" text="Добавьте первого лида — он появится здесь." />}
        </div>
      </section>
    </div>
  )
}
