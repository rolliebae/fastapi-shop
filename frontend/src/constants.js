export const STAGES = [
  { key: 'new', label: 'Новый лид', probability: 10 },
  { key: 'diagnostic', label: 'Диагностика', probability: 30 },
  { key: 'offer', label: 'Предложение', probability: 55 },
  { key: 'payment', label: 'Оплата', probability: 80 },
  { key: 'won', label: 'Ученик', probability: 100 },
  { key: 'lost', label: 'Отказ', probability: 0 },
]

export const money = (value = 0) => new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
}).format(value)

export const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}
