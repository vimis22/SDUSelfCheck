import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

import SidePanel from './navigationpages/SidePanel.tsx';
import { AuthProvider, useAuth } from './auth/AuthContext.tsx';
import type { UserRole } from './auth/AuthContext.tsx';

import DashboardPage from './pages/DashboardPage';
import ResultsPage from './pages/ResultsPage';
import CoursesPage from './pages/CoursesPage';
import ExamsPage from './pages/ExamsPage';
import DocumentsPage from './pages/DocumentsPage';
import StudentProfileCard from './pages/StudentProfileCard.tsx';
import HelpSupportPage from './pages/HelpSupportPage';
import LoginPage from './pages/LoginPage';

import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

// ── Redirect to role-appropriate home after login ─────────────────────────────
function RoleHome() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'STUDENT') return <Navigate to="/student-dashboard" replace />;
    if (user.role === 'TEACHER') return <Navigate to="/teacher-dashboard" replace />;
    if (user.role === 'ADMIN')   return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/login" replace />;
}

// ── Layout guard — requires authenticated user ────────────────────────────────
function AppLayout() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return (
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            <SidePanel />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </div>
        </div>
    );
}

// ── Route guard — requires specific role(s) ───────────────────────────────────
function ProtectedRoute({ allowedRoles, children }: { allowedRoles: UserRole[]; children: ReactNode }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', flex: 1, padding: '60px 40px',
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '8px' }}>
                    Adgang nægtet
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                    Du har ikke adgang til denne side.
                </div>
            </div>
        );
    }
    return <>{children}</>;
}

// ── App ───────────────────────────────────────────────────────────────────────
function AppRoutes() {
    return (
        <Routes>
            {/* Public route — no SidePanel */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated routes — with SidePanel */}
            <Route element={<AppLayout />}>
                {/* Root redirects to role-appropriate home */}
                <Route path="/" element={<RoleHome />} />

                {/* General pages (all authenticated roles) */}
                <Route path="/help" element={<HelpSupportPage />} />
                <Route path="/exams" element={<ExamsPage />} />

                {/* Student-only pages */}
                <Route path="/student-dashboard" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <StudentDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/courses" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <CoursesPage />
                    </ProtectedRoute>
                } />
                <Route path="/results" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <ResultsPage />
                    </ProtectedRoute>
                } />
                <Route path="/documents" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <DocumentsPage />
                    </ProtectedRoute>
                } />
                <Route path="/student-card" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <StudentProfileCard />
                    </ProtectedRoute>
                } />

                {/* Teacher-only pages */}
                <Route path="/teacher-dashboard" element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                        <TeacherDashboard />
                    </ProtectedRoute>
                } />

                {/* Admin-only pages */}
                <Route path="/admin-dashboard" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                {/* Legacy DashboardPage — kept for backward compat */}
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
