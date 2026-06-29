import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

const API = 'http://localhost:8081';
const STUDENT_ID = 1;

// ── TypeScript interfaces ────────────────────────────────────────────────────

type DocumentTypeValue =
    | 'ENROLLMENT_CONFIRMATION'
    | 'EXAM_TRANSCRIPT_ALL_ATTEMPTS'
    | 'PASSED_RESULTS_TRANSCRIPT'
    | 'SINGLE_COURSE_RESULT_CONFIRMATION';

type DocumentStatus = 'PENDING' | 'READY' | 'FAILED' | 'EXPIRED';

interface DocumentRequestResponse {
    documentRequestId: number;
    studentId: number;
    studentNumber: string;
    studentFirstName: string;
    studentLastName: string;
    documentType: DocumentTypeValue;
    documentTypeLabel: string;
    language: string;
    status: DocumentStatus;
    fileName: string;
    createdAt: string;
    expiresAt: string;
}

interface DocumentPreviewResponse {
    documentRequestId: number;
    documentType: DocumentTypeValue;
    documentTitle: string;
    language: string;
    status: DocumentStatus;
    fileName: string;
    studentNumber: string;
    studentName: string;
    educationName: string;
    generatedAt: string;
    expiresAt: string;
    contentLines: string[];
}

interface CreateDocumentRequest {
    studentId: number;
    documentType: DocumentTypeValue;
    language: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<DocumentTypeValue, string> = {
    ENROLLMENT_CONFIRMATION: 'Indskrivningsbekræftelse',
    EXAM_TRANSCRIPT_ALL_ATTEMPTS: 'Eksamensudskrift (alle forsøg)',
    PASSED_RESULTS_TRANSCRIPT: 'Karakterudskrift (beståede)',
    SINGLE_COURSE_RESULT_CONFIRMATION: 'Kursusresultat (enkelt)',
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
    PENDING: 'Afventer',
    READY: 'Færdig',
    FAILED: 'Fejlet',
    EXPIRED: 'Udløbet',
};

const STATUS_COLORS: Record<DocumentStatus, { bg: string; color: string }> = {
    PENDING: { bg: '#fff8e1', color: '#b45309' },
    READY:   { bg: '#e8f5e9', color: '#2d4a2d' },
    FAILED:  { bg: '#fdecea', color: '#b71c1c' },
    EXPIRED: { bg: '#f5f5f5', color: '#757575' },
};

function formatDateTime(value: string | null): string {
    if (!value) return '–';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('da-DK', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// ── Styles ───────────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #e5e5e5',
    whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'middle',
};

// ── Component ────────────────────────────────────────────────────────────────

type DocumentsPageProps = {
    showPageHeader?: boolean;
};

function DocumentsPage({ showPageHeader = true }: DocumentsPageProps) {
    const navigate = useNavigate();

    const [documentTypes, setDocumentTypes] = useState<DocumentTypeValue[]>([]);
    const [documents, setDocuments]         = useState<DocumentRequestResponse[]>([]);
    const [selectedType, setSelectedType]   = useState<DocumentTypeValue | ''>('');
    const [preview, setPreview]             = useState<DocumentPreviewResponse | null>(null);
    const [previewId, setPreviewId]         = useState<number | null>(null);

    const [loadingTypes, setLoadingTypes]       = useState(false);
    const [loadingDocs, setLoadingDocs]         = useState(false);
    const [loadingCreate, setLoadingCreate]     = useState(false);
    const [loadingPreview, setLoadingPreview]   = useState(false);
    const [error, setError]                     = useState<string | null>(null);

    // Fetch document types on mount
    useEffect(() => {
        setLoadingTypes(true);
        fetch(`${API}/api/documents/types`)
            .then(r => r.json())
            .then((types: DocumentTypeValue[]) => setDocumentTypes(types))
            .catch(() => setError('Kunne ikke hente udskriftstyper.'))
            .finally(() => setLoadingTypes(false));
    }, []);

    // Fetch documents for student on mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    function fetchDocuments() {
        setLoadingDocs(true);
        fetch(`${API}/api/documents/student/${STUDENT_ID}`)
            .then(r => r.json())
            .then((data: DocumentRequestResponse[]) => setDocuments(data))
            .catch(() => setError('Kunne ikke hente tidligere udskrifter.'))
            .finally(() => setLoadingDocs(false));
    }

    function handleCreate() {
        if (!selectedType) return;
        setLoadingCreate(true);
        setError(null);

        const body: CreateDocumentRequest = {
            studentId: STUDENT_ID,
            documentType: selectedType,
            language: 'DA',
        };

        fetch(`${API}/api/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
            .then(r => {
                if (!r.ok) throw new Error('Oprettelse mislykkedes');
                return r.json();
            })
            .then(() => {
                setSelectedType('');
                fetchDocuments();
            })
            .catch(() => setError('Kunne ikke oprette udskrift. Prøv igen.'))
            .finally(() => setLoadingCreate(false));
    }

    function handlePreview(documentRequestId: number) {
        if (previewId === documentRequestId) {
            setPreview(null);
            setPreviewId(null);
            return;
        }
        setLoadingPreview(true);
        setPreviewId(documentRequestId);
        setPreview(null);

        fetch(`${API}/api/documents/${documentRequestId}/preview`)
            .then(r => r.json())
            .then((data: DocumentPreviewResponse) => setPreview(data))
            .catch(() => setError('Kunne ikke hente forhåndsvisning.'))
            .finally(() => setLoadingPreview(false));
    }

    function handleDownload(documentRequestId: number) {
        window.open(`${API}/api/documents/${documentRequestId}/download`, '_blank');
    }

    function handleDelete(documentRequestId: number) {
        if (!window.confirm('Er du sikker på, at du vil slette denne udskrift?')) return;

        fetch(`${API}/api/documents/${documentRequestId}`, { method: 'DELETE' })
            .then(r => {
                if (!r.ok) throw new Error('Sletning mislykkedes');
                if (previewId === documentRequestId) {
                    setPreview(null);
                    setPreviewId(null);
                }
                fetchDocuments();
            })
            .catch(() => setError('Kunne ikke slette udskriften. Prøv igen.'));
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            {showPageHeader && <TopBar breadcrumb="6. Udskrifter" />}

            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>

                {showPageHeader && (
                    <>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: 0, marginBottom: '16px',
                            }}
                        >
                            <ChevronLeft size={16} color="#555" />
                            <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                        </button>

                        <div style={{ marginBottom: '24px' }}>
                            <NormalText text="Udskrifter" size={28} color="#111" fontWeight={700} />
                        </div>
                    </>
                )}

                {error && (
                    <div style={{
                        backgroundColor: '#fdecea', border: '1px solid #f5c6cb',
                        borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
                        maxWidth: '700px', color: '#b71c1c', fontSize: '14px',
                    }}>
                        {error}
                    </div>
                )}

                {/* ── Bestil ny udskrift ── */}
                <div style={{
                    backgroundColor: '#fff', border: '1px solid #e5e5e5',
                    borderRadius: '12px', padding: '24px 28px',
                    maxWidth: '700px', marginBottom: '32px',
                }}>
                    <div style={{ marginBottom: '16px' }}>
                        <NormalText text="Vælg hvilken udskrift du vil bestille." size={14} color="#333" />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <select
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value as DocumentTypeValue)}
                            disabled={loadingTypes}
                            style={{
                                flex: 1, padding: '12px 16px',
                                border: '1px solid #d0d0d0', borderRadius: '8px',
                                fontSize: '14px', fontFamily: 'inherit',
                                color: selectedType ? '#111' : '#aaa',
                                backgroundColor: '#fff', cursor: 'pointer',
                            }}
                        >
                            <option value="" disabled>Vælg udskrift</option>
                            {documentTypes.map(type => (
                                <option key={type} value={type}>
                                    {TYPE_LABELS[type] ?? type}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleCreate}
                            disabled={!selectedType || loadingCreate}
                            style={{
                                padding: '12px 20px',
                                backgroundColor: !selectedType || loadingCreate ? '#aaa' : '#2d4a2d',
                                color: '#fff', border: 'none', borderRadius: '8px',
                                fontSize: '14px', fontFamily: 'inherit', fontWeight: 600,
                                cursor: !selectedType || loadingCreate ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {loadingCreate ? 'Opretter…' : 'Dan udskrift'}
                        </button>
                    </div>
                </div>

                {/* ── Tidligere udskrifter ── */}
                <div style={{ maxWidth: '900px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <NormalText text="Tidligere udskrifter" size={18} color="#111" fontWeight={700} />
                    </div>

                    <div style={{
                        backgroundColor: '#fff', border: '1px solid #e5e5e5',
                        borderRadius: '12px', overflow: 'hidden',
                    }}>
                        {loadingDocs ? (
                            <div style={{ padding: '32px', textAlign: 'center' }}>
                                <NormalText text="Henter udskrifter…" size={14} color="#888" />
                            </div>
                        ) : documents.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center' }}>
                                <NormalText text="Ingen udskrifter endnu." size={14} color="#888" />
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#fafafa' }}>
                                        {['#', 'Type', 'Status', 'Oprettet', 'Udløber', 'Handlinger'].map(h => (
                                            <th key={h} style={thStyle}>
                                                <NormalText text={h} size={12} color="#888" fontWeight={600} />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map(doc => {
                                        const statusStyle = STATUS_COLORS[doc.status] ?? { bg: '#f5f5f5', color: '#333' };
                                        const isActive = previewId === doc.documentRequestId;

                                        return (
                                            <React.Fragment key={doc.documentRequestId}>
                                                <tr style={{ backgroundColor: isActive ? '#f7fbf7' : 'transparent' }}>
                                                    <td style={tdStyle}>
                                                        <NormalText text={String(doc.documentRequestId)} size={13} color="#888" />
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <NormalText
                                                            text={doc.documentTypeLabel ?? TYPE_LABELS[doc.documentType] ?? doc.documentType}
                                                            size={14} color="#111"
                                                        />
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '3px 10px', borderRadius: '20px',
                                                            fontSize: '12px', fontWeight: 600,
                                                            backgroundColor: statusStyle.bg,
                                                            color: statusStyle.color,
                                                        }}>
                                                            {STATUS_LABELS[doc.status] ?? doc.status}
                                                        </span>
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <NormalText text={formatDateTime(doc.createdAt)} size={13} color="#555" />
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <NormalText text={formatDateTime(doc.expiresAt)} size={13} color="#555" />
                                                    </td>
                                                    <td style={{ ...tdStyle, display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <button
                                                            onClick={() => handlePreview(doc.documentRequestId)}
                                                            style={{
                                                                background: 'none', border: '1px solid #2d4a2d',
                                                                padding: '5px 12px', borderRadius: '6px',
                                                                fontSize: '13px', fontFamily: 'inherit',
                                                                color: '#2d4a2d', cursor: 'pointer', fontWeight: 500,
                                                            }}
                                                        >
                                                            {isActive ? 'Luk' : 'Vis'}
                                                        </button>

                                                        {doc.status === 'READY' && (
                                                            <button
                                                                onClick={() => handleDownload(doc.documentRequestId)}
                                                                style={{
                                                                    background: '#2d4a2d', border: 'none',
                                                                    padding: '5px 12px', borderRadius: '6px',
                                                                    fontSize: '13px', fontFamily: 'inherit',
                                                                    color: '#fff', cursor: 'pointer', fontWeight: 500,
                                                                }}
                                                            >
                                                                Download PDF
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleDelete(doc.documentRequestId)}
                                                            style={{
                                                                background: '#c0392b', border: 'none',
                                                                padding: '5px 12px', borderRadius: '6px',
                                                                fontSize: '13px', fontFamily: 'inherit',
                                                                color: '#fff', cursor: 'pointer', fontWeight: 500,
                                                            }}
                                                        >
                                                            Slet Download
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* ── Inline preview panel ── */}
                                                {isActive && (
                                                    <tr>
                                                        <td colSpan={6} style={{ padding: 0 }}>
                                                            <div style={{
                                                                margin: '0 16px 16px',
                                                                backgroundColor: '#f7fbf7',
                                                                border: '1px solid #c8e6c9',
                                                                borderRadius: '8px',
                                                                padding: '20px 24px',
                                                            }}>
                                                                {loadingPreview && !preview ? (
                                                                    <NormalText text="Henter forhåndsvisning…" size={13} color="#888" />
                                                                ) : preview ? (
                                                                    <>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                                            <NormalText text={preview.documentTitle} size={16} color="#111" fontWeight={700} />
                                                                            <button
                                                                                onClick={() => { setPreview(null); setPreviewId(null); }}
                                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                                            >
                                                                                <X size={16} color="#888" />
                                                                            </button>
                                                                        </div>

                                                                        <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                                                                            <span style={{ fontSize: '13px', color: '#555' }}>
                                                                                <strong>Studerende:</strong> {preview.studentName} ({preview.studentNumber})
                                                                            </span>
                                                                            <span style={{ fontSize: '13px', color: '#555' }}>
                                                                                <strong>Uddannelse:</strong> {preview.educationName}
                                                                            </span>
                                                                        </div>

                                                                        <div style={{
                                                                            backgroundColor: '#fff',
                                                                            border: '1px solid #e0e0e0',
                                                                            borderRadius: '6px',
                                                                            padding: '16px',
                                                                            fontFamily: 'monospace',
                                                                            fontSize: '13px',
                                                                            lineHeight: '1.7',
                                                                            color: '#333',
                                                                            whiteSpace: 'pre-wrap',
                                                                            maxHeight: '320px',
                                                                            overflowY: 'auto',
                                                                        }}>
                                                                            {preview.contentLines.map((line, i) => (
                                                                                <div key={i}>{line || '\u00A0'}</div>
                                                                            ))}
                                                                        </div>
                                                                    </>
                                                                ) : null}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}

export default DocumentsPage;
