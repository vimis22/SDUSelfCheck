import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import NormalButton from '../components/NormalButton.tsx';
import Accordion from '../components/Accordion.tsx';

interface Course {
    fagkode: string;
    fagnavn: string;
    ects: number;
    status: string;
    underviser: string;
}

interface Semester {
    title: string;
    defaultOpen: boolean;
    courses: Course[];
}

const semesters: Semester[] = [
    {
        title: 'Forårssemesteret 2026',
        defaultOpen: true,
        courses: [
            { fagkode: 'TS20054102', fagnavn: 'Engineering Research in Software', ects: 10, status: 'Tilmeldt', underviser: '–' },
            { fagkode: 'TS20071102', fagnavn: 'Advanced Interaction Design',      ects: 10, status: 'Tilmeldt', underviser: '–' },
        ],
    },
    {
        title: 'Efterårssemesteret 2026',
        defaultOpen: false,
        courses: [],
    },
    {
        title: 'Forårssemesteret 2027',
        defaultOpen: false,
        courses: [],
    },
];

const tabs = ['Tilmeldinger', 'Afmeldinger'];

const tableHeaderStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #e5e5e5',
    backgroundColor: '#fafafa',
};

const tableCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
};

function CoursesPage() {
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="2. Undervisning" />

            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>

                {/* Tilbage-knap */}
                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0', marginBottom: '16px',
                    }}
                >
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                {/* Titel + Eksporter-knap */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <NormalText text="Undervisning" size={28} color="#111" fontWeight={700} />
                    <NormalButton text="Eksporter oversigt" />
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e5e5e5', marginBottom: '20px' }}>
                    {tabs.map((tab, i) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(i)}
                            style={{
                                padding: '10px 20px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === i ? '2px solid #111' : '2px solid transparent',
                                cursor: 'pointer',
                                marginBottom: '-1px',
                                fontFamily: 'inherit',
                            }}
                        >
                            <NormalText
                                text={tab}
                                size={14}
                                color={activeTab === i ? '#111' : '#777'}
                                fontWeight={activeTab === i ? 600 : 400}
                            />
                        </button>
                    ))}
                </div>

                {/* Semester-accordion */}
                {semesters.map((semester) => (
                    <Accordion key={semester.title} title={semester.title} defaultOpen={semester.defaultOpen}>
                        {semester.courses.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Fægkode', 'Fagnavn', 'ECTS', 'Status', 'Underviser'].map((h) => (
                                            <th key={h} style={tableHeaderStyle}>
                                                <NormalText text={h} size={13} color="#888" fontWeight={500} />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {semester.courses.map((course) => (
                                        <tr key={course.fagkode}>
                                            <td style={tableCellStyle}><NormalText text={course.fagkode} size={14} color="#111" /></td>
                                            <td style={tableCellStyle}><NormalText text={course.fagnavn} size={14} color="#111" /></td>
                                            <td style={tableCellStyle}><NormalText text={String(course.ects)} size={14} color="#111" /></td>
                                            <td style={tableCellStyle}><NormalText text={course.status} size={14} color="#111" /></td>
                                            <td style={tableCellStyle}><NormalText text={course.underviser} size={14} color="#111" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '20px 20px' }}>
                                <NormalText text="Ingen tilmeldinger for dette semester." size={14} color="#aaa" />
                            </div>
                        )}
                    </Accordion>
                ))}

            </main>
        </div>
    );
}

export default CoursesPage;
