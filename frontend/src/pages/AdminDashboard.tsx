export default function AdminDashboard() {
    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>Her kan studieadministrationen oprette brugere og administrere stamdata.</p>
            </div>

            <div className="dashboard-card-grid">
                <div className="dashboard-card">
                    <h2>Studerende</h2>
                    <p>Opret og administrer student accounts.</p>
                    <button className="primary-button">Administrer studerende</button>
                </div>

                <div className="dashboard-card">
                    <h2>Undervisere</h2>
                    <p>Opret og administrer teacher accounts.</p>
                    <button className="primary-button">Administrer undervisere</button>
                </div>

                <div className="dashboard-card">
                    <h2>Kurser og eksamener</h2>
                    <p>Administrer courses, exams og enrollments.</p>
                    <button className="primary-button">Administrer data</button>
                </div>
            </div>
        </div>
    );
}