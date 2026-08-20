import { useMemo } from 'react'
import { ArrowRight, CalendarClock, Check, ChevronRight, CircleDollarSign, GraduationCap, Target, UsersRound } from 'lucide-react'
import { STAGES, formatDate, money } from '../constants'
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

export function Dashboard({ data, students, deals, onStudent }) {
  const upcoming = useMemo(() => deals
    .filter((deal) => deal.next_contact_at && !['won', 'lost'].includes(deal.stage))
    .sort((a, b) => new Date(a.next_contact_at) - new Date(b.next_contact_at))
    .slice(0, 5), [deals])

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
            {stageCounts.map((stage) => (
              <div className="funnel-row" key={stage.key}>
                <div className="funnel-meta"><span>{stage.label}</span><strong>{stage.count}</strong></div>
                <div className="funnel-track"><div className="funnel-fill" style={{ width: `${Math.max(6, (stage.count / maxStage) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel followups-panel">
          <div className="panel-header">
            <div><h2>Ближайшие касания</h2><p>Кому нельзя забыть написать</p></div>
            <CalendarClock size={20} />
          </div>
          <div className="followups-list">
            {upcoming.length === 0 ? (
              <EmptyState compact icon={Check} title="Касаний пока нет" text="Добавьте дату следующего контакта в сделке." />
            ) : upcoming.map((deal) => {
              const student = studentMap[deal.student_id]
              return (
                <button className="followup-row" key={deal.id} onClick={() => student && onStudent(student)}>
                  <div className="contact-avatar">{student?.full_name?.[0] || '?'}</div>
                  <div className="followup-main"><strong>{student?.full_name || `Ученик #${deal.student_id}`}</strong><span>{deal.product}</span></div>
                  <div className="followup-date">{formatDate(deal.next_contact_at)}</div>
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
