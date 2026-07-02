import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, X } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

const API = 'http://localhost:8081';

type TeacherRow = {
    teacherId: number;
    employeeNumber: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phoneNumber: string | null;
    department: string | null;
    title: string | null;
    status: string | null;
};

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
    const active = status !== 'DISABLED';
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600,
            backgroundColor: active ? '#e8f4ec' : '#fef2f2',
            color: active ? '#1a5c2e' : '#b91c1c',
        }}>
            {status ?? 'ACTIVE'}
        </span>
    );
}

const emptyCreate = { firstName: '', lastName: '', email: '', password: '', employeeNumber: '', department: '' };
const emptyEdit = { firstName: '', lastName: '', email: '', phoneNumber: '', employeeNumber: '', department: '', title: '', status: 'ACTIVE' };

export default function AdminTeachersPage() {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState<TeacherRow[]>([]);
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
    const [editTeacher, setEditTeacher] = useState<TeacherRow | null>(null);
    const [editForm, setEditForm] = useState(emptyEdit);
    const [editError, setEditError] = useState<string | null>(null);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const loadTeachers = async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API}/api/admin/teachers`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setTeachers(await res.json());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTeachers(); }, []);

    const filtered = teachers.filter(t => {
        const q = search.toLowerCase();
        return t.employeeNumber.toLowerCase().includes(q)
            || (t.email ?? '').toLowerCase().includes(q)
            || (t.firstName ?? '').toLowerCase().includes(q)
            || (t.lastName ?? '').toLowerCase().includes(q)
            || (t.department ?? '').toLowerCase().includes(q);
    });

    // ── Create ────────────────────────────────────────────────────────────────

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateSubmitting(true); setCreateError(null);
        try {
            const res = await fetch(`${API}/api/admin/teachers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: createForm.firstName,
                    lastName: createForm.lastName,
                    email: createForm.email,
                    password: createForm.password,
                    employeeNumber: createForm.employeeNumber,
                    department: createForm.department || null,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `HTTP ${res.status}`);
            }
            setCreateForm(emptyCreate);
            setShowCreate(false);
            await loadTeachers();
            showSuccess('Underviser oprettet.');
        } catch (e: unknown) {
            setCreateError(e instanceof Error ? e.message : 'Fejl ved oprettelse.');
        } finally {
            setCreateSubmitting(false);
        }
    };

    // ── Edit ──────────────────────────────────────────────────────────────────

    const openEdit = (t: TeacherRow) => {
        setEditTeacher(t);
        setEditForm({
            firstName: t.firstName ?? '',
            lastName: t.lastName ?? '',
            email: t.email ?? '',
            phoneNumber: t.phoneNumber ?? '',
            employeeNumber: t.employeeNumber,
            department: t.department ?? '',
            title: t.title ?? '',
            status: t.status ?? 'ACTIVE',
        });
        setEditError(null);
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTeacher) return;
        setEditSubmitting(true); setEditError(null);
        try {
            const res = await fetch(`${API}/api/admin/teachers/${editTeacher.teacherId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: editForm.firstName,
                    lastName: editForm.lastName,
                    email: editForm.email,
                    phoneNumber: editForm.phoneNumber || null,
                    employeeNumber: editForm.employeeNumber,
                    department: editForm.department || null,
                    title: editForm.title || null,
                    status: editForm.status,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `HTTP ${res.status}`);
            }
            setEditTeacher(null);
            await loadTeachers();
            showSuccess('Ændringer gemt.');
        } catch (e: unknown) {
            setEditError(e instanceof Error ? e.message : 'Fejl ved opdatering.');
        } finally {
            setEditSubmitting(false);
        }
    };

    // ── Disable / Enable ──────────────────────────────────────────────────────

    const handleDisable = async (id: number) => {
        if (!window.confirm('Er du sikker på, at du vil deaktivere denne underviser?')) return;
        try {
            const res = await fetch(`${API}/api/admin/teachers/${id}/disable`, { method: 'PATCH' });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `HTTP ${res.status}`);
            }
            await loadTeachers();
            showSuccess('Underviser deaktiveret.');
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Fejl ved deaktivering.');
        }
    };

    const handleEnable = async (id: number) => {
        try {
            const res = await fetch(`${API}/api/admin/teachers/${id}/enable`, { method: 'PATCH' });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `HTTP ${res.status}`);
            }
            await loadTeachers();
            showSuccess('Underviser aktiveret.');
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Fejl ved aktivering.');
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Admin / Undervisere" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>

                <button onClick={() => navigate('/admin-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <NormalText text="Undervisere" size={28} color="#111" fontWeight={700} />
                        <NormalText text="Oversigt over alle undervisere i systemet." size={14} color="#666" fontWeight={400} />
                    </div>
                    <button
                        onClick={() => { setShowCreate(c => !c); setCreateError(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 18px', backgroundColor: '#2d4a2d', color: '#fff',
                            border: 'none', borderRadius: '8px', fontSize: '14px',
                            fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
                        {showCreate ? <X size={15} /> : <Plus size={15} />}
                        {showCreate ? 'Annuller' : 'Opret underviser'}
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
                        <NormalText text="Opret ny underviser" size={16} color="#111" fontWeight={700} />
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
                                    <label style={labelStyle}>Medarbejdernummer *</label>
                                    <input style={inputStyle} value={createForm.employeeNumber} required
                                        onChange={e => setCreateForm(f => ({ ...f, employeeNumber: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Afdeling</label>
                                    <input style={inputStyle} value={createForm.department}
                                        onChange={e => setCreateForm(f => ({ ...f, department: e.target.value }))} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" disabled={createSubmitting}
                                    style={{ padding: '10px 20px', backgroundColor: '#2d4a2d', color: '#fff',
                                        border: 'none', borderRadius: '7px', fontSize: '14px',
                                        fontFamily: 'inherit', fontWeight: 600,
                                        cursor: createSubmitting ? 'not-allowed' : 'pointer',
                                        opacity: createSubmitting ? 0.7 : 1 }}>
                                    {createSubmitting ? 'Opretter…' : 'Opret underviser'}
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
                    placeholder="Søg efter navn, email eller afdeling..."
                    style={{ width: '360px', padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                        fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '20px',
                        boxSizing: 'border-box' }} />

                {loading ? <NormalText text="Henter undervisere…" size={14} color="#999" /> : (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr>
                                    {['ID', 'Medarbejdernr.', 'Navn', 'Email', 'Tlf.', 'Afdeling', 'Titel', 'Status', 'Handlinger'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>Ingen undervisere fundet.</td></tr>
                                ) : filtered.map(t => (
                                    <tr key={t.teacherId}>
                                        <td style={tdStyle}>{t.teacherId}</td>
                                        <td style={tdStyle}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#555' }}>
                                                {t.employeeNumber}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 500 }}>
                                            {[t.firstName, t.lastName].filter(Boolean).join(' ') || '–'}
                                        </td>
                                        <td style={tdStyle}>{t.email ?? '–'}</td>
                                        <td style={tdStyle}>{t.phoneNumber ?? '–'}</td>
                                        <td style={tdStyle}>{t.department ?? '–'}</td>
                                        <td style={tdStyle}>{t.title ?? '–'}</td>
                                        <td style={tdStyle}>{statusBadge(t.status)}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => openEdit(t)}
                                                    style={{ ...smallBtnBase, backgroundColor: '#f0f4ff', color: '#2d4a8a' }}>
                                                    Rediger
                                                </button>
                                                {t.status === 'DISABLED' ? (
                                                    <button onClick={() => handleEnable(t.teacherId)}
                                                        style={{ ...smallBtnBase, backgroundColor: '#e8f4ec', color: '#1a5c2e' }}>
                                                        Aktivér
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleDisable(t.teacherId)}
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
                    <NormalText text={`${filtered.length} underviser(e) vist`} size={12} color="#aaa" />
                </div>
            </main>

            {/* Edit modal */}
            {editTeacher && (
                <div
                    onClick={() => setEditTeacher(null)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '28px 32px',
                            width: '580px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <NormalText text="Rediger underviser" size={18} color="#111" fontWeight={700} />
                            <button onClick={() => setEditTeacher(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <X size={18} color="#888" />
                            </button>
                        </div>
                        <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
                            {[editTeacher.firstName, editTeacher.lastName].filter(Boolean).join(' ')} · {editTeacher.employeeNumber}
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
                                    <label style={labelStyle}>Medarbejdernummer *</label>
                                    <input style={inputStyle} value={editForm.employeeNumber} required
                                        onChange={e => setEditForm(f => ({ ...f, employeeNumber: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Afdeling</label>
                                    <input style={inputStyle} value={editForm.department}
                                        onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Titel</label>
                                    <input style={inputStyle} value={editForm.title}
                                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Status</label>
                                    <select style={{ ...inputStyle, backgroundColor: '#fff' }}
                                        value={editForm.status}
                                        onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
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
                                <button type="button" onClick={() => setEditTeacher(null)}
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
