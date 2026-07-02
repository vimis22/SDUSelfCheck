import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

const API = 'http://localhost:8081';

type EnrollmentRow = {
    enrollmentId: number;
    studentId: number;
    studentNumber: string;
    studentFirstName: string | null;
    studentLastName: string | null;
    courseId: number;
    courseCode: string;
    courseName: string;
    status: string;
    enrolledAt: string | null;
};

type ExamRegRow = {
    examRegistrationId: number;
    studentId: number;
    studentNumber: string;
    studentFirstName: string | null;
    studentLastName: string | null;
    examId: number;
    examTitle: string;
    reexam: boolean | null;
    courseId: number;
    courseCode: string;
    courseName: string;
    status: string;
    attemptNumber: number | null;
    registeredAt: string | null;
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

function statusBadge(status: string) {
    const map: Record<string, { bg: string; color: string }> = {
        ENROLLED:   { bg: '#e8f4ec', color: '#1a5c2e' },
        REGISTERED: { bg: '#e8f4ec', color: '#1a5c2e' },
        CANCELLED:  { bg: '#fef2f2', color: '#b91c1c' },
    };
    const s = map[status] ?? { bg: '#f0f0f0', color: '#555' };
    return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600, backgroundColor: s.bg, color: s.color }}>
            {status}
        </span>
    );
}

type Tab = 'courses' | 'exams';

export default function AdminRegistrationsPage() {
    const [tab, setTab] = useState<Tab>('courses');

    const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
    const [examRegs, setExamRegs] = useState<ExamRegRow[]>([]);
    const [loadingE, setLoadingE] = useState(true);
    const [loadingX, setLoadingX] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    const [searchE, setSearchE] = useState('');
    const [searchX, setSearchX] = useState('');

    const navigate = useNavigate();

    const fetchEnrollments = async () => {
        setLoadingE(true);
        try {
            const res = await fetch(`${API}/api/admin/course-registrations`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setEnrollments(await res.json());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
        } finally {
            setLoadingE(false);
        }
    };

    const fetchExamRegs = async () => {
        setLoadingX(true);
        try {
            const res = await fetch(`${API}/api/admin/exam-registrations`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setExamRegs(await res.json());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
        } finally {
            setLoadingX(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
        fetchExamRegs();
    }, []);

    const cancelEnrollment = async (id: number) => {
        setActionMsg(null); setError(null);
        try {
            const res = await fetch(`${API}/api/admin/course-registrations/${id}/cancel`, { method: 'PATCH' });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message ?? 'Fejl.');
            setActionMsg(data?.message ?? 'Tilmelding annulleret.');
            await fetchEnrollments();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl.');
        }
    };

    const cancelExamReg = async (id: number) => {
        setActionMsg(null); setError(null);
        try {
            const res = await fetch(`${API}/api/admin/exam-registrations/${id}/cancel`, { method: 'PATCH' });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message ?? 'Fejl.');
            setActionMsg(data?.message ?? 'Eksamenregistrering annulleret.');
            await fetchExamRegs();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl.');
        }
    };

    const filteredE = enrollments.filter(e => {
        const q = searchE.toLowerCase();
        return e.studentNumber.toLowerCase().includes(q)
            || (e.studentFirstName ?? '').toLowerCase().includes(q)
            || (e.studentLastName ?? '').toLowerCase().includes(q)
            || e.courseCode.toLowerCase().includes(q)
            || e.courseName.toLowerCase().includes(q);
    });

    const filteredX = examRegs.filter(r => {
        const q = searchX.toLowerCase();
        return r.studentNumber.toLowerCase().includes(q)
            || (r.studentFirstName ?? '').toLowerCase().includes(q)
            || (r.studentLastName ?? '').toLowerCase().includes(q)
            || r.courseCode.toLowerCase().includes(q)
            || r.courseName.toLowerCase().includes(q)
            || r.examTitle.toLowerCase().includes(q);
    });

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '10px 20px', cursor: 'pointer', border: 'none', background: 'none',
        fontSize: '14px', fontFamily: 'inherit', fontWeight: active ? 600 : 400,
        color: active ? '#111' : '#888',
        borderBottom: active ? '2px solid #111' : '2px solid transparent',
        marginBottom: '-1px',
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Admin / Tilmeldinger" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button onClick={() => navigate('/admin-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <NormalText text="Tilmeldinger" size={28} color="#111" fontWeight={700} />
                    <NormalText text="Administrer fagstilmeldinger og eksamenregistreringer." size={14} color="#666" fontWeight={400} />
                </div>

                {error && <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>Fejl: {error}</div>}
                {actionMsg && <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #86efac',
                    borderRadius: '8px', color: '#166534', fontSize: '14px', marginBottom: '16px' }}>{actionMsg}</div>}

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '20px', display: 'flex' }}>
                    <button style={tabStyle(tab === 'courses')} onClick={() => setTab('courses')}>
                        Fagstilmeldinger ({enrollments.length})
                    </button>
                    <button style={tabStyle(tab === 'exams')} onClick={() => setTab('exams')}>
                        Eksamenregistreringer ({examRegs.length})
                    </button>
                </div>

                {tab === 'courses' && (
                    <>
                        <input value={searchE} onChange={e => setSearchE(e.target.value)}
                            placeholder="Søg efter studienr., navn eller fag..."
                            style={{ width: '360px', padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                                fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '20px',
                                boxSizing: 'border-box' }} />
                        {loadingE ? <NormalText text="Henter fagstilmeldinger…" size={14} color="#999" /> : (
                            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {['ID', 'Studerende', 'Fag', 'Status', 'Tilmeldt', ''].map(h => (
                                                <th key={h || 'action'} style={thStyle}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredE.length === 0 ? (
                                            <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>Ingen tilmeldinger fundet.</td></tr>
                                        ) : filteredE.map(e => (
                                            <tr key={e.enrollmentId}>
                                                <td style={tdStyle}>{e.enrollmentId}</td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 500 }}>
                                                        {[e.studentFirstName, e.studentLastName].filter(Boolean).join(' ') || '–'}
                                                    </div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{e.studentNumber}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 500 }}>{e.courseName}</div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{e.courseCode}</div>
                                                </td>
                                                <td style={tdStyle}>{statusBadge(e.status)}</td>
                                                <td style={tdStyle}>{e.enrolledAt ?? '–'}</td>
                                                <td style={{ ...tdStyle, width: '130px' }}>
                                                    {e.status === 'ENROLLED' && (
                                                        <button onClick={() => cancelEnrollment(e.enrollmentId)}
                                                            style={{ padding: '6px 14px', backgroundColor: '#9b1c1c', color: '#fff',
                                                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                                fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}>
                                                            Annullér
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div style={{ marginTop: '12px' }}>
                            <NormalText text={`${filteredE.length} tilmelding(er) vist`} size={12} color="#aaa" />
                        </div>
                    </>
                )}

                {tab === 'exams' && (
                    <>
                        <input value={searchX} onChange={e => setSearchX(e.target.value)}
                            placeholder="Søg efter studienr., navn eller eksamen..."
                            style={{ width: '360px', padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                                fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '20px',
                                boxSizing: 'border-box' }} />
                        {loadingX ? <NormalText text="Henter eksamenregistreringer…" size={14} color="#999" /> : (
                            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {['ID', 'Studerende', 'Eksamen', 'Type', 'Forsøg', 'Status', 'Registreret', ''].map(h => (
                                                <th key={h || 'action'} style={thStyle}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredX.length === 0 ? (
                                            <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>Ingen registreringer fundet.</td></tr>
                                        ) : filteredX.map(r => (
                                            <tr key={r.examRegistrationId}>
                                                <td style={tdStyle}>{r.examRegistrationId}</td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 500 }}>
                                                        {[r.studentFirstName, r.studentLastName].filter(Boolean).join(' ') || '–'}
                                                    </div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{r.studentNumber}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 500 }}>{r.examTitle}</div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{r.courseCode} · {r.courseName}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                        fontSize: '12px', fontWeight: 600,
                                                        backgroundColor: r.reexam ? '#fff3cd' : '#e8f4ec',
                                                        color: r.reexam ? '#856404' : '#1a5c2e' }}>
                                                        {r.reexam ? 'Reeksamen' : 'Ordinær'}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>{r.attemptNumber ?? '–'}</td>
                                                <td style={tdStyle}>{statusBadge(r.status)}</td>
                                                <td style={tdStyle}>{r.registeredAt ?? '–'}</td>
                                                <td style={{ ...tdStyle, width: '130px' }}>
                                                    {r.status === 'REGISTERED' && (
                                                        <button onClick={() => cancelExamReg(r.examRegistrationId)}
                                                            style={{ padding: '6px 14px', backgroundColor: '#9b1c1c', color: '#fff',
                                                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                                fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}>
                                                            Annullér
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div style={{ marginTop: '12px' }}>
                            <NormalText text={`${filteredX.length} registrering(er) vist`} size={12} color="#aaa" />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
