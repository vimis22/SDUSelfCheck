import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

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

export default function AdminExamsPage() {
    const [exams, setExams] = useState<ExamRow[]>([]);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await fetch(`${API}/api/exams`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                setExams(await res.json());
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = exams.filter(e => {
        const q = search.toLowerCase();
        const matchSearch = e.title.toLowerCase().includes(q)
            || e.courseCode.toLowerCase().includes(q)
            || e.courseName.toLowerCase().includes(q);
        const matchType = filterType === 'ALL'
            || (filterType === 'ORDINARY' && !e.reexam)
            || (filterType === 'REEXAM' && e.reexam);
        return matchSearch && matchType;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Admin / Eksamen" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button onClick={() => navigate('/admin-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <NormalText text="Eksamen" size={28} color="#111" fontWeight={700} />
                    <NormalText text="Oversigt over alle eksamener i systemet." size={14} color="#666" fontWeight={400} />
                </div>

                {error && <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>Fejl: {error}</div>}

                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Søg efter titel eller fag..."
                        style={{ flex: 1, padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                            fontSize: '14px', fontFamily: 'inherit', outline: 'none' }} />
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}
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
                                    {['ID', 'Titel', 'Fag', 'Dato', 'Tid', 'Lokale', 'Type'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>Ingen eksamener fundet.</td></tr>
                                ) : filtered.map(e => (
                                    <tr key={e.examId}>
                                        <td style={tdStyle}>{e.examId}</td>
                                        <td style={{ ...tdStyle, fontWeight: 500 }}>{e.title}</td>
                                        <td style={tdStyle}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#555', marginRight: '6px' }}>{e.courseCode}</span>
                                            <span style={{ fontSize: '13px' }}>{e.courseName}</span>
                                        </td>
                                        <td style={tdStyle}>{e.examDate ?? '–'}</td>
                                        <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                                            {e.startTime && e.endTime ? `${e.startTime.slice(0,5)}–${e.endTime.slice(0,5)}` : '–'}
                                        </td>
                                        <td style={tdStyle}>{e.location ?? '–'}</td>
                                        <td style={tdStyle}>
                                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                fontSize: '12px', fontWeight: 600,
                                                backgroundColor: e.reexam ? '#fff3cd' : '#e8f4ec',
                                                color: e.reexam ? '#856404' : '#1a5c2e' }}>
                                                {e.reexam ? 'Reeksamen' : 'Ordinær'}
                                            </span>
                                        </td>
                                    </tr>
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
