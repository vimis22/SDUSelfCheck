import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';
import { useAuth } from '../auth/AuthContext.tsx';

const API = 'http://localhost:8081';

type StudentCard = {
    cardId: number;
    studentId: number;
    studentNumber: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    educationName: string | null;
    cardNumber: string;
    validUntil: string | null;   // "YYYY-MM-DD"
    status: string;              // VALID | EXPIRED | BLOCKED
    qrCodeValue: string;
};

function statusLabel(status: string): string {
    switch (status) {
        case 'VALID':   return 'Gyldigt';
        case 'EXPIRED': return 'Udløbet';
        case 'BLOCKED': return 'Spærret';
        default:        return status;
    }
}

function statusColor(status: string): { bg: string; color: string } {
    switch (status) {
        case 'VALID':   return { bg: '#e8f4ec', color: '#1a5c2e' };
        case 'EXPIRED': return { bg: '#fef2f2', color: '#b91c1c' };
        case 'BLOCKED': return { bg: '#fff3cd', color: '#856404' };
        default:        return { bg: '#f0f0f0', color: '#555' };
    }
}

function formatDate(value: string | null): string {
    if (!value) return '–';
    return new Date(value).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
            <span style={{ fontSize: '14px', color: '#555', minWidth: '110px' }}>{label}</span>
            <span style={{ fontSize: '14px', color: '#111', fontWeight: 600 }}>{value}</span>
        </div>
    );
}

export default function StudentProfileCard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const studentId = user?.studentId ?? null;

    const [card, setCard] = useState<StudentCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (studentId == null) { setLoading(false); return; }

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API}/api/student-cards/student/${studentId}`);
                if (!res.ok) {
                    const body = await res.json().catch(() => null);
                    throw new Error(body?.message ?? `HTTP ${res.status}`);
                }
                setCard(await res.json());
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Fejl ved hentning af studiekort.');
            } finally {
                setLoading(false);
            }
        })();
    }, [studentId]);

    if (studentId == null) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
                <TopBar breadcrumb="Profil & Studiekort" />
                <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                    <NormalText text="Student ID mangler. Log ud og log ind igen." size={15} color="#b91c1c" fontWeight={600} />
                </main>
            </div>
        );
    }

    const sc = statusColor(card?.status ?? '');
    const fullName = [card?.firstName, card?.lastName].filter(Boolean).join(' ') || '–';
    const qrSrc = card?.qrCodeValue
        ? `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(card.qrCodeValue)}&margin=4`
        : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Profil & Studiekort" />

            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0', marginBottom: '16px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <NormalText text="Profil & Studiekort" size={28} color="#111" fontWeight={700} />
                </div>

                {loading && <NormalText text="Henter studiekort…" size={14} color="#999" />}

                {error && (
                    <div style={{ padding: '14px 16px', backgroundColor: '#fef2f2',
                        border: '1px solid #fca5a5', borderRadius: '8px',
                        color: '#b91c1c', fontSize: '14px', maxWidth: '600px' }}>
                        Fejl: {error}
                    </div>
                )}

                {!loading && !error && card && (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5',
                        borderRadius: '12px', padding: '28px 32px', maxWidth: '620px' }}>

                        {/* Top row: student info + QR code */}
                        <div style={{ display: 'flex', justifyContent: 'space-between',
                            alignItems: 'flex-start', marginBottom: '24px' }}>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                                <NormalText text={fullName} size={22} color="#111" fontWeight={700} />
                                <InfoRow label="Studienummer"  value={card.studentNumber} />
                                <InfoRow label="Uddannelse"    value={card.educationName ?? '–'} />
                                <InfoRow label="Kortnummer"    value={card.cardNumber} />
                                <InfoRow label="Udløber"       value={formatDate(card.validUntil)} />
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '14px', color: '#555', minWidth: '110px' }}>Status</span>
                                    <span style={{ display: 'inline-block', padding: '3px 12px',
                                        borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                                        backgroundColor: sc.bg, color: sc.color }}>
                                        {statusLabel(card.status)}
                                    </span>
                                </div>
                            </div>

                            {/* QR code */}
                            <div style={{ border: '1px solid #e5e5e5', borderRadius: '10px',
                                padding: '8px', backgroundColor: '#fff', flexShrink: 0,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                {qrSrc ? (
                                    <img
                                        src={qrSrc}
                                        alt="Studiekort QR-kode"
                                        width={100}
                                        height={100}
                                        style={{ display: 'block', borderRadius: '4px' }}
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <div style={{ width: 100, height: 100, backgroundColor: '#f0f0f0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '4px', fontSize: '11px', color: '#aaa' }}>QR</div>
                                )}
                                <span style={{ fontSize: '10px', color: '#aaa' }}>QR-kode</span>
                            </div>
                        </div>

                        <div style={{ height: '1px', backgroundColor: '#f0f0f0', marginBottom: '20px' }} />

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                            <button style={{ padding: '10px 20px', backgroundColor: '#2d4a2d', color: '#fff',
                                border: 'none', borderRadius: '8px', fontSize: '14px',
                                fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
                                Bestil nyt kort
                            </button>
                            <button style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#111',
                                border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px',
                                fontFamily: 'inherit', fontWeight: 400, cursor: 'pointer' }}>
                                Se vejledning
                            </button>
                        </div>

                        {/* Info box */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px',
                            backgroundColor: '#f0f4ff', borderRadius: '8px', padding: '14px 16px' }}>
                            <Info size={16} color="#4a6fa5" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <NormalText
                                text="Husk altid at medbringe dit studiekort ved eksamen og på biblioteket."
                                size={13} color="#333" />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
