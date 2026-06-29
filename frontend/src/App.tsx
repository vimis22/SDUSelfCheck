import { Routes, Route, Outlet, Navigate } from 'react-router-dom'

import SidePanel from './navigationpages/SidePanel.tsx'

import DashboardPage from './pages/DashboardPage'
import ResultsPage from './pages/ResultsPage'
import CoursesPage from './pages/CoursesPage'
import ExamsPage from './pages/ExamsPage'
import DocumentsPage from './pages/DocumentsPage'
import StudentProfileCard from './pages/StudentProfileCard.tsx'
import HelpSupportPage from './pages/HelpSupportPage'
import LoginPage from './pages/LoginPage'

import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminDashboard from './pages/AdminDashboard'

function AppLayout() {
    return (
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            <SidePanel />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </div>
        </div>
    )
}

function App() {
    return (
        <Routes>
            {/* Offentlig rute — ingen SidePanel */}
            <Route path="/login" element={<LoginPage />} />

            {/* Interne ruter — med SidePanel */}
            <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />

                {/* Existing student/self-service pages */}
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/exams" element={<ExamsPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/student-card" element={<StudentProfileCard />} />
                <Route path="/help" element={<HelpSupportPage />} />

                {/* Role-based dashboard prototype pages */}
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App;