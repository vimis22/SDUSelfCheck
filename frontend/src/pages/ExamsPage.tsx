import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import NormalButton from '../components/NormalButton.tsx';
import Accordion from '../components/Accordion.tsx';

interface Exam {
    fagkode: string;
    fagnavn: string;
    dato: string;
    tid: string;
    sted: string;
    tilmeldt: string;
}

interface ExamPeriod {
    title: string;
    defaultOpen: boolean;
    exams: Exam[];
}

const examPeriods: ExamPeriod[] = [
    {
        title: 'Vintereksamen 2025-26',
        defaultOpen: true,
        exams: [
            { fagkode: 'TS20054102', fagnavn: 'Engineering Research in Software',                        dato: '22.01.2026', tid: '09.00', sted: 'Campus Odense', tilmeldt: 'Ja' },
            { fagkode: 'TS20071102', fagnavn: 'Advanced Interaction Design',                             dato: '15.01.2026', tid: '13.00', sted: 'Campus Odense', tilmeldt: 'Ja' },
            { fagkode: 'TS20072102', fagnavn: 'Advanced Software Architecture and Analysis Techniques',  dato: '28.01.2026', tid: '09.00', sted: 'Campus Odense', tilmeldt: 'Ja' },
        ],
    },
    {
        title: 'Sommereksamen 2026',
        defaultOpen: false,
        exams: [],
    },
    {
        title: 'Vintereksamen 2026-27',
        defaultOpen: false,
        exams: [],
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
    verticalAlign: 'top',
};

function ExamsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="3. Eksamen" />

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
                    <NormalText text="Eksamen" size={28} color="#111" fontWeight={700} />
                    <NormalButton text="Eksporter oversigt" />
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5', marginBottom: '20px' }}>
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

                {/* Eksamen-accordion pr. periode */}
                {examPeriods.map((period) => (
                    <Accordion key={period.title} title={period.title} defaultOpen={period.defaultOpen}>
                        {period.exams.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Fagkode', 'Fagnavn', 'Dato', 'Tid', 'Sted', 'Tilmeldt'].map((h) => (
                                            <th key={h} style={tableHeaderStyle}>
                                                <NormalText text={h} size={13} color="#888" fontWeight={500} />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {period.exams.map((exam) => (
                                        <tr key={exam.fagkode}>
                                            <td style={tableCellStyle}><NormalText text={exam.fagkode}  size={14} color="#111" /></td>
                                            <td style={tableCellStyle}><NormalText text={exam.fagnavn}  size={14} color="#111" /></td>
                                            <td style={tableCellStyle}><NormalText text={exam.dato}     size={14} color="#111" /></td>
                                            <td style={tableCellStyle}><NormalText text={exam.tid}      size={14} color="#111" /></td>
                                            <td style={tableCellStyle}><NormalText text={exam.sted}     size={14} color="#111" /></td>
                                            <td style={tableCellStyle}><NormalText text={exam.tilmeldt} size={14} color="#111" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '20px' }}>
                                <NormalText text="Ingen eksamener for denne periode." size={14} color="#aaa" />
                            </div>
                        )}
                    </Accordion>
                ))}

            </main>
        </div>
    );
}

export default ExamsPage;
