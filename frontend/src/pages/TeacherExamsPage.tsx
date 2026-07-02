import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import { useAuth } from '../auth/AuthContext.tsx';

const API = 'http://localhost:8081';

type ExamRow = {
    examId: number;
    title: string;
    examType: string | null;
    examDate: string | null;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    reexam: boolean | null;
    courseId: number;
    courseCode: string;
    courseName: string;
    registrationCount: number;
};

type RegRow = {
    examRegistrationId: number;
    studentId: number;
    studentNumber: string;
    studentFirstName: string | null;
    studentLastName: string | null;
    status: string;
    attemptNumber: number | null;
    hasResult: boolean;
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

export default function TeacherExamsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const teacherId = user?.teacherId;

    const [exams, setExams] = useState<ExamRow[]>([]);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'ORDINARY' | 'REEXAM'>('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [expandedExamId, setExpandedExamId] = useState<number | null>(null);
    const [regsMap, setRegsMap] = useState<Record<number, RegRow[]>>({});
    const [loadingRegs, setLoadingRegs] = useState<number | null>(null);

    useEffect(() => {
        if (!teacherId) return;
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await fetch(`${API}/api/teachers/${teacherId}/exams`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                setExams(await res.json());
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
            } finally {
                setLoading(false);
            }
        })();
    }, [teacherId]);

    const toggleRegs = async (examId: number) => {
        if (expandedExamId === examId) { setExpandedExamId(null); return; }
        setExpandedExamId(examId);
        if (regsMap[examId]) return;

        setLoadingRegs(examId);
        try {
            const res = await fetch(`${API}/api/teachers/${teacherId}/exams/${examId}/registrations`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: RegRow[] = await res.json();
            setRegsMap(prev => ({ ...prev, [examId]: data }));
        } catch {
            setRegsMap(prev => ({ ...prev, [examId]: [] }));
        } finally {
            setLoadingRegs(null);
        }
    };

    if (!teacherId) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
                <TopBar breadcrumb="Teacher / Eksamen" />
                <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <NormalText text="Teacher ID mangler. Log ind igen." size={16} color="#b91c1c" fontWeight={600} />
                </main>
            </div>
        );
    }

    const filtered = exams.filter(e => {
        const q = search.toLowerCase();
        const matchSearch = e.title.toLowerCase().includes(q)
            || e.courseCode.toLowerCase().includes(q)
            || e.courseName.toLowerCase().includes(q);
        const matchType = filterType === 'ALL'
            || (filterType === 'ORDINARY' && !e.reexam)
            || (filterType === 'REEXAM' && !!e.reexam);
        return matchSearch && matchType;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Teacher / Eksamen" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button onClick={() => navigate('/teacher-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <NormalText text="Eksamen" size={28} color="#111" fontWeight={700} />
                    <NormalText text="Oversigt over eksamener for dine fag." size={14} color="#666" fontWeight={400} />
                </div>

                {error && <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>Fejl: {error}</div>}

                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Søg efter titel eller fag..."
                        style={{ flex: 1, padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                            fontSize: '14px', fontFamily: 'inherit', outline: 'none' }} />
                    <select value={filterType} onChange={e => setFilterType(e.target.value as 'ALL' | 'ORDINARY' | 'REEXAM')}
                        style={{ padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                            fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#fff', cursor: 'pointer' }}>
                        <option value="ALL">Alle typer</option>
                        <option value="ORDINARY">Ordinær eksamen</option>
                        <option value="REEXAM">Reeksamen</option>
                    </select>
                </div>

                {loading ? <NormalText text="Henter eksamener…" size={14} color="#999" /> : (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Fag', 'Eksamen', 'Type', 'Dato', 'Tilmeldte', ''].map(h => (
                                        <th key={h || 'action'} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>
                                        Ingen eksamener fundet.
                                    </td></tr>
                                ) : filtered.map(e => (
                                    <React.Fragment key={e.examId}>
                                        <tr>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 500 }}>{e.courseName}</div>
                                                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{e.courseCode}</div>
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 500 }}>{e.title}</td>
                                            <td style={tdStyle}>
                                                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                    fontSize: '12px', fontWeight: 600,
                                                    backgroundColor: e.reexam ? '#fff3cd' : '#e8f4ec',
                                                    color: e.reexam ? '#856404' : '#1a5c2e' }}>
                                                    {e.reexam ? 'Reeksamen' : 'Ordinær'}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{e.examDate ?? '–'}</td>
                                            <td style={tdStyle}>
                                                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                    fontSize: '12px', fontWeight: 600, backgroundColor: '#e0ecff', color: '#1a4fa8' }}>
                                                    {e.registrationCount}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
                                                <button onClick={() => toggleRegs(e.examId)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px',
                                                        padding: '6px 12px', backgroundColor: '#fff', color: '#333',
                                                        border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer',
                                                        fontSize: '13px', fontFamily: 'inherit', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                    {expandedExamId === e.examId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    Se tilmeldte
                                                </button>
                                                <button onClick={() => navigate('/teacher/grades')}
                                                    style={{ padding: '6px 12px', backgroundColor: '#2f472c', color: '#fff',
                                                        border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                        fontSize: '13px', fontFamily: 'inherit', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    Karakterer
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded registrations panel */}
                                        {expandedExamId === e.examId && (
                                            <tr>
                                                <td colSpan={6} style={{ padding: '0', backgroundColor: '#f9fafb' }}>
                                                    <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e5e5' }}>
                                                        <NormalText text={`Tilmeldte — ${e.title}`}
                                                            size={13} color="#555" fontWeight={600} />
                                                        {loadingRegs === e.examId ? (
                                                            <NormalText text="Henter tilmeldinger…" size={13} color="#999" />
                                                        ) : (regsMap[e.examId] ?? []).length === 0 ? (
                                                            <NormalText text="Ingen tilmeldte." size={13} color="#aaa" />
                                                        ) : (
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                                                <thead>
                                                                    <tr>
                                                                        {['Studienr.', 'Navn', 'Status', 'Forsøg', 'Har karakter'].map(h => (
                                                                            <th key={h} style={{ ...thStyle, backgroundColor: '#efefef' }}>{h}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(regsMap[e.examId] ?? []).map(r => (
                                                                        <tr key={r.examRegistrationId}>
                                                                            <td style={tdStyle}>
                                                                                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#555' }}>{r.studentNumber}</span>
                                                                            </td>
                                                                            <td style={{ ...tdStyle, fontWeight: 500 }}>
                                                                                {[r.studentFirstName, r.studentLastName].filter(Boolean).join(' ') || '–'}
                                                                            </td>
                                                                            <td style={tdStyle}>
                                                                                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
                                                                                    fontSize: '12px', fontWeight: 600,
                                                                                    backgroundColor: r.status === 'REGISTERED' ? '#e0ecff' : '#fef2f2',
                                                                                    color: r.status === 'REGISTERED' ? '#1a4fa8' : '#b91c1c' }}>
                                                                                    {r.status}
                                                                                </span>
                                                                            </td>
                                                                            <td style={tdStyle}>{r.attemptNumber ?? '–'}</td>
                                                                            <td style={tdStyle}>
                                                                                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
                                                                                    fontSize: '12px', fontWeight: 600,
                                                                                    backgroundColor: r.hasResult ? '#e8f4ec' : '#f0f0f0',
                                                                                    color: r.hasResult ? '#1a5c2e' : '#888' }}>
                                                                                    {r.hasResult ? 'Ja' : 'Nej'}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div style={{ marginTop: '12px' }}>
                    <NormalText text={`${filtered.length} eksamen(er) vist`} size={12} color="#aaa" />
                </div>
            </main>
        </div>
    );
}
