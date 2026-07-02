import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import { useAuth } from '../auth/AuthContext.tsx';

const API = 'http://localhost:8081';
const GRADES = ['12', '10', '7', '4', '02', '00', '-3'] as const;

type PendingReg = {
    examRegistrationId: number;
    studentId: number;
    studentNumber: string;
    studentFirstName: string;
    studentLastName: string;
    examId: number;
    examTitle: string;
    examType: string;
    examDate: string;
    courseId: number;
    courseCode: string;
    courseName: string;
    status: string;
    attemptNumber: number;
};

type GradeResult = {
    gradeResultId: number;
    examRegistrationId: number;
    studentId?: number;
    studentNumber?: string;
    studentFirstName?: string;
    studentLastName?: string;
    examId?: number;
    examTitle?: string;
    examType?: string;
    examDate?: string;
    courseId?: number;
    courseCode?: string;
    courseName?: string;
    gradeValue: string;
    ectsGrade?: string;
    passed: boolean;
    feedback?: string;
    gradedAt?: string;
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

function calcEcts(g: string) {
    return { '12': 'A', '10': 'B', '7': 'C', '4': 'D', '02': 'E', '00': 'Fx', '-3': 'F' }[g] ?? '';
}
function calcPassed(g: string) {
    return g === '12' || g === '10' || g === '7' || g === '4' || g === '02';
}

function PassedBadge({ passed }: { passed: boolean }) {
    return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600,
            backgroundColor: passed ? '#e8f4ec' : '#fef2f2',
            color: passed ? '#1a5c2e' : '#b91c1c' }}>
            {passed ? 'Bestået' : 'Ikke bestået'}
        </span>
    );
}

type Tab = 'pending' | 'graded';

export default function TeacherGradesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const teacherId = user?.teacherId;

    const [tab, setTab] = useState<Tab>('pending');

    const [pending, setPending] = useState<PendingReg[]>([]);
    const [graded, setGraded] = useState<GradeResult[]>([]);
    const [loadingP, setLoadingP] = useState(true);
    const [loadingG, setLoadingG] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    const [searchP, setSearchP] = useState('');
    const [searchG, setSearchG] = useState('');

    // Create form state
    const [creating, setCreating] = useState<PendingReg | null>(null);
    const [createGrade, setCreateGrade] = useState('12');
    const [createFeedback, setCreateFeedback] = useState('');
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editing, setEditing] = useState<GradeResult | null>(null);
    const [editGrade, setEditGrade] = useState('12');
    const [editFeedback, setEditFeedback] = useState('');

    const fetchPending = async () => {
        if (!teacherId) return;
        setLoadingP(true);
        try {
            const res = await fetch(`${API}/api/teachers/${teacherId}/exam-registrations/missing-results`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setPending(await res.json());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
        } finally {
            setLoadingP(false);
        }
    };

    const fetchGraded = async () => {
        if (!teacherId) return;
        setLoadingG(true);
        try {
            const res = await fetch(`${API}/api/grade-results/teacher/${teacherId}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setGraded(await res.json());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
        } finally {
            setLoadingG(false);
        }
    };

    useEffect(() => {
        fetchPending();
        fetchGraded();
    }, [teacherId]);

    const startCreate = (reg: PendingReg) => {
        setCreating(reg);
        setCreateGrade('12');
        setCreateFeedback('');
        setActionMsg(null);
        setError(null);
    };

    const cancelCreate = () => { setCreating(null); };

    const saveCreate = async () => {
        if (!creating || !teacherId) return;
        setSaving(true); setError(null);
        try {
            const body = {
                examRegistrationId: creating.examRegistrationId,
                teacherId,
                gradeValue: createGrade,
                ectsGrade: calcEcts(createGrade),
                passed: calcPassed(createGrade),
                feedback: createFeedback,
            };
            const res = await fetch(`${API}/api/grade-results`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message ?? 'Fejl ved oprettelse.');
            setActionMsg('Karakter gemt.');
            setCreating(null);
            await fetchPending();
            await fetchGraded();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl.');
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (g: GradeResult) => {
        setEditing(g);
        setEditGrade(g.gradeValue);
        setEditFeedback(g.feedback ?? '');
        setActionMsg(null);
        setError(null);
    };

    const cancelEdit = () => { setEditing(null); };

    const saveEdit = async () => {
        if (!editing || !teacherId) return;
        setSaving(true); setError(null);
        try {
            const body = {
                examRegistrationId: editing.examRegistrationId,
                teacherId: editing.teacherId ?? teacherId,
                gradeValue: editGrade,
                ectsGrade: calcEcts(editGrade),
                passed: calcPassed(editGrade),
                feedback: editFeedback,
            };
            const res = await fetch(`${API}/api/grade-results/${editing.gradeResultId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message ?? 'Fejl ved opdatering.');
            setActionMsg('Karakter opdateret.');
            setEditing(null);
            await fetchGraded();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl.');
        } finally {
            setSaving(false);
        }
    };

    const filteredP = pending.filter(r => {
        const q = searchP.toLowerCase();
        return r.studentNumber.toLowerCase().includes(q)
            || r.studentFirstName.toLowerCase().includes(q)
            || r.studentLastName.toLowerCase().includes(q)
            || r.courseName.toLowerCase().includes(q)
            || r.examTitle.toLowerCase().includes(q);
    });

    const filteredG = graded.filter(g => {
        const q = searchG.toLowerCase();
        return (g.studentNumber ?? '').toLowerCase().includes(q)
            || (g.studentFirstName ?? '').toLowerCase().includes(q)
            || (g.studentLastName ?? '').toLowerCase().includes(q)
            || (g.courseName ?? '').toLowerCase().includes(q);
    });

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '10px 20px', cursor: 'pointer', border: 'none', background: 'none',
        fontSize: '14px', fontFamily: 'inherit', fontWeight: active ? 600 : 400,
        color: active ? '#111' : '#888',
        borderBottom: active ? '2px solid #111' : '2px solid transparent',
        marginBottom: '-1px',
    });

    const formCardStyle: React.CSSProperties = {
        backgroundColor: '#f0f7ee', border: '1px solid #d6ead2', borderRadius: '10px',
        padding: '20px 24px', marginBottom: '20px',
    };

    const inputStyle: React.CSSProperties = {
        border: '1px solid #d1d5db', borderRadius: '8px', padding: '9px 12px',
        fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#fff',
    };
    const readOnlyStyle: React.CSSProperties = {
        ...inputStyle, backgroundColor: '#f3f4f6', color: '#374151',
    };

    if (!teacherId) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
                <TopBar breadcrumb="Teacher / Karakterer" />
                <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <NormalText text="Teacher ID mangler. Log ind igen." size={16} color="#b91c1c" fontWeight={600} />
                </main>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Teacher / Karakterer" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button onClick={() => navigate('/teacher-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ marginBottom: '20px' }}>
                    <NormalText text="Karakterer" size={28} color="#111" fontWeight={700} />
                    <NormalText text="Indtast og ret karakterer for dine studerende." size={14} color="#666" fontWeight={400} />
                </div>

                {error && <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>Fejl: {error}</div>}
                {actionMsg && <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #86efac',
                    borderRadius: '8px', color: '#166534', fontSize: '14px', marginBottom: '16px' }}>{actionMsg}</div>}

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '20px', display: 'flex' }}>
                    <button style={tabStyle(tab === 'pending')} onClick={() => setTab('pending')}>
                        Mangler karakter ({pending.length})
                    </button>
                    <button style={tabStyle(tab === 'graded')} onClick={() => setTab('graded')}>
                        Afgivne karakterer ({graded.length})
                    </button>
                </div>

                {/* ── TAB: PENDING ── */}
                {tab === 'pending' && (
                    <>
                        {/* Create form */}
                        {creating && (
                            <div style={formCardStyle}>
                                <NormalText
                                    text={`Indtast karakter — ${creating.studentFirstName} ${creating.studentLastName} · ${creating.courseName}`}
                                    size={14} color="#2f472c" fontWeight={600}
                                />
                                <div style={{ fontSize: '12px', color: '#555', marginBottom: '16px', marginTop: '2px' }}>
                                    {creating.examTitle} · {creating.examType} · Forsøg {creating.attemptNumber}
                                </div>
                                <div style={{ fontSize: '12px', color: '#2f472c', backgroundColor: '#e8f0e6',
                                    padding: '8px 12px', borderRadius: '6px', marginBottom: '16px' }}>
                                    ECTS-grade og bestået-status beregnes automatisk.
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600, fontSize: '13px', color: '#374151' }}>
                                        Karakter
                                        <select value={createGrade} onChange={e => setCreateGrade(e.target.value)} style={inputStyle}>
                                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </label>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600, fontSize: '13px', color: '#374151' }}>
                                        ECTS-grade
                                        <input value={calcEcts(createGrade)} readOnly style={readOnlyStyle} />
                                    </label>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600, fontSize: '13px', color: '#374151' }}>
                                        Status
                                        <input value={calcPassed(createGrade) ? 'Bestået' : 'Ikke bestået'} readOnly style={readOnlyStyle} />
                                    </label>
                                </div>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '16px' }}>
                                    Feedback
                                    <textarea value={createFeedback} onChange={e => setCreateFeedback(e.target.value)}
                                        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                                </label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={saveCreate} disabled={saving}
                                        style={{ padding: '9px 18px', backgroundColor: '#2f472c', color: '#fff',
                                            border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
                                            fontSize: '14px', fontFamily: 'inherit', fontWeight: 600 }}>
                                        {saving ? 'Gemmer…' : 'Gem karakter'}
                                    </button>
                                    <button onClick={cancelCreate}
                                        style={{ padding: '9px 18px', backgroundColor: '#fff', color: '#374151',
                                            border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer',
                                            fontSize: '14px', fontFamily: 'inherit', fontWeight: 600 }}>
                                        Annuller
                                    </button>
                                </div>
                            </div>
                        )}

                        <input value={searchP} onChange={e => setSearchP(e.target.value)}
                            placeholder="Søg efter studienr., navn eller fag..."
                            style={{ width: '360px', padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                                fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '20px',
                                boxSizing: 'border-box' }} />

                        {loadingP ? <NormalText text="Henter eksamenstilmeldinger…" size={14} color="#999" /> : (
                            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {['Reg. ID', 'Studerende', 'Fag', 'Eksamen', 'Type', 'Forsøg', 'Status', ''].map(h => (
                                                <th key={h || 'action'} style={thStyle}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredP.length === 0 ? (
                                            <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>
                                                Ingen tilmeldinger afventer karakter.
                                            </td></tr>
                                        ) : filteredP.map(r => (
                                            <tr key={r.examRegistrationId}
                                                style={{ backgroundColor: creating?.examRegistrationId === r.examRegistrationId ? '#f0f7ee' : undefined }}>
                                                <td style={tdStyle}>{r.examRegistrationId}</td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 500 }}>{r.studentFirstName} {r.studentLastName}</div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{r.studentNumber}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 500 }}>{r.courseName}</div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{r.courseCode}</div>
                                                </td>
                                                <td style={tdStyle}>{r.examTitle}</td>
                                                <td style={tdStyle}>
                                                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                        fontSize: '12px', fontWeight: 600,
                                                        backgroundColor: r.examType === 'REEXAM' ? '#fff3cd' : '#e8f4ec',
                                                        color: r.examType === 'REEXAM' ? '#856404' : '#1a5c2e' }}>
                                                        {r.examType}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>{r.attemptNumber}</td>
                                                <td style={tdStyle}>
                                                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                        fontSize: '12px', fontWeight: 600, backgroundColor: '#e0ecff', color: '#1a4fa8' }}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td style={{ ...tdStyle, width: '150px' }}>
                                                    <button onClick={() => startCreate(r)}
                                                        style={{ padding: '6px 14px', backgroundColor: '#2f472c', color: '#fff',
                                                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                            fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}>
                                                        Indtast karakter
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div style={{ marginTop: '12px' }}>
                            <NormalText text={`${filteredP.length} tilmelding(er) vist`} size={12} color="#aaa" />
                        </div>
                    </>
                )}

                {/* ── TAB: GRADED ── */}
                {tab === 'graded' && (
                    <>
                        {/* Edit form */}
                        {editing && (
                            <div style={formCardStyle}>
                                <NormalText
                                    text={`Ret karakter — ${editing.studentFirstName} ${editing.studentLastName} · ${editing.courseName}`}
                                    size={14} color="#2f472c" fontWeight={600}
                                />
                                <div style={{ fontSize: '12px', color: '#555', marginBottom: '16px', marginTop: '2px' }}>
                                    {editing.examTitle}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600, fontSize: '13px', color: '#374151' }}>
                                        Karakter
                                        <select value={editGrade} onChange={e => setEditGrade(e.target.value)} style={inputStyle}>
                                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </label>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600, fontSize: '13px', color: '#374151' }}>
                                        ECTS-grade
                                        <input value={calcEcts(editGrade)} readOnly style={readOnlyStyle} />
                                    </label>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600, fontSize: '13px', color: '#374151' }}>
                                        Status
                                        <input value={calcPassed(editGrade) ? 'Bestået' : 'Ikke bestået'} readOnly style={readOnlyStyle} />
                                    </label>
                                </div>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '16px' }}>
                                    Feedback
                                    <textarea value={editFeedback} onChange={e => setEditFeedback(e.target.value)}
                                        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                                </label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={saveEdit} disabled={saving}
                                        style={{ padding: '9px 18px', backgroundColor: '#2f472c', color: '#fff',
                                            border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
                                            fontSize: '14px', fontFamily: 'inherit', fontWeight: 600 }}>
                                        {saving ? 'Gemmer…' : 'Gem ændring'}
                                    </button>
                                    <button onClick={cancelEdit}
                                        style={{ padding: '9px 18px', backgroundColor: '#fff', color: '#374151',
                                            border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer',
                                            fontSize: '14px', fontFamily: 'inherit', fontWeight: 600 }}>
                                        Annuller
                                    </button>
                                </div>
                            </div>
                        )}

                        <input value={searchG} onChange={e => setSearchG(e.target.value)}
                            placeholder="Søg efter studienr., navn eller fag..."
                            style={{ width: '360px', padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                                fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '20px',
                                boxSizing: 'border-box' }} />

                        {loadingG ? <NormalText text="Henter karakterer…" size={14} color="#999" /> : (
                            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {['Result ID', 'Studerende', 'Fag', 'Eksamen', 'Karakter', 'ECTS', 'Status', 'Bedømt', ''].map(h => (
                                                <th key={h || 'action'} style={thStyle}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredG.length === 0 ? (
                                            <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>
                                                Ingen afgivne karakterer fundet.
                                            </td></tr>
                                        ) : filteredG.map(g => (
                                            <tr key={g.gradeResultId}
                                                style={{ backgroundColor: editing?.gradeResultId === g.gradeResultId ? '#f0f7ee' : undefined }}>
                                                <td style={tdStyle}>{g.gradeResultId}</td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 500 }}>
                                                        {[g.studentFirstName, g.studentLastName].filter(Boolean).join(' ') || '–'}
                                                    </div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{g.studentNumber ?? '–'}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 500 }}>{g.courseName ?? '–'}</div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{g.courseCode ?? ''}</div>
                                                </td>
                                                <td style={tdStyle}>{g.examTitle ?? '–'}</td>
                                                <td style={tdStyle}><strong>{g.gradeValue}</strong></td>
                                                <td style={tdStyle}>{g.ectsGrade ?? '–'}</td>
                                                <td style={tdStyle}><PassedBadge passed={g.passed} /></td>
                                                <td style={tdStyle}>
                                                    {g.gradedAt ? new Date(g.gradedAt).toLocaleDateString('da-DK') : '–'}
                                                </td>
                                                <td style={{ ...tdStyle, width: '80px' }}>
                                                    <button onClick={() => startEdit(g)}
                                                        style={{ padding: '6px 14px', backgroundColor: '#fff', color: '#2f472c',
                                                            border: '1px solid #2f472c', borderRadius: '6px', cursor: 'pointer',
                                                            fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}>
                                                        Ret
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div style={{ marginTop: '12px' }}>
                            <NormalText text={`${filteredG.length} karakter(er) vist`} size={12} color="#aaa" />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
