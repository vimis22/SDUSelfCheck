import { useNavigate } from 'react-router-dom';
import NormalText from '../components/NormalText.tsx';
import NormalButton from '../components/NormalButton.tsx';
import SideBarItem from '../components/SideBarItem.tsx';
import { navItems } from './NavigationItem.tsx';

const SidePanel = () => {
    const navigate = useNavigate();

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

                {/* Simple rolle-knapper */}
                <div style={{
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div style={{ paddingLeft: '16px' }}>
                        <NormalText text="Demo roller" size={13} color="#777" fontWeight={700} />
                    </div>

                    <button
                        onClick={() => navigate('/student-dashboard')}
                        style={dashboardButtonStyle}
                    >
                        Student Dashboard
                    </button>

                    <button
                        onClick={() => navigate('/teacher-dashboard')}
                        style={dashboardButtonStyle}
                    >
                        Teacher Dashboard
                    </button>

                    <button
                        onClick={() => navigate('/admin-dashboard')}
                        style={dashboardButtonStyle}
                    >
                        Admin Dashboard
                    </button>
                </div>
            </div>

            {/* Log ud-knap */}
            <div style={{ padding: '0 8px' }}>
                <NormalButton text="Log ud" onClick={() => navigate('/login')} />
            </div>
        </aside>
    );
};

const dashboardButtonStyle = {
    border: 'none',
    backgroundColor: '#f3f4f6',
    padding: '10px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontSize: '14px',
    color: '#333',
};

export default SidePanel;