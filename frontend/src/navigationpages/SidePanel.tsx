import { useNavigate } from 'react-router-dom';
import NormalText from '../components/NormalText.tsx';
import NormalButton from '../components/NormalButton.tsx';
import SideBarItem from '../components/SideBarItem.tsx';
import { useAuth } from '../auth/AuthContext.tsx';
import { getNavItemsByRole } from './NavigationItem.tsx';

const SidePanel = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const navItems = user ? getNavItemsByRole(user.role) : [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

                {/* Nav-punkter baseret på rolle */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navItems.map((item) => (
                        <SideBarItem
                            key={item.text + item.to}
                            text={item.text}
                            icon={item.icon}
                            to={item.to}
                        />
                    ))}
                </nav>
            </div>

            {/* Log ud-knap */}
            <div style={{ padding: '0 8px' }}>
                <NormalButton text="Log ud" onClick={handleLogout} />
            </div>
        </aside>
    );
};

export default SidePanel;
