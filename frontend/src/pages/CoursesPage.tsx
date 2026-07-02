import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import Accordion from '../components/Accordion.tsx';

const STUDENT_ID = 1;

type CourseRow = {
    courseId: number;
    code: string;
    name: string;
    ects: number;
    semesterNumber: number | null;
    educationName: string | null;
};

type EnrollmentRow = {
    enrollmentId: number;
    courseId: number;
    courseCode: string;
    courseName: string;
    status: string;
};

const tabs = ['Tilmeldinger', 'Mine tilmeldinger'];

const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    borderBottom: '2px solid #e5e5e5',
    backgroundColor: '#f7f7f7',
    fontWeight: 600,
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
    padding: '13px 16px',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'middle',
    fontSize: '14px',
    color: '#222',
};

function CoursesPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [courses, setCourses] = useState<CourseRow[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
    const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
    const [cancellingCourseId, setCancellingCourseId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [coursesRes, enrollmentsRes] = await Promise.all([
                fetch('http://localhost:8081/api/courses'),
                fetch(`http://localhost:8081/api/enrollments/student/${STUDENT_ID}`),
            ]);

            if (!coursesRes.ok) throw new Error(`Kurser: HTTP ${coursesRes.status}`);
            if (!enrollmentsRes.ok) throw new Error(`Tilmeldinger: HTTP ${enrollmentsRes.status}`);

            setCourses(await coursesRes.json());
            setEnrollments(await enrollmentsRes.json());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Kunne ikke hente data fra serveren.');
        } finally {
            setLoading(false);
        }
    };

    // Only ENROLLED (active) enrollments count
    const activeEnrolledCourseIds = new Set(
        enrollments.filter(e => e.status === 'ENROLLED').map(e => e.courseId)
    );

    const handleEnroll = async (course: CourseRow) => {
        setEnrollingCourseId(course.courseId);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await fetch('http://localhost:8081/api/enrollments/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: STUDENT_ID, courseId: course.courseId }),
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message ?? 'Tilmelding mislykkedes.');
            }
            setSuccessMessage(`Du er nu tilmeldt "${course.name}" og den ordinære eksamen.`);
            await fetchData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Tilmelding mislykkedes.');
        } finally {
            setEnrollingCourseId(null);
        }
    };

    const handleCancel = async (course: CourseRow) => {
        setCancellingCourseId(course.courseId);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await fetch('http://localhost:8081/api/enrollments/unregister', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: STUDENT_ID, courseId: course.courseId }),
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message ?? 'Afmelding mislykkedes.');
            }
            setSuccessMessage(`Du er nu afmeldt "${course.name}". Den ordinære eksamenstilmelding er også annulleret.`);
            await fetchData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Afmelding mislykkedes.');
        } finally {
            setCancellingCourseId(null);
        }
    };

    // Tab 0 – courses NOT actively enrolled (CANCELLED ones appear here so student can re-enroll)
    const availableCourses = courses.filter(c => !activeEnrolledCourseIds.has(c.courseId));
    // Tab 1 – courses with active ENROLLED status
    const enrolledCourses = courses.filter(c => activeEnrolledCourseIds.has(c.courseId));

    const groupBySemester = (list: CourseRow[]) => {
        const map = new Map<number, CourseRow[]>();
        for (const c of list) {
            const sem = c.semesterNumber ?? 0;
            if (!map.has(sem)) map.set(sem, []);
            map.get(sem)!.push(c);
        }
        return map;
    };

    // semesterNumber 34 is a special value meaning "3. + 4. semester" (40 ECTS thesis)
    const semesterLabel = (sem: number) => {
        if (sem === 34) return '3. + 4. semester';
        if (sem > 0)    return `${sem}. semester`;
        return 'Andet';
    };

    // Sort order: 3 → 34 (as 3.5) → 4
    const semesterSortKey = (sem: number) => sem === 34 ? 3.5 : sem;

    const renderAvailableTable = (list: CourseRow[]) => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    {['Fagkode', 'Fagnavn', 'ECTS', 'Semester', 'Type', ''].map(h => (
                        <th key={h || 'action'} style={thStyle}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {list.map(course => (
                    <tr key={course.courseId} style={{ backgroundColor: '#fff' }}>
                        <td style={tdStyle}>
                            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#555' }}>
                                {course.code}
                            </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{course.name}</td>
                        <td style={tdStyle}>{course.ects}</td>
                        <td style={tdStyle}>{course.semesterNumber ?? '–'}</td>
                        <td style={tdStyle}>
                            <span style={{ fontSize: '12px', color: '#888' }}>
                                {course.educationName ?? '–'}
                            </span>
                        </td>
                        <td style={{ ...tdStyle, width: '130px' }}>
                            <button
                                onClick={() => handleEnroll(course)}
                                disabled={enrollingCourseId === course.courseId}
                                style={{
                                    padding: '7px 18px',
                                    backgroundColor: enrollingCourseId === course.courseId ? '#888' : '#1a3a2a',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: enrollingCourseId === course.courseId ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {enrollingCourseId === course.courseId ? 'Tilmelder…' : 'Tilmeld'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderEnrolledTable = (list: CourseRow[]) => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    {['Fagkode', 'Fagnavn', 'ECTS', 'Semester', 'Status', ''].map(h => (
                        <th key={h || 'action'} style={thStyle}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {list.map(course => (
                    <tr key={course.courseId} style={{ backgroundColor: '#fff' }}>
                        <td style={tdStyle}>
                            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#555' }}>
                                {course.code}
                            </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{course.name}</td>
                        <td style={tdStyle}>{course.ects}</td>
                        <td style={tdStyle}>{course.semesterNumber ?? '–'}</td>
                        <td style={tdStyle}>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                backgroundColor: '#e8f4ec',
                                color: '#1a5c2e',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}>
                                Tilmeldt
                            </span>
                        </td>
                        <td style={{ ...tdStyle, width: '130px' }}>
                            <button
                                onClick={() => handleCancel(course)}
                                disabled={cancellingCourseId === course.courseId}
                                style={{
                                    padding: '7px 18px',
                                    backgroundColor: cancellingCourseId === course.courseId ? '#888' : '#9b1c1c',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: cancellingCourseId === course.courseId ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {cancellingCourseId === course.courseId ? 'Afmelder…' : 'Afmeld'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderGroups = (
        list: CourseRow[],
        renderTable: (items: CourseRow[]) => React.ReactNode,
        emptyMessage: string
    ) => {
        if (list.length === 0) {
            return (
                <div style={{
                    padding: '32px 20px',
                    textAlign: 'center',
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                }}>
                    <NormalText text={emptyMessage} size={14} color="#aaa" />
                </div>
            );
        }

        const groups = groupBySemester(list);

        return Array.from(groups.entries())
            .sort(([a], [b]) => semesterSortKey(a) - semesterSortKey(b))
            .map(([sem, items]) => (
                <Accordion key={sem} title={semesterLabel(sem)} defaultOpen={true}>
                    {renderTable(items)}
                </Accordion>
            ));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="2. Undervisning" />

            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0', marginBottom: '20px',
                    }}
                >
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                    <div>
                        <NormalText text="Undervisning" size={28} color="#111" fontWeight={700} />
                        <NormalText text="Vælg de fag du ønsker at tilmelde dig." size={14} color="#666" fontWeight={400} />
                    </div>
                </div>

                {/* Feedback */}
                {error && (
                    <div style={{
                        padding: '12px 16px', backgroundColor: '#fef2f2',
                        border: '1px solid #fca5a5', borderRadius: '8px',
                        color: '#b91c1c', fontSize: '14px', marginBottom: '16px',
                    }}>
                        Fejl: {error}
                    </div>
                )}
                {successMessage && (
                    <div style={{
                        padding: '12px 16px', backgroundColor: '#f0fdf4',
                        border: '1px solid #86efac', borderRadius: '8px',
                        color: '#166534', fontSize: '14px', marginBottom: '16px',
                    }}>
                        {successMessage}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '2px solid #e5e5e5', marginBottom: '24px' }}>
                    {tabs.map((tab, i) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(i); setSuccessMessage(null); setError(null); }}
                            style={{
                                padding: '10px 24px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === i ? '2px solid #1a3a2a' : '2px solid transparent',
                                marginBottom: '-2px',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            <NormalText
                                text={tab}
                                size={14}
                                color={activeTab === i ? '#1a3a2a' : '#888'}
                                fontWeight={activeTab === i ? 700 : 400}
                            />
                        </button>
                    ))}
                </div>

                {loading ? (
                    <NormalText text="Henter fag…" size={14} color="#999" />
                ) : (
                    <>
                        {activeTab === 0 && renderGroups(
                            availableCourses,
                            renderAvailableTable,
                            'Ingen ledige fag at tilmelde sig.'
                        )}
                        {activeTab === 1 && renderGroups(
                            enrolledCourses,
                            renderEnrolledTable,
                            'Du er ikke tilmeldt nogen fag endnu.'
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default CoursesPage;
