import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import { useAuth } from '../auth/AuthContext.tsx';

const API = 'http://localhost:8081';

type CourseRow = {
    courseId: number;
    code: string;
    name: string;
    ects: number | null;
    semesterNumber: number | null;
    mandatory: boolean | null;
    educationName: string | null;
    enrolledStudentCount: number;
};

type StudentRow = {
    studentId: number;
    studentNumber: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    courseStatus: string;
    hasExamRegistration: boolean;
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

function semesterLabel(n: number | null): string {
    if (n === null) return '–';
    if (n === 34) return '3. + 4. sem.';
    return `${n}. sem.`;
}

export default function TeacherCoursesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const teacherId = user?.teacherId;

    const [courses, setCourses] = useState<CourseRow[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Expanded course → students map
    const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
    const [studentsMap, setStudentsMap] = useState<Record<number, StudentRow[]>>({});
    const [loadingStudents, setLoadingStudents] = useState<number | null>(null);

    useEffect(() => {
        if (!teacherId) return;
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await fetch(`${API}/api/teachers/${teacherId}/courses`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                setCourses(await res.json());
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
            } finally {
                setLoading(false);
            }
        })();
    }, [teacherId]);

    const toggleStudents = async (courseId: number) => {
        if (expandedCourseId === courseId) {
            setExpandedCourseId(null);
            return;
        }
        setExpandedCourseId(courseId);
        if (studentsMap[courseId]) return; // already loaded

        setLoadingStudents(courseId);
        try {
            const res = await fetch(`${API}/api/teachers/${teacherId}/courses/${courseId}/students`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: StudentRow[] = await res.json();
            setStudentsMap(prev => ({ ...prev, [courseId]: data }));
        } catch {
            setStudentsMap(prev => ({ ...prev, [courseId]: [] }));
        } finally {
            setLoadingStudents(null);
        }
    };

    if (!teacherId) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
                <TopBar breadcrumb="Teacher / Mine fag" />
                <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <NormalText text="Teacher ID mangler. Log ind igen." size={16} color="#b91c1c" fontWeight={600} />
                </main>
            </div>
        );
    }

    const filtered = courses.filter(c => {
        const q = search.toLowerCase();
        return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Teacher / Mine fag" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button onClick={() => navigate('/teacher-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <NormalText text="Mine fag" size={28} color="#111" fontWeight={700} />
                    <NormalText text="Oversigt over fag du underviser i." size={14} color="#666" fontWeight={400} />
                </div>

                {error && <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>Fejl: {error}</div>}

                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Søg efter fagkode eller fagnavn..."
                    style={{ width: '360px', padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                        fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '20px',
                        boxSizing: 'border-box' }} />

                {loading ? <NormalText text="Henter fag…" size={14} color="#999" /> : (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Kode', 'Navn', 'ECTS', 'Semester', 'Type', 'Tilmeldte', ''].map(h => (
                                        <th key={h || 'action'} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>
                                        Ingen fag fundet.
                                    </td></tr>
                                ) : filtered.map(c => (
                                    <React.Fragment key={c.courseId}>
                                        <tr>
                                            <td style={tdStyle}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#555' }}>{c.code}</span>
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 500 }}>{c.name}</td>
                                            <td style={tdStyle}>{c.ects ?? '–'}</td>
                                            <td style={tdStyle}>{semesterLabel(c.semesterNumber ?? null)}</td>
                                            <td style={tdStyle}>
                                                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                    fontSize: '12px', fontWeight: 600,
                                                    backgroundColor: c.mandatory ? '#e0ecff' : '#f3f3f3',
                                                    color: c.mandatory ? '#1a4fa8' : '#555' }}>
                                                    {c.mandatory ? 'Obligatorisk' : 'Valgfag'}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                    fontSize: '12px', fontWeight: 600, backgroundColor: '#e8f4ec', color: '#1a5c2e' }}>
                                                    {c.enrolledStudentCount}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, width: '140px' }}>
                                                <button
                                                    onClick={() => toggleStudents(c.courseId)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px',
                                                        padding: '6px 12px', backgroundColor: '#fff', color: '#333',
                                                        border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer',
                                                        fontSize: '13px', fontFamily: 'inherit', fontWeight: 500 }}>
                                                    {expandedCourseId === c.courseId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    Se deltagere
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded students panel */}
                                        {expandedCourseId === c.courseId && (
                                            <tr>
                                                <td colSpan={7} style={{ padding: '0', backgroundColor: '#f9fafb' }}>
                                                    <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e5e5' }}>
                                                        <NormalText text={`Tilmeldte studerende — ${c.name}`}
                                                            size={13} color="#555" fontWeight={600} />
                                                        {loadingStudents === c.courseId ? (
                                                            <NormalText text="Henter studerende…" size={13} color="#999" />
                                                        ) : (studentsMap[c.courseId] ?? []).length === 0 ? (
                                                            <NormalText text="Ingen studerende tilmeldt." size={13} color="#aaa" />
                                                        ) : (
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                                                <thead>
                                                                    <tr>
                                                                        {['Studienr.', 'Navn', 'Email', 'Status', 'Exam tilmeldt'].map(h => (
                                                                            <th key={h} style={{ ...thStyle, backgroundColor: '#efefef' }}>{h}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(studentsMap[c.courseId] ?? []).map(s => (
                                                                        <tr key={s.studentId}>
                                                                            <td style={tdStyle}>
                                                                                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#555' }}>{s.studentNumber}</span>
                                                                            </td>
                                                                            <td style={{ ...tdStyle, fontWeight: 500 }}>
                                                                                {[s.firstName, s.lastName].filter(Boolean).join(' ') || '–'}
                                                                            </td>
                                                                            <td style={tdStyle}>{s.email ?? '–'}</td>
                                                                            <td style={tdStyle}>
                                                                                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
                                                                                    fontSize: '12px', fontWeight: 600,
                                                                                    backgroundColor: s.courseStatus === 'ENROLLED' ? '#e8f4ec' : '#fef2f2',
                                                                                    color: s.courseStatus === 'ENROLLED' ? '#1a5c2e' : '#b91c1c' }}>
                                                                                    {s.courseStatus}
                                                                                </span>
                                                                            </td>
                                                                            <td style={tdStyle}>
                                                                                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
                                                                                    fontSize: '12px', fontWeight: 600,
                                                                                    backgroundColor: s.hasExamRegistration ? '#e8f4ec' : '#f0f0f0',
                                                                                    color: s.hasExamRegistration ? '#1a5c2e' : '#888' }}>
                                                                                    {s.hasExamRegistration ? 'Ja' : 'Nej'}
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
                    <NormalText text={`${filtered.length} fag vist`} size={12} color="#aaa" />
                </div>
            </main>
        </div>
    );
}
