import { Routes, Route } from 'react-router-dom'
import SidePanel from './navigationpages/SidePanel.tsx'
import DashboardPage from './pages/DashboardPage'
import ResultsPage from './pages/ResultsPage'
import CoursesPage from './pages/CoursesPage'
import ExamsPage from './pages/ExamsPage'
import DocumentsPage from './pages/DocumentsPage'
import StudentCardPage from './pages/StudentCardPage'
import LoginPage from './pages/LoginPage'

function App() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <SidePanel />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Routes>
                    <Route path="/"            element={<DashboardPage />} />
                    <Route path="/login"       element={<LoginPage />} />
                    <Route path="/results"     element={<ResultsPage />} />
                    <Route path="/courses"     element={<CoursesPage />} />
                    <Route path="/exams"       element={<ExamsPage />} />
                    <Route path="/documents"   element={<DocumentsPage />} />
                    <Route path="/student-card" element={<StudentCardPage />} />
                </Routes>
            </div>
        </div>
    )
}

export default App
