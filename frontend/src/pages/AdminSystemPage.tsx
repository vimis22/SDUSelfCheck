import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

const API = 'http://localhost:8081';

type StatsResponse = {
    userCount: number;
    studentCount: number;
    teacherCount: number;
    courseCount: number;
    activeEnrollmentCount: number;
    activeExamRegistrationCount: number;
};

type StatCard = { label: string; value: number; description: string };

export default function AdminSystemPage() {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await fetch(`${API}/api/admin/stats`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                setStats(await res.json());
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const statCards: StatCard[] = stats ? [
        { label: 'Brugere',                  value: stats.userCount,                  description: 'Totalt antal login-brugere' },
        { label: 'Studerende',               value: stats.studentCount,               description: 'Oprettede studentprofiler' },
        { label: 'Undervisere',              value: stats.teacherCount,               description: 'Oprettede lærerprofiler' },
        { label: 'Fag',                      value: stats.courseCount,                description: 'Registrerede fag' },
        { label: 'Aktive fagstilmeldinger',  value: stats.activeEnrollmentCount,      description: 'Status: ENROLLED' },
        { label: 'Aktive eksamentilmelding', value: stats.activeExamRegistrationCount, description: 'Status: REGISTERED' },
    ] : [];

    const testUsers = [
        { role: 'STUDENT', email: 'student@sdu.dk', password: 'password' },
        { role: 'TEACHER', email: 'teacher@sdu.dk', password: 'password' },
        { role: 'ADMIN',   email: 'admin@sdu.dk',   password: 'password' },
    ];

    const roleColors: Record<string, { bg: string; color: string }> = {
        STUDENT: { bg: '#e0ecff', color: '#1a4fa8' },
        TEACHER: { bg: '#f3e8ff', color: '#7c3aed' },
        ADMIN:   { bg: '#fff3cd', color: '#856404' },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Admin / Systemadministration" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button onClick={() => navigate('/admin-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ marginBottom: '28px' }}>
                    <NormalText text="Systemadministration" size={28} color="#111" fontWeight={700} />
                    <NormalText text="Systemoversigt og driftsinformation." size={14} color="#666" fontWeight={400} />
                </div>

                {error && <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '20px' }}>Fejl: {error}</div>}

                {/* System status indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px',
                    padding: '14px 20px', backgroundColor: '#f0fdf4', border: '1px solid #86efac',
                    borderRadius: '10px', width: 'fit-content' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#166534' }}>
                        System online — Backend kørende på port 8081
                    </span>
                </div>

                {/* Stats cards */}
                <div style={{ marginBottom: '32px' }}>
                    <NormalText text="Systemstatistik" size={16} color="#111" fontWeight={600} />
                    <div style={{ marginTop: '12px' }}>
                        {loading ? <NormalText text="Henter statistik…" size={14} color="#999" /> : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                {statCards.map(card => (
                                    <div key={card.label} style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5',
                                        borderRadius: '10px', padding: '20px 24px' }}>
                                        <div style={{ fontSize: '32px', fontWeight: 700, color: '#111', lineHeight: 1 }}>
                                            {card.value}
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginTop: '6px' }}>
                                            {card.label}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                                            {card.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Test users */}
                <div style={{ marginBottom: '32px' }}>
                    <NormalText text="Testbrugere" size={16} color="#111" fontWeight={600} />
                    <div style={{ marginTop: '12px', backgroundColor: '#fff', border: '1px solid #e5e5e5',
                        borderRadius: '10px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Rolle', 'Email', 'Adgangskode'].map(h => (
                                        <th key={h} style={{
                                            padding: '10px 16px', textAlign: 'left', borderBottom: '2px solid #e5e5e5',
                                            backgroundColor: '#f7f7f7', fontWeight: 600, fontSize: '12px', color: '#888',
                                            textTransform: 'uppercase', letterSpacing: '0.04em',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {testUsers.map(u => (
                                    <tr key={u.role}>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' }}>
                                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                fontSize: '12px', fontWeight: 600,
                                                backgroundColor: roleColors[u.role].bg, color: roleColors[u.role].color }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
                                            fontFamily: 'monospace', fontSize: '13px', color: '#333' }}>
                                            {u.email}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
                                            fontFamily: 'monospace', fontSize: '13px', color: '#888' }}>
                                            {u.password}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Environment info */}
                <div>
                    <NormalText text="Miljøinformation" size={16} color="#111" fontWeight={600} />
                    <div style={{ marginTop: '12px', backgroundColor: '#fff', border: '1px solid #e5e5e5',
                        borderRadius: '10px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { key: 'Backend URL',     val: 'http://localhost:8081' },
                            { key: 'Frontend URL',    val: 'http://localhost:5173' },
                            { key: 'Database',        val: 'PostgreSQL — port 5433' },
                            { key: 'Auth',            val: 'Simpel email/password (localStorage)' },
                        ].map(({ key, val }) => (
                            <div key={key} style={{ display: 'flex', gap: '16px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#555', minWidth: '160px' }}>{key}</span>
                                <span style={{ fontSize: '13px', color: '#888', fontFamily: 'monospace' }}>{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
