import { Search, HelpCircle } from 'lucide-react';
import DocumentsPage from "./DocumentsPage";

export default function StudentDashboard() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>

            {/* ── Single top header ── */}
            <header style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 40px',
                borderBottom: '1px solid #e8e8e8',
                backgroundColor: '#fff',
            }}>
                <div>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700, color: '#111' }}>
                        Student Dashboard
                    </h1>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                        Her kan studenten se karakterer, udskrifter og dokumenter.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Search size={18} color="#555" style={{ cursor: 'pointer' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <HelpCircle size={18} color="#555" />
                        <span style={{ fontSize: '13px', color: '#555' }}>Hjælp</span>
                    </div>

                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#2c2c2c', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>VM</span>
                    </div>
                </div>
            </header>

            {/* ── Udskrifter content (no duplicate header) ── */}
            <DocumentsPage showPageHeader={false} />
        </div>
    );
}