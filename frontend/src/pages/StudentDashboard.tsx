import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart2, BookOpen, ClipboardList, CreditCard,
    Printer, CheckCircle, XCircle, GraduationCap, BookMarked,
} from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import { useAuth } from '../auth/AuthContext.tsx';

const API = 'http://localhost:8081';

type StudentCard = {
    studentId: number;
    studentNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    educationName: string | null;
    status: string;
};

type GradeResult = {
    gradeResultId: number;
    gradeValue: string;
    ectsGrade: string;
    passed: boolean;
    gradedAt: string | null;
    examRegistration?: {
        exam?: {
            title?: string;
            reexam?: boolean;
            course?: {
                name?: string;
                code?: string;
                ects?: number;
            };
        };
    };
};

type Enrollment = {
    enrollmentId: number;
    status: string;
    course?: { name?: string; code?: string; ects?: number };
};

export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const studentId = user?.studentId ?? null;

    const [studentCard, setStudentCard] = useState<StudentCard | null>(null);
    const [gradeResults, setGradeResults] = useState<GradeResult[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) { setLoading(false); return; }
        setLoading(true);

        Promise.allSettled([
            fetch(`${API}/api/student-cards/student/${studentId}`)
                .then(r => r.ok ? r.json() : null)
                .then(data => { if (data) setStudentCard(data); }),
            fetch(`${API}/api/grade-results/student/${studentId}`)
                .then(r => r.ok ? r.json() : [])
                .then(data => setGradeResults(Array.isArray(data) ? data : [])),
            fetch(`${API}/api/enrollments/student/${studentId}`)
                .then(r => r.ok ? r.json() : [])
                .then(data => setEnrollments(Array.isArray(data) ? data : [])),
        ]).finally(() => setLoading(false));
    }, [studentId]);

    if (!studentId) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
                <TopBar breadcrumb="Home" />
                <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <NormalText text="Student ID mangler. Log ind igen." size={16} color="#b91c1c" fontWeight={600} />
                    </div>
                </main>
            </div>
        );
    }

    // ── Computed stats ────────────────────────────────────────────────────────
    const activeEnrollments = enrollments.filter(e => e.status === 'ENROLLED').length;
    const passedResults = gradeResults.filter(r => r.passed);
    const failedResults = gradeResults.filter(r => !r.passed);
    const passedEcts = passedResults.reduce((sum, r) => sum + (r.examRegistration?.exam?.course?.ects ?? 0), 0);
    const recentResults = [...gradeResults]
        .sort((a, b) => (b.gradedAt ?? '').localeCompare(a.gradedAt ?? ''))
        .slice(0, 5);

    const displayName = studentCard
        ? `${studentCard.firstName} ${studentCard.lastName}`
        : (user?.email ?? 'Studerende');

    // ── Quick action links ────────────────────────────────────────────────────
    const quickLinks = [
        { label: 'Undervisning',        desc: 'Se og tilmeld dig undervisning.',   route: '/courses',       icon: <BookOpen size={20} color="#065f46" /> },
        { label: 'Eksamen',             desc: 'Se kommende eksamener.',            route: '/exams',         icon: <ClipboardList size={20} color="#1a4fa8" /> },
        { label: 'Resultater',          desc: 'Se dine karakterer og resultater.', route: '/results',       icon: <BarChart2 size={20} color="#7c3aed" /> },
        { label: 'Udskrifter',          desc: 'Bestil og download udskrifter.',    route: '/documents',     icon: <Printer size={20} color="#b45309" /> },
        { label: 'Profil & Studiekort', desc: 'Se dit studiekort og profil.',      route: '/student-card',  icon: <CreditCard size={20} color="#374151" /> },
    ];

    const statCards = [
        { label: 'Aktive fag',    value: activeEnrollments, icon: <BookMarked size={20} color="#065f46" />,  bg: '#e8f4ec', color: '#065f46' },
        { label: 'Beståede fag',  value: passedResults.length, icon: <CheckCircle size={20} color="#1a5c2e" />, bg: '#e8f4ec', color: '#1a5c2e' },
        { label: 'Ikke bestået',  value: failedResults.length, icon: <XCircle size={20} color="#b91c1c" />,    bg: '#fef2f2', color: '#b91c1c' },
        { label: 'ECTS bestået',  value: passedEcts,        icon: <GraduationCap size={20} color="#1a4fa8" />, bg: '#eff6ff', color: '#1a4fa8' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Home" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa', overflowY: 'auto' }}>

                {/* ── Welcome card ── */}
                <div style={{
                    backgroundColor: '#2d4a2d', borderRadius: '12px',
                    padding: '28px 32px', marginBottom: '24px', color: '#fff',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
                            Velkommen, {displayName}
                        </div>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.7' }}>
                            {studentCard?.studentNumber && <span style={{ marginRight: '16px' }}>Studienr.: <strong style={{ color: '#fff' }}>{studentCard.studentNumber}</strong></span>}
                            {studentCard?.educationName && <span style={{ marginRight: '16px' }}>Uddannelse: <strong style={{ color: '#fff' }}>{studentCard.educationName}</strong></span>}
                        </div>
                    </div>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                            {displayName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </span>
                    </div>
                </div>

                {/* ── Stats row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {statCards.map(s => (
                        <div key={s.label} style={{
                            backgroundColor: '#fff', border: '1px solid #e5e5e5',
                            borderRadius: '10px', padding: '18px 20px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div style={{ padding: '8px', backgroundColor: s.bg, borderRadius: '8px', display: 'inline-flex' }}>
                                    {s.icon}
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#111', lineHeight: 1 }}>
                                    {loading ? '–' : s.value}
                                </div>
                            </div>
                            <div style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Bottom grid: Recent results + Quick actions ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>

                    {/* Seneste resultater */}
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '22px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <NormalText text="Seneste resultater" size={16} color="#111" fontWeight={600} />
                            {recentResults.length > 0 && (
                                <button onClick={() => navigate('/results')}
                                    style={{ fontSize: '12px', color: '#1a4fa8', background: 'none', border: 'none',
                                        cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                                    Se alle →
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <NormalText text="Henter resultater…" size={13} color="#999" />
                        ) : recentResults.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                                <NormalText text="Ingen resultater endnu." size={13} color="#aaa" />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {recentResults.map(r => {
                                    const courseName = r.examRegistration?.exam?.course?.name ?? r.examRegistration?.exam?.title ?? 'Ukendt fag';
                                    const isReexam = r.examRegistration?.exam?.reexam;
                                    const passed = r.passed;
                                    return (
                                        <div key={r.gradeResultId} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '10px 14px', backgroundColor: '#f9fafb',
                                            borderRadius: '8px', border: '1px solid #f0f0f0',
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '2px' }}>
                                                    {courseName}
                                                    {isReexam && <span style={{ marginLeft: '6px', fontSize: '11px',
                                                        color: '#b45309', backgroundColor: '#fef3c7',
                                                        padding: '1px 6px', borderRadius: '4px' }}>Re-eksamen</span>}
                                                </div>
                                                {r.gradedAt && (
                                                    <div style={{ fontSize: '11px', color: '#aaa' }}>
                                                        {new Date(r.gradedAt).toLocaleDateString('da-DK')}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                    fontSize: '13px', fontWeight: 700,
                                                    backgroundColor: passed ? '#e8f4ec' : '#fef2f2',
                                                    color: passed ? '#1a5c2e' : '#b91c1c',
                                                }}>
                                                    {r.gradeValue}
                                                </span>
                                                {r.ectsGrade && (
                                                    <span style={{ fontSize: '12px', color: '#999' }}>{r.ectsGrade}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '22px 24px' }}>
                        <NormalText text="Hurtige handlinger" size={16} color="#111" fontWeight={600} />
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {quickLinks.map(link => (
                                <button
                                    key={link.route}
                                    onClick={() => navigate(link.route)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 14px', backgroundColor: '#f9fafb',
                                        border: '1px solid #f0f0f0', borderRadius: '8px',
                                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f4ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#f0f0f0'; }}
                                >
                                    <div style={{ padding: '6px', backgroundColor: '#fff', borderRadius: '6px',
                                        border: '1px solid #e5e5e5', display: 'inline-flex', flexShrink: 0 }}>
                                        {link.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{link.label}</div>
                                        <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.3' }}>{link.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
