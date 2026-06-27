import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import NormalText from './NormalText.tsx';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div style={{
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            marginBottom: '8px',
            overflow: 'hidden',
            backgroundColor: '#fff',
        }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {open ? <ChevronDown size={16} color="#333" /> : <ChevronRight size={16} color="#333" />}
                    <NormalText text={title} size={15} color="#111" fontWeight={600} />
                </div>
                {open ? <ChevronUp size={16} color="#333" /> : <ChevronDown size={16} color="#333" />}
            </button>

            {open && (
                <div style={{ borderTop: '1px solid #e5e5e5' }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
