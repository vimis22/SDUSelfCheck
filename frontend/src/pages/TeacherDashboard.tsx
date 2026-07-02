import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookMarked, PenLine, ClipboardList, HelpCircle } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import { useAuth } from '../auth/AuthContext.tsx';

const API = 'http://localhost:8081';

type PendingReg = {
    examRegistrationId: number;
    studentFirstName: string;
    studentLastName: string;
    courseName: string;
    examTitle: string;
};

type GradeResult = {
    gradeResultId: number;
    studentFirstName?: string;
    studentLastName?: string;
    courseName?: string;
    gradeValue: string;
    ectsGrade?: string;
    passed: boolean;
};

export default function TeacherDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const teacherId = user?.teacherId;

    const [courseCount, setCourseCount] = useState<number | null>(null);
    const [examCount, setExamCount] = useState<number | null>(null);
    const [pendingRegs, setPendingRegs] = useState<PendingReg[]>([]);
    const [recentGrades, setRecentGrades] = useState<GradeResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!teacherId) return;
        setLoading(true);

        Promise.all([
            fetch(`${API}/api/teachers/${teacherId}/courses`).then(r => r.ok ? r.json() : []),
            fetch(`${API}/api/teachers/${teacherId}/exams`).then(r => r.ok ? r.json() : []),
            fetch(`${API}/api/teachers/${teacherId}/exam-registrations/missing-results`).then(r => r.ok ? r.json() : []),
            fetch(`${API}/api/grade-results/teacher/${teacherId}`).then(r => r.ok ? r.json() : []),
        ]).then(([courses, exams, pending, grades]) => {
            setCourseCount(Array.isArray(courses) ? courses.length : 0);
            setExamCount(Array.isArray(exams) ? exams.length : 0);
            setPendingRegs(Array.isArray(pending) ? pending.slice(0, 5) : []);
            setRecentGrades(Array.isArray(grades) ? grades.slice(-5).reverse() : []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [teacherId]);

    if (!teacherId) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
                <TopBar breadcrumb="Teacher" />
                <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <NormalText text="Teacher ID mangler. Log ind igen." size={16} color="#b91c1c" fontWeight={600} />
                    </div>
                </main>
            </div>
        );
    }

    const quickLinks = [
        { label: 'Mine fag',          desc: 'Se og administrer fag du underviser i.',    route: '/teacher/courses',  icon: <BookMarked size={22} color="#065f46" />, stat: courseCount },
        { label: 'Indtast karakterer', desc: 'Giv og ret karakterer for dine studerende.', route: '/teacher/grades',   icon: <PenLine size={22} color="#1a4fa8" />,    stat: null },
        { label: 'Eksamen',            desc: 'Se eksamener og tilmeldte studerende.',      route: '/teacher/exams',    icon: <ClipboardList size={22} color="#7c3aed" />, stat: examCount },
        { label: 'Hjælp & Support',    desc: 'Hjælp til karaktergivning og eksamen.',     route: '/teacher/support',  icon: <HelpCircle size={22} color="#374151" />,  stat: null },
    ];

    const passedColor = (passed: boolean) => passed
        ? { bg: '#e8f4ec', color: '#1a5c2e' }
        : { bg: '#fef2f2', color: '#b91c1c' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Teacher" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <div style={{ marginBottom: '28px' }}>
                    <NormalText text="Teacher Dashboard" size={28} color="#111" fontWeight={700} />
                    <NormalText
                        text={`Velkommen, ${user?.email}. Her kan du se dine fag, eksamener og administrere karakterer.`}
                        size={14} color="#666" fontWeight={400}
                    />
                </div>

                {/* Quick link cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    {quickLinks.map(link => (
                        <button
                            key={link.route}
                            onClick={() => navigate(link.route)}
                            style={{ textAlign: 'left', background: '#fff', border: '1px solid #e5e5e5',
                                borderRadius: '10px', padding: '20px 22px', cursor: 'pointer',
                                fontFamily: 'inherit', boxShadow: 'none' }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'inline-flex' }}>
                                    {link.icon}
                                </div>
                                {link.stat !== null && link.stat !== undefined && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#111', lineHeight: 1 }}>{link.stat}</div>
                                        <div style={{ fontSize: '11px', color: '#999' }}>i alt</div>
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: '14px' }}>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '4px' }}>{link.label}</div>
                                <div style={{ fontSize: '13px', color: '#777', lineHeight: '1.4' }}>{link.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {loading ? <NormalText text="Henter oversigt…" size={14} color="#999" /> : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Pending registrations summary */}
                        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <NormalText text="Afventer karakter" size={15} color="#111" fontWeight={600} />
                                {pendingRegs.length > 0 && (
                                    <button onClick={() => navigate('/teacher/grades')}
                                        style={{ fontSize: '12px', color: '#1a4fa8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Se alle →
                                    </button>
                                )}
                            </div>
                            {pendingRegs.length === 0 ? (
                                <NormalText text="Ingen afventer karakter." size={13} color="#999" />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {pendingRegs.map(r => (
                                        <div key={r.examRegistrationId} style={{ fontSize: '13px', color: '#374151',
                                            padding: '8px 10px', backgroundColor: '#fef9ec', borderRadius: '6px',
                                            border: '1px solid #fde68a' }}>
                                            <strong>{r.studentFirstName} {r.studentLastName}</strong>
                                            <span style={{ color: '#888' }}> — {r.courseName}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent grades summary */}
                        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <NormalText text="Seneste karakterer" size={15} color="#111" fontWeight={600} />
                                {recentGrades.length > 0 && (
                                    <button onClick={() => navigate('/teacher/grades')}
                                        style={{ fontSize: '12px', color: '#1a4fa8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Se alle →
                                    </button>
                                )}
                            </div>
                            {recentGrades.length === 0 ? (
                                <NormalText text="Ingen karakterer givet endnu." size={13} color="#999" />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {recentGrades.map(g => {
                                        const pc = passedColor(g.passed);
                                        return (
                                            <div key={g.gradeResultId} style={{ display: 'flex', justifyContent: 'space-between',
                                                alignItems: 'center', fontSize: '13px', color: '#374151',
                                                padding: '8px 10px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                                                <span>
                                                    <strong>{g.studentFirstName} {g.studentLastName}</strong>
                                                    <span style={{ color: '#888' }}> — {g.courseName}</span>
                                                </span>
                                                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
                                                    fontSize: '12px', fontWeight: 700, backgroundColor: pc.bg, color: pc.color }}>
                                                    {g.gradeValue} ({g.ectsGrade})
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
