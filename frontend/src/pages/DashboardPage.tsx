import React from 'react';
import NormalText from '../components/NormalText.tsx';
import Card from '../components/Card.tsx';
import TopBar from '../navigationpages/TopBar.tsx';
import InfoPanel from '../navigationpages/InfoPanel.tsx';
import ShortCutsTab from '../navigationpages/ShortCutsTab.tsx';

const overviewCards = [
    { title: 'Undervisning', amount: 2,  descriptiveText: 'tilmeldinger',       extraText: 'Forårssemestret 2026'    },
    { title: 'Eksamen',      amount: 3,  descriptiveText: 'kommende eksamener', extraText: 'Vintereksamen 2025-26'   },
    { title: 'Resultater',   amount: 20, descriptiveText: 'beståede  •  Gns. 8.4', extraText: ''                    },
    { title: 'Studiekort',   amount: undefined, descriptiveText: 'Gyldig',      extraText: 'Udløber 31.07.2026'      },
];

function DashboardPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
            <TopBar breadcrumb="1. Forside / Dashboard" />

            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>

                {/* Hilsen */}
                <div style={{ marginBottom: '32px' }}>
                    <NormalText text="Hej Vivek 👋" size={28} color="#111" fontWeight={700} />
                    <NormalText text="Velkommen til SDU Selvbetjening" size={15} color="#666" fontWeight={400} />
                </div>

                {/* Overblik */}
                <section style={{ marginBottom: '36px' }}>
                    <NormalText text="Overblik" size={17} color="#111" fontWeight={600} />
                    <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
                        {overviewCards.map((card) => (
                            <Card key={card.title} {...card} />
                        ))}
                    </div>
                </section>

                {/* Beskeder + Genveje */}
                <div style={{ display: 'flex', gap: '48px' }}>
                    <section style={{ flex: 2 }}>
                        <NormalText text="Beskeder" size={17} color="#111" fontWeight={600} />
                        <div style={{ marginTop: '8px' }}>
                            <InfoPanel />
                        </div>
                    </section>

                    <section style={{ flex: 1 }}>
                        <NormalText text="Genveje" size={17} color="#111" fontWeight={600} />
                        <div style={{ marginTop: '8px' }}>
                            <ShortCutsTab />
                        </div>
                    </section>
                </div>

            </main>
        </div>
    );
}

export default DashboardPage;
