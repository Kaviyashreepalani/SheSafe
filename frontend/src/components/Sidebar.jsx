export default function Sidebar() {
    return (
        <div style={{
            width: "200px",
            height: "100vh",
            background: "#111",
            color: "white",
            padding: "20px"
        }}>
            <h2>SheSafe</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                <li>🏠 Home</li>
                <li>📞 Contacts</li>
                <li>📍 Live Trip</li>
            </ul>
        </div>
    );
}