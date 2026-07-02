import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

const API = 'http://localhost:8081';

type StudentRow = {
    studentId: number;
    studentNumber: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    educationName: string | null;
    semester: number | null;
    enrollmentStatus: string | null;
};

const thStyle: React.CSSProperties = {
    padding: '10px 16px', textAlign: 'left', borderBottom: '2px solid #e5e5e5',
    backgroundColor: '#f7f7f7', fontWeight: 600, fontSize: '12px', color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
    padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'middle', fontSize: '14px', color: '#222',
};

function enrollmentBadge(status: string | null) {
    const active = status === 'ACTIVE';
    return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600,
            backgroundColor: active ? '#e8f4ec' : '#f0f0f0',
            color: active ? '#1a5c2e' : '#555' }}>
            {status ?? '–'}
        </span>
    );
}

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await fetch(`${API}/api/admin/students`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                setStudents(await res.json());
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return s.studentNumber.toLowerCase().includes(q)
            || s.email.toLowerCase().includes(q)
            || (s.firstName ?? '').toLowerCase().includes(q)
            || (s.lastName ?? '').toLowerCase().includes(q);
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Admin / Studerende" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button onClick={() => navigate('/admin-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <NormalText text="Studerende" size={28} color="#111" fontWeight={700} />
                    <NormalText text="Oversigt over alle studerende i systemet." size={14} color="#666" fontWeight={400} />
                </div>

                {error && <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>Fejl: {error}</div>}

                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Søg efter navn, email eller studienummer..."
                    style={{ width: '360px', padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                        fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '20px',
                        boxSizing: 'border-box' }} />

                {loading ? <NormalText text="Henter studerende…" size={14} color="#999" /> : (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['ID', 'Studienr.', 'Navn', 'Email', 'Uddannelse', 'Semester', 'Status'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>Ingen studerende fundet.</td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.studentId}>
                                        <td style={tdStyle}>{s.studentId}</td>
                                        <td style={tdStyle}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#555' }}>
                                                {s.studentNumber}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 500 }}>
                                            {[s.firstName, s.lastName].filter(Boolean).join(' ') || '–'}
                                        </td>
                                        <td style={tdStyle}>{s.email}</td>
                                        <td style={tdStyle}>{s.educationName ?? '–'}</td>
                                        <td style={tdStyle}>{s.semester ?? '–'}</td>
                                        <td style={tdStyle}>{enrollmentBadge(s.enrollmentStatus)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div style={{ marginTop: '12px' }}>
                    <NormalText text={`${filtered.length} studerende vist`} size={12} color="#aaa" />
                </div>
            </main>
        </div>
    );
}
