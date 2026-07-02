import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TopBar from '../navigationpages/TopBar.tsx';
import NormalText from '../components/NormalText.tsx';

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
    {
        q: 'Hvordan indtaster jeg karakterer?',
        a: 'Gå til "Indtast karakterer" i menuen. Under fanen "Mangler karakter" ser du alle eksamenstilmeldinger uden karakter for dine fag. Klik "Indtast karakter" ud for en tilmelding, vælg karakter fra listen, og klik "Gem karakter". ECTS-grade og bestået-status beregnes automatisk.',
    },
    {
        q: 'Hvordan retter jeg en eksisterende karakter?',
        a: 'Gå til "Indtast karakterer" og vælg fanen "Afgivne karakterer". Find den karakter du ønsker at rette, og klik "Ret". Foretag dine ændringer og klik "Gem ændring". Den eksisterende karakter opdateres — der oprettes ikke en ny.',
    },
    {
        q: 'Hvorfor kan jeg ikke se et fag?',
        a: 'Du kan kun se fag, du er tilknyttet som underviser. Hvis du mener, du mangler adgang til et fag, skal du kontakte studieadministrationen (admin@sdu.dk).',
    },
    {
        q: 'Kan jeg se hvilke studerende der er tilmeldt eksamen?',
        a: 'Ja. Gå til "Eksamen" i menuen og find den relevante eksamen. Klik "Se tilmeldte" for at se alle studerende med eksamenstilmelding, deres status og om de allerede har fået en karakter.',
    },
    {
        q: 'Hvad sker der, når en studerende dumper?',
        a: 'Når du giver karakteren 00 eller -3, markeres resultatet som "Ikke bestået". Den studerende kan herefter selv tilmelde sig re-eksamen fra sin resultatside. Re-eksamen oprettes ikke automatisk.',
    },
    {
        q: 'Hvem kontakter jeg ved tekniske fejl?',
        a: 'Kontakt studieadministrationen på admin@sdu.dk eller brug SDU\'s interne IT-support.',
    },
];

export default function TeacherSupportPage() {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            <TopBar breadcrumb="Teacher / Hjælp & Support" />
            <main style={{ padding: '36px 40px', flex: 1, backgroundColor: '#fafafa' }}>
                <button onClick={() => navigate('/teacher-dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                        border: 'none', cursor: 'pointer', padding: '0', marginBottom: '20px' }}>
                    <ChevronLeft size={16} color="#555" />
                    <NormalText text="Tilbage" size={13} color="#555" fontWeight={400} />
                </button>

                <div style={{ marginBottom: '28px' }}>
                    <NormalText text="Hjælp & Support" size={28} color="#111" fontWeight={700} />
                    <NormalText
                        text="Her kan undervisere finde hjælp til karaktergivning, eksamen og fagoversigter."
                        size={14} color="#666" fontWeight={400}
                    />
                </div>

                <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {faqs.map((faq, i) => (
                        <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5',
                            borderRadius: '10px', padding: '20px 24px' }}>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '8px' }}>
                                {faq.q}
                            </div>
                            <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '32px', padding: '16px 20px', backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac', borderRadius: '10px', maxWidth: '760px' }}>
                    <NormalText text="Kontakt" size={14} color="#166534" fontWeight={600} />
                    <div style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>
                        Studieadministration: <strong>admin@sdu.dk</strong>
                    </div>
                </div>
            </main>
        </div>
    );
}
