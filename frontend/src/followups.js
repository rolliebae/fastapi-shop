const OPEN_STAGES = new Set(['new', 'diagnostic', 'offer', 'payment'])

const sameDay = (a, b) => a.getFullYear() === b.getFullYear()
  && a.getMonth() === b.getMonth()
  && a.getDate() === b.getDate()

export const isOpenDeal = (deal) => OPEN_STAGES.has(deal.stage)

export function getFollowupBucket(value, now = new Date()) {
  if (!value) return 'none'
  const due = new Date(value)
  if (Number.isNaN(due.getTime())) return 'none'
  if (due < now) return 'overdue'
  if (sameDay(due, now)) return 'today'

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (sameDay(due, tomorrow)) return 'tomorrow'
  return 'later'
}

export const FOLLOWUP_META = {
  overdue: { label: 'Просрочено', tone: 'danger' },
  today: { label: 'Сегодня', tone: 'today' },
  tomorrow: { label: 'Завтра', tone: 'tomorrow' },
  later: { label: 'Позже', tone: 'later' },
  none: { label: 'Без даты', tone: 'none' },
}

export const getFollowupMeta = (value, now = new Date()) => {
  const key = getFollowupBucket(value, now)
  return { key, ...FOLLOWUP_META[key] }
}

export function followupSortValue(deal, now = new Date()) {
  const bucket = getFollowupBucket(deal.next_contact_at, now)
  const rank = { overdue: 0, today: 1, tomorrow: 2, later: 3, none: 4 }[bucket]
  const time = deal.next_contact_at ? new Date(deal.next_contact_at).getTime() : Number.MAX_SAFE_INTEGER
  return rank * 10 ** 15 + (Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time)
}

const toLocalPayload = (date) => {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function tomorrowAtSameTime(value, now = new Date()) {
  const source = value ? new Date(value) : null
  const next = new Date(now)
  next.setDate(next.getDate() + 1)
  if (source && !Number.isNaN(source.getTime())) {
    next.setHours(source.getHours(), source.getMinutes(), 0, 0)
  } else {
    next.setHours(12, 0, 0, 0)
  }
  return toLocalPayload(next)
}
