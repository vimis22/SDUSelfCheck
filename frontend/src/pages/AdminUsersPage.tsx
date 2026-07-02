import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

const API = 'http://localhost:8081';

type UserRow = {
    userId: number;
    email: string;
    role: string;
    status: string | null;
    firstName: string | null;
    lastName: string | null;
    studentId: number | null;
    teacherId: number | null;
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

function roleBadge(role: string) {
    const map: Record<string, { bg: string; color: string }> = {
        STUDENT: { bg: '#e0ecff', color: '#1a4fa8' },
        TEACHER: { bg: '#f3e8ff', color: '#7c3aed' },
        ADMIN:   { bg: '#fff3cd', color: '#856404' },
    };
    const s = map[role] ?? { bg: '#f0f0f0', color: '#555' };
    return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600, backgroundColor: s.bg, color: s.color }}>
            {role}
        </span>
    );
}

function statusBadge(status: string | null) {
    const active = status === 'ACTIVE' || status == null;
    return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600,
            backgroundColor: active ? '#e8f4ec' : '#fef2f2',
            color: active ? '#1a5c2e' : '#b91c1c' }}>
            {active ? 'ACTIVE' : 'DISABLED'}
        </span>
    );
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionMsg, setActionMsg] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API}/api/admin/users`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setUsers(await res.json());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl ved hentning.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const patchUser = async (id: number, action: 'disable' | 'enable') => {
        setActionMsg(null);
        try {
            const res = await fetch(`${API}/api/admin/users/${id}/${action}`, { method: 'PATCH' });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message ?? 'Fejl.');
            setActionMsg(data?.message ?? 'Opdateret.');
            await fetchUsers();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Fejl.');
        }
    };

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = u.email.toLowerCase().includes(q)
            || (u.firstName ?? '').toLowerCase().includes(q)
            || (u.lastName ?? '').toLowerCase().includes(q);
        const matchRole = filterRole === 'ALL' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Admin / Brugere" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button onClick={() => navigate('/admin-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <NormalText text="Brugere" size={28} color="#111" fontWeight={700} />
                    <NormalText text="Administrer login-brugere og roller." size={14} color="#666" fontWeight={400} />
                </div>

                {error && <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '8px', color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>Fejl: {error}</div>}
                {actionMsg && <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #86efac',
                    borderRadius: '8px', color: '#166534', fontSize: '14px', marginBottom: '16px' }}>{actionMsg}</div>}

                {/* Search + filter */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Søg efter email eller navn..."
                        style={{ flex: 1, padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                            fontSize: '14px', fontFamily: 'inherit', outline: 'none' }} />
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                        style={{ padding: '9px 14px', border: '1px solid #d0d0d0', borderRadius: '8px',
                            fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#fff', cursor: 'pointer' }}>
                        <option value="ALL">Alle roller</option>
                        <option value="STUDENT">STUDENT</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>

                {loading ? <NormalText text="Henter brugere…" size={14} color="#999" /> : (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['ID', 'Email', 'Navn', 'Rolle', 'Status', 'Student ID', 'Teacher ID', ''].map(h => (
                                        <th key={h || 'action'} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>Ingen brugere fundet.</td></tr>
                                ) : filtered.map(u => (
                                    <tr key={u.userId} style={{ backgroundColor: '#fff' }}>
                                        <td style={tdStyle}>{u.userId}</td>
                                        <td style={tdStyle}>{u.email}</td>
                                        <td style={tdStyle}>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '–'}</td>
                                        <td style={tdStyle}>{roleBadge(u.role)}</td>
                                        <td style={tdStyle}>{statusBadge(u.status)}</td>
                                        <td style={tdStyle}>{u.studentId ?? '–'}</td>
                                        <td style={tdStyle}>{u.teacherId ?? '–'}</td>
                                        <td style={{ ...tdStyle, width: '160px' }}>
                                            {u.status === 'DISABLED' ? (
                                                <button onClick={() => patchUser(u.userId, 'enable')}
                                                    style={{ padding: '6px 14px', backgroundColor: '#1a3a2a', color: '#fff',
                                                        border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                        fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}>
                                                    Aktivér
                                                </button>
                                            ) : (
                                                <button onClick={() => patchUser(u.userId, 'disable')}
                                                    style={{ padding: '6px 14px', backgroundColor: '#9b1c1c', color: '#fff',
                                                        border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                        fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}>
                                                    Deaktivér
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div style={{ marginTop: '12px' }}>
                    <NormalText text={`${filtered.length} bruger(e) vist`} size={12} color="#aaa" />
                </div>
            </main>
        </div>
    );
}
