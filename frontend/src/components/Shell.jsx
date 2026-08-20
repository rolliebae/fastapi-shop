import { LayoutDashboard, ListTodo, Menu, Plus, Search, Sparkles, Target, UsersRound, X } from 'lucide-react'

const NAV = [
  { key: 'dashboard', label: 'Обзор', icon: LayoutDashboard },
  { key: 'tasks', label: 'Задачи', icon: ListTodo },
  { key: 'pipeline', label: 'Воронка', icon: Target },
  { key: 'students', label: 'Ученики', icon: UsersRound },
]

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">M</div>
      <div>
        <div className="brand-name">Мелскул</div>
        <div className="brand-subtitle">CRM</div>
      </div>
    </div>
  )
}

export function Sidebar({ active, onChange, mobileOpen, onClose, taskCount = 0, overdueCount = 0 }) {
  return (
    <>
      {mobileOpen && <button className="mobile-backdrop" aria-label="Закрыть меню" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="icon-button mobile-only" onClick={onClose} aria-label="Закрыть меню"><X size={18} /></button>
        </div>
        <nav className="nav-list">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} className={`nav-item ${active === key ? 'active' : ''}`} onClick={() => { onChange(key); onClose(); }}>
              <Icon size={18} />
              <span>{label}</span>
              {key === 'tasks' && taskCount > 0 && <span className={`nav-badge ${overdueCount > 0 ? 'danger' : ''}`}>{taskCount}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <Sparkles size={17} />
          <div>
            <strong>Фокус дня</strong>
            <span>{overdueCount > 0 ? `Просрочено ${overdueCount}. Всего в фокусе ${taskCount}.` : taskCount > 0 ? `На сегодня осталось ${taskCount} касаний.` : 'Касания на сегодня разобраны.'}</span>
          </div>
        </div>
        <div className="profile-row">
          <div className="avatar">Е</div>
          <div className="profile-copy"><strong>Егор</strong><span>Product · Мелскул</span></div>
        </div>
      </aside>
    </>
  )
}

export function Topbar({ title, search, onSearch, onAdd, onMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-title-wrap">
        <button className="icon-button mobile-only" onClick={onMenu} aria-label="Открыть меню"><Menu size={20} /></button>
        <div>
          <h1>{title}</h1>
          <p>Продажи и сопровождение учеников в одном месте</p>
        </div>
      </div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={18} />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Поиск ученика" />
        </label>
        <button className="primary-button" onClick={onAdd}><Plus size={18} />Добавить ученика</button>
      </div>
    </header>
  )
}

export { NAV }
