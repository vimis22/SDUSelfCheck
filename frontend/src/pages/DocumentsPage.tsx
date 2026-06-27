import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

interface Document {
    dato: string;
    udskrift: string;
    status: string;
}

const documents: Document[] = [
    { dato: '12.06.2026', udskrift: 'Indskrivningsbekræftelse', status: 'Færdig' },
    { dato: '01.06.2026', udskrift: 'Karakterudskrift',         status: 'Færdig' },
];

const udskriftOptions = [
    'Vælg udskrift',
    'Indskrivningsbekræftelse',
    'Karakterudskrift',
    'Studiebevis',
    'Eksamensbevis',
];

const tableHeaderStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #e5e5e5',
};

const tableCellStyle: React.CSSProperties = {
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
};

function DocumentsPage() {
    const [selected, setSelected] = useState('Vælg udskrift');
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="6. Udskrifter" />

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

                <div style={{ marginBottom: '24px' }}>
                    <NormalText text="Udskrifter" size={28} color="#111" fontWeight={700} />
                </div>

                {/* Bestil-sektion */}
                <div style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '24px 28px',
                    maxWidth: '700px',
                    marginBottom: '32px',
                }}>
                    <div style={{ marginBottom: '16px' }}>
                        <NormalText text="Vælg hvilken udskrift du vil bestille." size={14} color="#333" />
                    </div>

                    {/* Dropdown + knap */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <select
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                border: '1px solid #d0d0d0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                color: selected === 'Vælg udskrift' ? '#aaa' : '#111',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                appearance: 'auto',
                            }}
                        >
                            {udskriftOptions.map((opt) => (
                                <option key={opt} value={opt} disabled={opt === 'Vælg udskrift'}>
                                    {opt}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => alert(`Bestiller: ${selected}`)}
                            disabled={selected === 'Vælg udskrift'}
                            style={{
                                padding: '12px 20px',
                                backgroundColor: selected === 'Vælg udskrift' ? '#aaa' : '#2d4a2d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                fontWeight: 600,
                                cursor: selected === 'Vælg udskrift' ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Dan udskrift
                        </button>
                    </div>
                </div>

                {/* Tidligere udskrifter */}
                <div style={{ maxWidth: '700px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <NormalText text="Tidligere udskrifter" size={18} color="#111" fontWeight={700} />
                    </div>

                    <div style={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        overflow: 'hidden',
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Dato', 'Udskrift', 'Status', 'Handlinger'].map((h) => (
                                        <th key={h} style={tableHeaderStyle}>
                                            <NormalText text={h} size={13} color="#888" fontWeight={500} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.dato + doc.udskrift}>
                                        <td style={tableCellStyle}><NormalText text={doc.dato}     size={14} color="#111" /></td>
                                        <td style={tableCellStyle}><NormalText text={doc.udskrift} size={14} color="#111" /></td>
                                        <td style={tableCellStyle}><NormalText text={doc.status}   size={14} color="#111" /></td>
                                        <td style={tableCellStyle}>
                                            <button
                                                onClick={() => alert(`Downloader: ${doc.udskrift}`)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontFamily: 'inherit',
                                                    color: '#2d4a2d',
                                                    textDecoration: 'underline',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}

export default DocumentsPage;
