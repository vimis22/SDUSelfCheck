import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NormalText from '../components/NormalText.tsx';
import { useAuth } from '../auth/AuthContext.tsx';
import type { AuthUser } from '../auth/AuthContext.tsx';

function LoginPage() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message ?? 'Login mislykkedes.');
            }

            const data: AuthUser = await res.json();
            login(data);

            if (data.role === 'STUDENT')  navigate('/student-dashboard');
            else if (data.role === 'TEACHER') navigate('/teacher-dashboard');
            else if (data.role === 'ADMIN')   navigate('/admin-dashboard');
            else navigate('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login mislykkedes.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '11px 14px',
        border: '1px solid #d0d0d0',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box',
        color: '#111',
        backgroundColor: '#fff',
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f4f5f7',
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                padding: '48px 40px',
                width: '380px',
            }}>
                {/* SDU Branding */}
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <NormalText text="SDU" size={32} color="#000" fontWeight={700} />
                    <NormalText text="Selvbetjening" size={15} color="#555" fontWeight={400} />
                </div>

                <NormalText text="Log ind på din konto" size={18} color="#111" fontWeight={600} />
                <div style={{ marginBottom: '24px' }} />

                {error && (
                    <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: '8px',
                        color: '#b91c1c',
                        fontSize: '13px',
                        marginBottom: '16px',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <NormalText text="SDU-brugernavn / e-mail" size={13} color="#444" fontWeight={500} />
                        <input
                            type="email"
                            placeholder="navn@sdu.dk"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <NormalText text="Adgangskode" size={13} color="#444" fontWeight={500} />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '8px',
                            width: '100%',
                            padding: '12px',
                            backgroundColor: loading ? '#555' : '#111',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Logger ind…' : 'Log ind'}
                    </button>
                </form>

                {/* Test-credentials hint */}
                <div style={{
                    marginTop: '24px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#666',
                }}>
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>Testbrugere:</div>
                    <div>student@sdu.dk / password</div>
                    <div>teacher@sdu.dk / password</div>
                    <div>admin@sdu.dk / password</div>
                </div>

                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <NormalText text="Problemer med at logge ind? Kontakt IT-support." size={12} color="#aaa" />
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
