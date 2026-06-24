import React from 'react';

interface NormalTextProps {
    text: string;
    size: number;
    color?: string;
    fontWeight?: number;
}

const NormalText: React.FC<NormalTextProps> = ({text, size, color = '#111', fontWeight = 400}) => {
    return (
        <div style={{fontSize: `${size}px`, color: color, fontWeight: fontWeight}}>
            {text}
        </div>
    )
}

export default NormalText;