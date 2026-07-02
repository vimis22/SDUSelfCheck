import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, UserCheck, BookOpen, ClipboardList, FileText, Settings } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import { useAuth } from '../auth/AuthContext.tsx';

const API = 'http://localhost:8081';

type StatsResponse = {
    userCount: number;
    studentCount: number;
    teacherCount: number;
    courseCount: number;
    activeEnrollmentCount: number;
    activeExamRegistrationCount: number;
};

type QuickLink = {
    label: string;
    description: string;
    route: string;
    icon: React.ReactNode;
    stat?: number;
    statLabel?: string;
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetch(`${API}/api/admin/stats`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setStats(data); })
            .catch(() => {});
    }, []);

    const quickLinks: QuickLink[] = [
        {
            label: 'Brugere',
            description: 'Administrer login-brugere og roller. Deaktivér eller aktivér adgang.',
            route: '/admin/users',
            icon: <Users size={22} color="#1a4fa8" />,
            stat: stats?.userCount,
            statLabel: 'brugere',
        },
        {
            label: 'Studerende',
            description: 'Oversigt over alle oprettede studentprofiler.',
            route: '/admin/students',
            icon: <GraduationCap size={22} color="#7c3aed" />,
            stat: stats?.studentCount,
            statLabel: 'studerende',
        },
        {
            label: 'Undervisere',
            description: 'Oversigt over alle undervisere og afdelinger.',
            route: '/admin/teachers',
            icon: <UserCheck size={22} color="#0e7490" />,
            stat: stats?.teacherCount,
            statLabel: 'undervisere',
        },
        {
            label: 'Fag',
            description: 'Oversigt over alle fag, ECTS-point og semestre.',
            route: '/admin/courses',
            icon: <BookOpen size={22} color="#065f46" />,
            stat: stats?.courseCount,
            statLabel: 'fag',
        },
        {
            label: 'Eksamen',
            description: 'Oversigt over alle ordinære eksamener og reeksamener.',
            route: '/admin/exams',
            icon: <ClipboardList size={22} color="#92400e" />,
        },
        {
            label: 'Tilmeldinger',
            description: 'Administrer fagstilmeldinger og eksamenregistreringer. Annullér om nødvendigt.',
            route: '/admin/registrations',
            icon: <FileText size={22} color="#7c3aed" />,
            stat: stats ? stats.activeEnrollmentCount + stats.activeExamRegistrationCount : undefined,
            statLabel: 'aktive',
        },
        {
            label: 'Systemadministration',
            description: 'Systemoversigt, testbrugere og miljøinformation.',
            route: '/admin/system',
            icon: <Settings size={22} color="#374151" />,
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Admin" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <div style={{ marginBottom: '28px' }}>
                    <NormalText text="Admin Dashboard" size={28} color="#111" fontWeight={700} />
                    <NormalText
                        text={`Velkommen, ${user?.email ?? 'admin'}. Her administreres systemets data og brugere.`}
                        size={14} color="#666" fontWeight={400}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {quickLinks.map(link => (
                        <button
                            key={link.route}
                            onClick={() => navigate(link.route)}
                            style={{ textAlign: 'left', background: '#fff', border: '1px solid #e5e5e5',
                                borderRadius: '10px', padding: '20px 22px', cursor: 'pointer',
                                transition: 'box-shadow 0.15s', boxShadow: 'none',
                                fontFamily: 'inherit' }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'inline-flex' }}>
                                    {link.icon}
                                </div>
                                {link.stat !== undefined && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#111', lineHeight: 1 }}>{link.stat}</div>
                                        <div style={{ fontSize: '11px', color: '#999' }}>{link.statLabel}</div>
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: '14px' }}>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '4px' }}>
                                    {link.label}
                                </div>
                                <div style={{ fontSize: '13px', color: '#777', lineHeight: '1.4' }}>
                                    {link.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}
