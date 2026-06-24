import React from 'react';
import { Mail } from 'lucide-react';
import NormalText from '../components/NormalText.tsx';

interface MessageItemProps {
    title: string;
    description: string;
    date: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ title, description, date }) => (
    <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 0',
        borderBottom: '1px solid #eee',
    }}>
        <div style={{ color: '#555', marginTop: '2px', flexShrink: 0 }}>
            <Mail size={18} />
        </div>
        <div style={{ flex: 1 }}>
            <NormalText text={title} size={14} color="#111" fontWeight={500} />
            <NormalText text={description} size={12} color="#777" fontWeight={400} />
        </div>
        <NormalText text={date} size={12} color="#aaa" fontWeight={400} />
    </div>
);

const messages: MessageItemProps[] = [
    {
        title: 'Studiekort: Bestil dit studiekort',
        description: 'Husk, at bestille eller forny dit studiekort i god tid.',
        date: '12.06.2026',
    },
    {
        title: 'Eksamensplan offentliggjort',
        description: 'Din eksamensplan for Vintereksamen 2025-2026 er klar',
        date: '10.06.2026',
    },
];

const InfoPanel = () => {
    return (
        <div>
            {messages.map((msg) => (
                <MessageItem key={msg.title} {...msg} />
            ))}
            <div style={{ marginTop: '14px', cursor: 'pointer' }}>
                <NormalText text="Se alle beskeder" size={13} color="#0056a0" fontWeight={500} />
            </div>
        </div>
    );
};

export default InfoPanel;
