import React from 'react';

interface NormalButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
}

const NormalButton: React.FC<NormalButtonProps> = ({ text, onClick, disabled }) => {
    return (
        <button onClick={onClick} disabled={disabled}>
            {text}
        </button>
    );
};

export default NormalButton;