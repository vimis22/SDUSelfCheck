import React from 'react';
import { NavLink } from 'react-router-dom';
import NormalText from './NormalText.tsx';

interface SideBarItemProps {
    text: string;
    icon: React.ReactNode;
    to: string;
}

const SideBarItem: React.FC<SideBarItemProps> = ({ text, icon, to }) => {
    return (
        <NavLink
            to={to}
            style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: isActive ? '#f0f0f0' : 'transparent',
                borderLeft: isActive ? '3px solid #333' : '3px solid transparent',
                color: '#333',
            })}
        >
            {icon}
            <NormalText text={text} size={15} color="#333" fontWeight={400} />
        </NavLink>
    );
};

export default SideBarItem;
