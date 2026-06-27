import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NormalText from '../components/NormalText.tsx';

function LoginPage() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/');
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

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <NormalText text="SDU-brugernavn / e-mail" size={13} color="#444" fontWeight={500} />
                        <input
                            type="email"
                            placeholder="navn@student.sdu.dk"
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
                        style={{
                            marginTop: '8px',
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#111',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Log ind
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <NormalText text="Problemer med at logge ind? Kontakt IT-support." size={12} color="#aaa" />
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
