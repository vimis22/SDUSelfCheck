import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

function HelpSupportPage() {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="7. Hjælp & Support" />

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

                <div style={{ marginBottom: '32px' }}>
                    <NormalText text="Hjælp & Support" size={28} color="#111" fontWeight={700} />
                </div>

                {/* Indhold-kort */}
                <div style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '32px 36px',
                    maxWidth: '680px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}>
                    <NormalText
                        text="Dette er et selvbetjeningssystem for studerende på institutionen."
                        size={15}
                        color="#222"
                    />

                    <NormalText
                        text="Før musen hen over menulinien og se indenfor hvilke områder, der findes selvbetjenings-muligheder."
                        size={15}
                        color="#222"
                    />

                    <NormalText
                        text="Klik på et af emnerne under menuen for at komme videre."
                        size={15}
                        color="#222"
                    />

                    <div>
                        <NormalText
                            text="Hvis du har problemer af it-teknisk karakter kan du kontakte vores "
                            size={15}
                            color="#222"
                        />
                        <a
                            href="mailto:Servicedesk@sdu.dk"
                            style={{ fontSize: '15px', color: '#4a7c4e', textDecoration: 'none' }}
                        >
                            Servicedesk@sdu.dk
                        </a>
                    </div>

                    <NormalText
                        text="Hvis du har problemer med at se alle dine resultater, tilmeldinger eller tilmeldingsblanketter, skal du kontakte dit eksamenskontor."
                        size={15}
                        color="#222"
                    />
                </div>

            </main>
        </div>
    );
}

export default HelpSupportPage;
