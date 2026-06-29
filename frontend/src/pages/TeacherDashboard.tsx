export default function TeacherDashboard() {
    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Teacher Dashboard</h1>
                <p>Her kan underviseren oprette, rette og offentliggøre karakterer.</p>
            </div>

            <div className="dashboard-card-grid">
                <div className="dashboard-card">
                    <h2>Mine eksamener</h2>
                    <p>Se eksamener hvor du er ansvarlig underviser.</p>
                    <button className="primary-button">Se eksamener</button>
                </div>

                <div className="dashboard-card">
                    <h2>Karaktergivning</h2>
                    <p>Opret eller ret karakterer for studerende.</p>
                    <button className="primary-button">Åbn karaktermodul</button>
                </div>

                <div className="dashboard-card">
                    <h2>Offentliggør resultater</h2>
                    <p>Gør karakterer synlige for studerende.</p>
                    <button className="primary-button">Offentliggør</button>
                </div>
            </div>
        </div>
    );
}