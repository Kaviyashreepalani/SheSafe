import "../styles/home.css";

export default function Home() {

    const handleSOS = () => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;

            await fetch("http://localhost:5000/sos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ latitude, longitude })
            });

            alert("🚨 SOS Sent!");
        });
    };

    return (
        <div className="home-container">
            <h1>Emergency SOS</h1>

            <button className="sos-button" onClick={handleSOS}>
                SOS
            </button>

            <p>
                Tap in emergency. Location will be sent instantly.
            </p>
        </div>
    );
}