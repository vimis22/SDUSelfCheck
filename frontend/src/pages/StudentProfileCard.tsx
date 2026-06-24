import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

const student = {
    name:          'Vivek Misra',
    studienummer:  '12345678',
    udloeber:      '31.07.2026',
    status:        'Gyldigt',
};

// Simpel SVG QR-kode placeholder
function QRCodePlaceholder() {
    return (
        <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
            {/* Hjørne-kvadrater */}
            <rect x="4"  y="4"  width="28" height="28" rx="3" fill="none" stroke="#111" strokeWidth="4" />
            <rect x="12" y="12" width="12" height="12" fill="#111" />
            <rect x="64" y="4"  width="28" height="28" rx="3" fill="none" stroke="#111" strokeWidth="4" />
            <rect x="72" y="12" width="12" height="12" fill="#111" />
            <rect x="4"  y="64" width="28" height="28" rx="3" fill="none" stroke="#111" strokeWidth="4" />
            <rect x="12" y="72" width="12" height="12" fill="#111" />
            {/* Data-moduler */}
            <rect x="40" y="4"  width="8"  height="8"  fill="#111" />
            <rect x="52" y="4"  width="8"  height="8"  fill="#111" />
            <rect x="40" y="16" width="8"  height="8"  fill="#111" />
            <rect x="4"  y="40" width="8"  height="8"  fill="#111" />
            <rect x="16" y="40" width="8"  height="8"  fill="#111" />
            <rect x="4"  y="52" width="8"  height="8"  fill="#111" />
            <rect x="40" y="40" width="8"  height="8"  fill="#111" />
            <rect x="52" y="52" width="8"  height="8"  fill="#111" />
            <rect x="64" y="40" width="8"  height="8"  fill="#111" />
            <rect x="76" y="52" width="8"  height="8"  fill="#111" />
            <rect x="40" y="64" width="8"  height="8"  fill="#111" />
            <rect x="52" y="76" width="8"  height="8"  fill="#111" />
            <rect x="64" y="64" width="8"  height="8"  fill="#111" />
            <rect x="76" y="76" width="8"  height="8"  fill="#111" />
            <rect x="84" y="64" width="8"  height="8"  fill="#111" />
        </svg>
    );
}

function ProfilePage() {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="5. Studiekort" />

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
                    <NormalText text="Studiekort" size={28} color="#111" fontWeight={700} />
                </div>

                {/* Kort */}
                <div style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '28px 32px',
                    maxWidth: '600px',
                }}>
                    {/* Øverste sektion: info + QR */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <NormalText text={student.name} size={20} color="#111" fontWeight={700} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <NormalText text="Studienummer:" size={14} color="#555" fontWeight={400} />
                                <NormalText text={student.studienummer} size={14} color="#111" fontWeight={600} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <NormalText text="Udløber:" size={14} color="#555" fontWeight={400} />
                                <NormalText text={student.udloeber} size={14} color="#111" fontWeight={600} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <NormalText text="Status:" size={14} color="#555" fontWeight={400} />
                                <NormalText text={student.status} size={14} color="#111" fontWeight={600} />
                            </div>
                        </div>

                        {/* QR-kode */}
                        <div style={{
                            border: '1px solid #e5e5e5',
                            borderRadius: '8px',
                            padding: '8px',
                            backgroundColor: '#fff',
                        }}>
                            <QRCodePlaceholder />
                        </div>
                    </div>

                    {/* Knapper */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                        <button
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#2d4a2d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Bestil nyt kort
                        </button>
                        <button
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#fff',
                                color: '#111',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                fontWeight: 400,
                                cursor: 'pointer',
                            }}
                        >
                            Se vejledning
                        </button>
                    </div>

                    {/* Info-boks */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        backgroundColor: '#f0f4ff',
                        borderRadius: '8px',
                        padding: '14px 16px',
                    }}>
                        <Info size={16} color="#4a6fa5" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <NormalText
                            text="Husk altid at medbringe dit studiekort ved eksamen og på biblioteket."
                            size={13}
                            color="#333"
                        />
                    </div>
                </div>

            </main>
        </div>
    );
}

export default ProfilePage;
