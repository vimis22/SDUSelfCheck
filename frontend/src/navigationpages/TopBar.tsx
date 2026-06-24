import React from 'react';
import { Search, HelpCircle } from 'lucide-react';
import NormalText from '../components/NormalText.tsx';

interface TopBarProps {
    breadcrumb: string;
}

const TopBar: React.FC<TopBarProps> = ({ breadcrumb }) => {
    return (
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 28px', borderBottom: '1px solid #e8e8e8', backgroundColor: '#fff',
        }}>
            <NormalText text={breadcrumb} size={13} color="#888" fontWeight={400} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Search size={18} color="#555" style={{ cursor: 'pointer' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <HelpCircle size={18} color="#555" />
                    <NormalText text="Hjælp" size={13} color="#555" fontWeight={400} />
                </div>

                <div style={{width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2c2c2c',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                    <NormalText text="VM" size={11} color="#fff" fontWeight={600} />
                </div>
            </div>
        </header>
    );
};

export default TopBar;
