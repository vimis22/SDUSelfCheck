import React from 'react';
import {
    Home,
    BookOpen,
    ClipboardList,
    BarChart2,
    CreditCard,
    Printer,
    Mail,
    User,
    HelpCircle,
} from 'lucide-react';
import NormalText from '../components/NormalText.tsx';
import NormalButton from '../components/NormalButton.tsx';
import SideBarItem from '../components/SideBarItem.tsx';

const navItems = [
    { text: 'Home',           icon: <Home size={20} />,         to: '/' },
    { text: 'Undervisning',   icon: <BookOpen size={20} />,     to: '/courses' },
    { text: 'Eksamen',        icon: <ClipboardList size={20} />,to: '/exams' },
    { text: 'Resultater',     icon: <BarChart2 size={20} />,    to: '/results' },
    { text: 'Studiekort',     icon: <CreditCard size={20} />,   to: '/student-card' },
    { text: 'Udskrifter',     icon: <Printer size={20} />,      to: '/documents' },
    { text: 'Beskeder',       icon: <Mail size={20} />,         to: '/messages' },
    { text: 'Profil',         icon: <User size={20} />,         to: '/profile' },
    { text: 'Hjælp & Support',icon: <HelpCircle size={20} />,  to: '/help' },
];

const SidePanel = () => {
    return (
        <aside style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '220px',
            minHeight: '100vh',
            padding: '24px 12px',
            backgroundColor: '#ffffff',
            boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        }}>
            <div>
                {/* Logo + titel */}
                <div style={{ paddingLeft: '16px', marginBottom: '24px' }}>
                    <NormalText text="SDU" size={26} color="#000" fontWeight={700} />
                    <NormalText text="Selvbetjening" size={14} color="#555" fontWeight={400} />
                </div>

                {/* Nav-punkter */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navItems.map((item) => (
                        <SideBarItem
                            key={item.to}
                            text={item.text}
                            icon={item.icon}
                            to={item.to}
                        />
                    ))}
                </nav>
            </div>

            {/* Log ud-knap */}
            <div style={{ padding: '0 8px' }}>
                <NormalButton text="Log ud" onClick={() => console.log('Log ud')} />
            </div>
        </aside>
    );
};

export default SidePanel;
