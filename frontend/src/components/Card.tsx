import React from 'react';
import NormalText from './NormalText.tsx';

interface CardProps {
    title: string;
    amount?: number;
    descriptiveText?: string;
    extraText?: string;
}

const Card: React.FC<CardProps> = ({ title, amount, descriptiveText, extraText }) => {
    return (
        <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '10px',
            padding: '16px 20px',
            minWidth: '150px',
            flex: 1,
        }}>
            <NormalText text={title} size={13} color="#666" fontWeight={400} />
            {amount !== undefined && (
                <NormalText text={String(amount)} size={30} color="#111" fontWeight={700} />
            )}
            {descriptiveText && (
                <NormalText text={descriptiveText} size={13} color="#444" fontWeight={400} />
            )}
            {extraText && (
                <NormalText text={extraText} size={12} color="#888" fontWeight={400} />
            )}
        </div>
    );
};

export default Card;
