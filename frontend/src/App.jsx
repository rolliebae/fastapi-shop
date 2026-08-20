import { useEffect, useMemo, useState } from 'react'
import { api } from './api'
import { AddStudentModal } from './components/AddStudentModal'
import { Dashboard } from './components/Dashboard'
import { Pipeline } from './components/Pipeline'
import { NAV, Sidebar, Topbar } from './components/Shell'
import { StudentDrawer } from './components/StudentDrawer'
import { Students } from './components/Students'

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [students, setStudents] = useState([])
  const [deals, setDeals] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const load = async () => {
    setError('')
    try {
      const [dashboardData, studentData, dealData] = await Promise.all([api.dashboard(), api.students(), api.deals()])
      setDashboard(dashboardData); setStudents(studentData); setDeals(dealData)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return students
    return students.filter((student) => [student.full_name, student.phone, student.telegram, student.parent_name, student.source, student.owner].filter(Boolean).some((value) => value.toLowerCase().includes(q)))
  }, [students, search])

  const moveDeal = async (deal, stage) => {
    const previous = deals
    setDeals((current) => current.map((item) => item.id === deal.id ? { ...item, stage: stage.key, probability: stage.probability } : item))
    try {
      await api.updateDeal(deal.id, { stage: stage.key, probability: stage.probability })
      const [dashboardData, dealData] = await Promise.all([api.dashboard(), api.deals()])
      setDashboard(dashboardData); setDeals(dealData)
      if (stage.key === 'won') {
        await api.updateStudent(deal.student_id, { status: 'active' })
        setStudents(await api.students())
      }
    } catch (err) { setDeals(previous); setError(err.message) }
  }

  const title = NAV.find((item) => item.key === active)?.label || 'CRM'

  return (
    <div className="app-shell">
      <Sidebar active={active} onChange={setActive} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-area">
        <Topbar title={title} search={search} onSearch={setSearch} onAdd={() => setAddOpen(true)} onMenu={() => setMobileOpen(true)} />
        <div className="content-area">
          {error && <div className="error-banner"><span>{error}</span><button onClick={load}>Повторить</button></div>}
          {loading ? <div className="loading-state"><div className="loader" /><span>Загружаю CRM…</span></div> : (
            <>
              {active === 'dashboard' && <Dashboard data={dashboard} students={filteredStudents} deals={deals} onStudent={setSelectedStudent} />}
              {active === 'pipeline' && <Pipeline students={filteredStudents} deals={deals} onMove={moveDeal} onStudent={setSelectedStudent} />}
              {active === 'students' && <Students students={filteredStudents} onStudent={setSelectedStudent} />}
            </>
          )}
        </div>
      </main>
      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={() => load()} />
      <StudentDrawer student={selectedStudent} deals={deals} onClose={() => setSelectedStudent(null)} onRefresh={load} />
    </div>
  )
}
