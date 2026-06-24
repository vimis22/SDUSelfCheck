import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import NormalText from '../components/NormalText.tsx';

const shortcuts = [
    { text: 'Bestil studiekort',        to: '/student-card' },
    { text: 'Se resultater',            to: '/results' },
    { text: 'Udskrifter',               to: '/documents' },
    { text: 'Kontakt studievejledning', to: '/help' },
];

const ShortCutsTab = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {shortcuts.map((s) => (
                <Link
                    key={s.to}
                    to={s.to}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        textDecoration: 'none',
                        borderBottom: '1px solid #eee',
                    }}
                >
                    <NormalText text={s.text} size={14} color="#111" fontWeight={400} />
                    <ChevronRight size={16} color="#aaa" />
                </Link>
            ))}
        </div>
    );
};

export default ShortCutsTab;
