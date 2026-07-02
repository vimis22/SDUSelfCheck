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
    phoneNumber: string | null;
    educationId: number | null;
};

type EducationOption = { educationId: number; name: string; code: string };

const thStyle: React.CSSProperties = {
    padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e5e5e5',
    backgroundColor: '#f7f7f7', fontWeight: 600, fontSize: '12px', color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
    padding: '10px 12px', borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'middle', fontSize: '14px', color: '#222',
};
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1px solid #d0d0d0', borderRadius: '6px',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '4px', display: 'block',
};
const smallBtnBase: React.CSSProperties = {
    padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
    fontFamily: 'inherit', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
};

function statusBadge(status: string | null) {
    const active = status === 'ACTIVE';
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600,
            backgroundColor: active ? '#e8f4ec' : '#fef2f2',
            color: active ? '#1a5c2e' : '#b91c1c',
        }}>
            {status ?? '–'}
        </span>
    );
}

const emptyCreate = { firstName: '', lastName: '', email: '', password: '', studentNumber: '', educationId: '', semester: '' };
const emptyEdit = { firstName: '', lastName: '', email: '', phoneNumber: '', studentNumber: '', educationId: '', semester: '', enrollmentStatus: 'ACTIVE' };

export default function AdminStudentsPage() {
    const navigate = useNavigate();
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Create form state
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState(emptyCreate);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSubmitting, setCreateSubmitting] = useState(false);

    // Edit modal state
    const [editStudent, setEditStudent] = useState<StudentRow | null>(null);
    const [editForm, setEditForm] = useState(emptyEdit);
    const [editError, setEditError] = useState<string | null>(null);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const [educations, setEducations] = useState<EducationOption[]>([]);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

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

    const loadEducations = async () => {
        if (educations.length > 0) return;
        try {
            const res = await fetch(`${API}/api/educations`);
            if (res.ok) setEducations(await res.json());
        } catch { /* silent */ }
    };

    useEffect(() => { loadStudents(); }, []);

    useEffect(() => {
        if (showCreate || editStudent) loadEducations();
    }, [showCreate, editStudent]);

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return s.studentNumber.toLowerCase().includes(q)
            || s.email.toLowerCase().includes(q)
            || (s.firstName ?? '').toLowerCase().includes(q)
            || (s.lastName ?? '').toLowerCase().includes(q);
    });

    // ── Create ────────────────────────────────────────────────────────────────

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateSubmitting(true); setCreateError(null);
        try {
            const res = await fetch(`${API}/api/admin/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: createForm.firstName,
                    lastName: createForm.lastName,
                    email: createForm.email,
                    password: createForm.password,
                    studentNumber: createForm.studentNumber,
                    educationId: Number(createForm.educationId),
                    semester: createForm.semester ? Number(createForm.semester) : null,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `HTTP ${res.status}`);
            }
            setCreateForm(emptyCreate);
            setShowCreate(false);
            await loadStudents();
            showSuccess('Studerende oprettet.');
        } catch (e: unknown) {
            setCreateError(e instanceof Error ? e.message : 'Fejl ved oprettelse.');
        } finally {
            setCreateSubmitting(false);
        }
    };

    // ── Edit ──────────────────────────────────────────────────────────────────

    const openEdit = (s: StudentRow) => {
        setEditStudent(s);
        setEditForm({
            firstName: s.firstName ?? '',
            lastName: s.lastName ?? '',
            email: s.email,
            phoneNumber: s.phoneNumber ?? '',
            studentNumber: s.studentNumber,
            educationId: s.educationId != null ? String(s.educationId) : '',
            semester: s.semester != null ? String(s.semester) : '',
            enrollmentStatus: s.enrollmentStatus ?? 'ACTIVE',
        });
        setEditError(null);
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editStudent) return;
        setEditSubmitting(true); setEditError(null);
        try {
            const res = await fetch(`${API}/api/admin/students/${editStudent.studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: editForm.firstName,
                    lastName: editForm.lastName,
                    email: editForm.email,
                    phoneNumber: editForm.phoneNumber || null,
                    studentNumber: editForm.studentNumber,
                    educationId: editForm.educationId ? Number(editForm.educationId) : null,
                    semester: editForm.semester ? Number(editForm.semester) : null,
                    enrollmentStatus: editForm.enrollmentStatus,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `HTTP ${res.status}`);
            }
            setEditStudent(null);
            await loadStudents();
            showSuccess('Ændringer gemt.');
        } catch (e: unknown) {
            setEditError(e instanceof Error ? e.message : 'Fejl ved opdatering.');
        } finally {
            setEditSubmitting(false);
        }
    };

    // ── Disable / Enable ──────────────────────────────────────────────────────

    const handleDisable = async (id: number) => {
        if (!window.confirm('Er du sikker på, at du vil deaktivere denne studerende?')) return;
        try {
            const res = await fetch(`${API}/api/admin/students/${id}/disable`, { method: 'PATCH' });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `HTTP ${res.status}`);
            }
            await loadStudents();
            showSuccess('Studerende deaktiveret.');
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Fejl ved deaktivering.');
        }
    };

    const handleEnable = async (id: number) => {
        try {
            const res = await fetch(`${API}/api/admin/students/${id}/enable`, { method: 'PATCH' });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `HTTP ${res.status}`);
            }
            await loadStudents();
            showSuccess('Studerende aktiveret.');
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Fejl ved aktivering.');
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

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
                        onClick={() => { setShowCreate(c => !c); setCreateError(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 18px', backgroundColor: '#2d4a2d', color: '#fff',
                            border: 'none', borderRadius: '8px', fontSize: '14px',
                            fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
                        {showCreate ? <X size={15} /> : <Plus size={15} />}
                        {showCreate ? 'Annuller' : 'Opret studerende'}
                    </button>
                </div>

                {/* Success banner */}
                {successMsg && (
                    <div style={{ padding: '10px 16px', backgroundColor: '#e8f4ec', border: '1px solid #a3d6b0',
                        borderRadius: '8px', color: '#1a5c2e', fontSize: '14px', marginBottom: '16px' }}>
                        {successMsg}
                    </div>
                )}

                {/* Create form */}
                {showCreate && (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px',
                        padding: '24px 28px', marginBottom: '24px', maxWidth: '760px' }}>
                        <NormalText text="Opret ny studerende" size={16} color="#111" fontWeight={700} />
                        <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '14px 0 20px' }} />
                        {createError && (
                            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                                borderRadius: '6px', color: '#b91c1c', fontSize: '13px', marginBottom: '16px' }}>
                                {createError}
                            </div>
                        )}
                        <form onSubmit={handleCreate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Fornavn *</label>
                                    <input style={inputStyle} value={createForm.firstName} required
                                        onChange={e => setCreateForm(f => ({ ...f, firstName: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Efternavn *</label>
                                    <input style={inputStyle} value={createForm.lastName} required
                                        onChange={e => setCreateForm(f => ({ ...f, lastName: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email *</label>
                                    <input style={inputStyle} type="email" value={createForm.email} required
                                        onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Adgangskode *</label>
                                    <input style={inputStyle} type="password" value={createForm.password} required
                                        onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Studienummer *</label>
                                    <input style={inputStyle} value={createForm.studentNumber} required
                                        onChange={e => setCreateForm(f => ({ ...f, studentNumber: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Semester</label>
                                    <input style={inputStyle} type="number" min={1} max={12} value={createForm.semester}
                                        onChange={e => setCreateForm(f => ({ ...f, semester: e.target.value }))} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Uddannelse *</label>
                                    <select style={{ ...inputStyle, backgroundColor: '#fff' }} required
                                        value={createForm.educationId}
                                        onChange={e => setCreateForm(f => ({ ...f, educationId: e.target.value }))}>
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
                                <button type="submit" disabled={createSubmitting}
                                    style={{ padding: '10px 20px', backgroundColor: '#2d4a2d', color: '#fff',
                                        border: 'none', borderRadius: '7px', fontSize: '14px',
                                        fontFamily: 'inherit', fontWeight: 600,
                                        cursor: createSubmitting ? 'not-allowed' : 'pointer',
                                        opacity: createSubmitting ? 0.7 : 1 }}>
                                    {createSubmitting ? 'Opretter…' : 'Opret studerende'}
                                </button>
                                <button type="button" onClick={() => { setShowCreate(false); setCreateForm(emptyCreate); setCreateError(null); }}
                                    style={{ padding: '10px 18px', backgroundColor: '#fff', color: '#555',
                                        border: '1px solid #ccc', borderRadius: '7px', fontSize: '14px',
                                        fontFamily: 'inherit', cursor: 'pointer' }}>
                                    Annuller
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {error && (
                    <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                        borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>
                        Fejl: {error}
                    </div>
                )}

                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Søg efter navn, email eller studienummer..."
                    style={{ width: '360px', padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                        fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '20px',
                        boxSizing: 'border-box' }} />

                {loading ? <NormalText text="Henter studerende…" size={14} color="#999" /> : (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr>
                                    {['ID', 'Studienr.', 'Navn', 'Email', 'Tlf.', 'Uddannelse', 'Sem.', 'Status', 'Handlinger'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>Ingen studerende fundet.</td></tr>
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
                                        <td style={tdStyle}>{s.phoneNumber ?? '–'}</td>
                                        <td style={tdStyle}>{s.educationName ?? '–'}</td>
                                        <td style={tdStyle}>{s.semester ?? '–'}</td>
                                        <td style={tdStyle}>{statusBadge(s.enrollmentStatus)}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => openEdit(s)}
                                                    style={{ ...smallBtnBase, backgroundColor: '#f0f4ff', color: '#2d4a8a' }}>
                                                    Rediger
                                                </button>
                                                {s.enrollmentStatus === 'DISABLED' ? (
                                                    <button onClick={() => handleEnable(s.studentId)}
                                                        style={{ ...smallBtnBase, backgroundColor: '#e8f4ec', color: '#1a5c2e' }}>
                                                        Aktivér
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleDisable(s.studentId)}
                                                        style={{ ...smallBtnBase, backgroundColor: '#fef2f2', color: '#b91c1c' }}>
                                                        Deaktiver
                                                    </button>
                                                )}
                                            </div>
                                        </td>
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

            {/* Edit modal */}
            {editStudent && (
                <div
                    onClick={() => setEditStudent(null)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '28px 32px',
                            width: '580px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <NormalText text="Rediger studerende" size={18} color="#111" fontWeight={700} />
                            <button onClick={() => setEditStudent(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <X size={18} color="#888" />
                            </button>
                        </div>
                        <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
                            {[editStudent.firstName, editStudent.lastName].filter(Boolean).join(' ')} · {editStudent.studentNumber}
                        </div>
                        <div style={{ height: '1px', backgroundColor: '#f0f0f0', marginBottom: '20px' }} />

                        {editError && (
                            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                                borderRadius: '6px', color: '#b91c1c', fontSize: '13px', marginBottom: '16px' }}>
                                {editError}
                            </div>
                        )}

                        <form onSubmit={handleEdit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                <div>
                                    <label style={labelStyle}>Fornavn *</label>
                                    <input style={inputStyle} value={editForm.firstName} required
                                        onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Efternavn *</label>
                                    <input style={inputStyle} value={editForm.lastName} required
                                        onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email *</label>
                                    <input style={inputStyle} type="email" value={editForm.email} required
                                        onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Telefonnummer</label>
                                    <input style={inputStyle} value={editForm.phoneNumber}
                                        onChange={e => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Studienummer *</label>
                                    <input style={inputStyle} value={editForm.studentNumber} required
                                        onChange={e => setEditForm(f => ({ ...f, studentNumber: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Semester</label>
                                    <input style={inputStyle} type="number" min={1} max={12} value={editForm.semester}
                                        onChange={e => setEditForm(f => ({ ...f, semester: e.target.value }))} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Uddannelse</label>
                                    <select style={{ ...inputStyle, backgroundColor: '#fff' }}
                                        value={editForm.educationId}
                                        onChange={e => setEditForm(f => ({ ...f, educationId: e.target.value }))}>
                                        <option value="">– Uændret –</option>
                                        {educations.map(ed => (
                                            <option key={ed.educationId} value={ed.educationId}>
                                                {ed.code} – {ed.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Status</label>
                                    <select style={{ ...inputStyle, backgroundColor: '#fff' }}
                                        value={editForm.enrollmentStatus}
                                        onChange={e => setEditForm(f => ({ ...f, enrollmentStatus: e.target.value }))}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="DISABLED">DISABLED</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button type="submit" disabled={editSubmitting}
                                    style={{ padding: '10px 20px', backgroundColor: '#2d4a2d', color: '#fff',
                                        border: 'none', borderRadius: '7px', fontSize: '14px',
                                        fontFamily: 'inherit', fontWeight: 600,
                                        cursor: editSubmitting ? 'not-allowed' : 'pointer',
                                        opacity: editSubmitting ? 0.7 : 1 }}>
                                    {editSubmitting ? 'Gemmer…' : 'Gem ændringer'}
                                </button>
                                <button type="button" onClick={() => setEditStudent(null)}
                                    style={{ padding: '10px 18px', backgroundColor: '#fff', color: '#555',
                                        border: '1px solid #ccc', borderRadius: '7px', fontSize: '14px',
                                        fontFamily: 'inherit', cursor: 'pointer' }}>
                                    Annuller
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
