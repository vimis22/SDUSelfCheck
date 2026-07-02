import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, X } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

const API = 'http://localhost:8081';

type StudentRow = {
    studentId: number;
    studentNumber: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    educationName: string | null;
    semester: number | null;
    enrollmentStatus: string | null;
};

type EducationOption = {
    educationId: number;
    name: string;
    code: string;
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
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1px solid #d0d0d0', borderRadius: '6px',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '4px', display: 'block',
};

function enrollmentBadge(status: string | null) {
    const active = status === 'ACTIVE';
    return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600,
            backgroundColor: active ? '#e8f4ec' : '#f0f0f0',
            color: active ? '#1a5c2e' : '#555' }}>
            {status ?? '–'}
        </span>
    );
}

const emptyForm = { firstName: '', lastName: '', email: '', password: '', studentNumber: '', educationId: '', semester: '' };

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);
    const [educations, setEducations] = useState<EducationOption[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadStudents = async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API}/api/admin/students`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setStudents(await res.json());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStudents(); }, []);

    useEffect(() => {
        if (!showForm || educations.length > 0) return;
        fetch(`${API}/api/educations`)
            .then(r => r.json())
            .then(setEducations)
            .catch(() => {});
    }, [showForm]);

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return s.studentNumber.toLowerCase().includes(q)
            || s.email.toLowerCase().includes(q)
            || (s.firstName ?? '').toLowerCase().includes(q)
            || (s.lastName ?? '').toLowerCase().includes(q);
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true); setFormError(null);
        try {
            const res = await fetch(`${API}/api/admin/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    password: form.password,
                    studentNumber: form.studentNumber,
                    educationId: Number(form.educationId),
                    semester: form.semester ? Number(form.semester) : null,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `HTTP ${res.status}`);
            }
            setForm(emptyForm);
            setShowForm(false);
            await loadStudents();
        } catch (e: unknown) {
            setFormError(e instanceof Error ? e.message : 'Fejl ved oprettelse.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Admin / Studerende" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button onClick={() => navigate('/admin-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <NormalText text="Studerende" size={28} color="#111" fontWeight={700} />
                        <NormalText text="Oversigt over alle studerende i systemet." size={14} color="#666" fontWeight={400} />
                    </div>
                    <button
                        onClick={() => { setShowForm(f => !f); setFormError(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 18px', backgroundColor: '#2d4a2d', color: '#fff',
                            border: 'none', borderRadius: '8px', fontSize: '14px',
                            fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
                        {showForm ? <X size={15} /> : <Plus size={15} />}
                        {showForm ? 'Annuller' : 'Opret studerende'}
                    </button>
                </div>

                {/* Create form */}
                {showForm && (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px',
                        padding: '24px 28px', marginBottom: '24px', maxWidth: '760px' }}>
                        <NormalText text="Opret ny studerende" size={16} color="#111" fontWeight={700} />
                        <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '14px 0 20px' }} />

                        {formError && (
                            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                                borderRadius: '6px', color: '#b91c1c', fontSize: '13px', marginBottom: '16px' }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Fornavn *</label>
                                    <input style={inputStyle} value={form.firstName}
                                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                        placeholder="f.eks. Mads" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Efternavn *</label>
                                    <input style={inputStyle} value={form.lastName}
                                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                        placeholder="f.eks. Jensen" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email *</label>
                                    <input style={inputStyle} type="email" value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="mads@student.sdu.dk" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Adgangskode *</label>
                                    <input style={inputStyle} type="password" value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="Mindst 6 tegn" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Studienummer *</label>
                                    <input style={inputStyle} value={form.studentNumber}
                                        onChange={e => setForm(f => ({ ...f, studentNumber: e.target.value }))}
                                        placeholder="f.eks. 240001" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Semester</label>
                                    <input style={inputStyle} type="number" min={1} max={12} value={form.semester}
                                        onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                                        placeholder="f.eks. 1" />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Uddannelse *</label>
                                    <select style={{ ...inputStyle, backgroundColor: '#fff' }}
                                        value={form.educationId}
                                        onChange={e => setForm(f => ({ ...f, educationId: e.target.value }))}
                                        required>
                                        <option value="">– Vælg uddannelse –</option>
                                        {educations.map(ed => (
                                            <option key={ed.educationId} value={ed.educationId}>
                                                {ed.code} – {ed.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" disabled={submitting}
                                    style={{ padding: '10px 20px', backgroundColor: '#2d4a2d', color: '#fff',
                                        border: 'none', borderRadius: '7px', fontSize: '14px',
                                        fontFamily: 'inherit', fontWeight: 600,
                                        cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                                    {submitting ? 'Opretter…' : 'Opret studerende'}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(null); }}
                                    style={{ padding: '10px 18px', backgroundColor: '#fff', color: '#555',
                                        border: '1px solid #ccc', borderRadius: '7px', fontSize: '14px',
                                        fontFamily: 'inherit', cursor: 'pointer' }}>
                                    Annuller
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {error && <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>Fejl: {error}</div>}

                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Søg efter navn, email eller studienummer..."
                    style={{ width: '360px', padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                        fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '20px',
                        boxSizing: 'border-box' }} />

                {loading ? <NormalText text="Henter studerende…" size={14} color="#999" /> : (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['ID', 'Studienr.', 'Navn', 'Email', 'Uddannelse', 'Semester', 'Status'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>Ingen studerende fundet.</td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.studentId}>
                                        <td style={tdStyle}>{s.studentId}</td>
                                        <td style={tdStyle}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#555' }}>
                                                {s.studentNumber}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 500 }}>
                                            {[s.firstName, s.lastName].filter(Boolean).join(' ') || '–'}
                                        </td>
                                        <td style={tdStyle}>{s.email}</td>
                                        <td style={tdStyle}>{s.educationName ?? '–'}</td>
                                        <td style={tdStyle}>{s.semester ?? '–'}</td>
                                        <td style={tdStyle}>{enrollmentBadge(s.enrollmentStatus)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div style={{ marginTop: '12px' }}>
                    <NormalText text={`${filtered.length} studerende vist`} size={12} color="#aaa" />
                </div>
            </main>
        </div>
    );
}
