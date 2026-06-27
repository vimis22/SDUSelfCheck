import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import NormalButton from '../components/NormalButton.tsx';

interface Result {
    fagkode: string;
    fagnavn: string;
    dato: string;
    karakter: string;
    ects: number;
    ectsSkar: string;
    semester: string;
}

const results: Result[] = [
    { fagkode: 'TS20054102', fagnavn: 'Engineering Research in Software',                       dato: '22.06.2026', karakter: '7',  ects: 10, ectsSkar: 'C', semester: 'Forårssemesteret 2026' },
    { fagkode: 'TS20071102', fagnavn: 'Advanced Interaction Design',                            dato: '15.06.2026', karakter: '10', ects: 10, ectsSkar: 'B', semester: 'Forårssemesteret 2026' },
    { fagkode: 'TS30072102', fagnavn: 'Advanced Software Architecture and Analysis Techniques', dato: '28.01.2026', karakter: '4',  ects: 10, ectsSkar: 'D', semester: 'Vintereksamen 2025-26'  },
    { fagkode: 'TS20057102', fagnavn: 'Big Data and Data Science',                              dato: '21.01.2026', karakter: '4',  ects: 10, ectsSkar: 'D', semester: 'Vintereksamen 2025-26'  },
    { fagkode: 'TS20004102', fagnavn: 'Scientific Methods',                                     dato: '18.01.2026', karakter: '7',  ects: 5,  ectsSkar: 'C', semester: 'Vintereksamen 2025-26'  },
];

const semesters = ['Alle semestre', ...Array.from(new Set(results.map((r) => r.semester)))];

const tableHeaderStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #e5e5e5',
    backgroundColor: '#fafafa',
    whiteSpace: 'nowrap',
};

const tableCellStyle: React.CSSProperties = {
    padding: '13px 16px',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'top',
};

function ResultsPage() {
    const [selectedSemester, setSelectedSemester] = useState('Alle semestre');
    const navigate = useNavigate();

    const filtered = selectedSemester === 'Alle semestre'
        ? results
        : results.filter((r) => r.semester === selectedSemester);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="4. Resultater" />

            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>

                {/* Tilbage */}
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

                {/* Titel + Eksporter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                    <NormalText text="Resultater" size={28} color="#111" fontWeight={700} />
                    <NormalButton text="Eksporter resultater" />
                </div>

                {/* Indhold-kort */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid #e5e5e5',
                    overflow: 'hidden',
                }}>
                    {/* Semester-filter */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            style={{
                                padding: '8px 32px 8px 12px',
                                border: '1px solid #d0d0d0',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                color: '#111',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                appearance: 'auto',
                            }}
                        >
                            {semesters.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tabel */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Fagkode', 'Fagnavn', 'Dato', 'Karakter', 'ECTS', 'ECTS-kar.'].map((h) => (
                                    <th key={h} style={tableHeaderStyle}>
                                        <NormalText text={h} size={13} color="#888" fontWeight={500} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.fagkode}>
                                    <td style={tableCellStyle}><NormalText text={r.fagkode}           size={14} color="#111" /></td>
                                    <td style={tableCellStyle}><NormalText text={r.fagnavn}           size={14} color="#111" /></td>
                                    <td style={tableCellStyle}><NormalText text={r.dato}              size={14} color="#111" /></td>
                                    <td style={tableCellStyle}><NormalText text={r.karakter}          size={14} color="#111" fontWeight={600} /></td>
                                    <td style={tableCellStyle}><NormalText text={String(r.ects)}      size={14} color="#111" /></td>
                                    <td style={tableCellStyle}><NormalText text={r.ectsSkar}          size={14} color="#111" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </main>
        </div>
    );
}

export default ResultsPage;
