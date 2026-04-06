import { useState, useEffect, useRef } from "react";
import { authFetch } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";
import Toast from "../components/Toast";

const INCIDENT_TYPES = [
  { value: "harassment", label: "Harassment", emoji: "🚨", cls: "pin-harassment" },
  { value: "lighting", label: "Poor Lighting", emoji: "💡", cls: "pin-lighting" },
  { value: "suspicious", label: "Suspicious Activity", emoji: "👁️", cls: "pin-suspicious" },
  { value: "road", label: "Unsafe Road", emoji: "⚠️", cls: "pin-road" },
  { value: "other", label: "Other", emoji: "📍", cls: "pin-other" },
];

export default function AlertBoard() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "harassment", description: "" });
  const [clickedLoc, setClickedLoc] = useState(null);
  const [toast, setToast] = useState(null);
  const [userLoc, setUserLoc] = useState(null);

  const showToast = (msg, type = "default") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((p) => {
      setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
    });
    loadAlerts();
  }, []);

  async function loadAlerts() {
    const res = await authFetch("/alerts");
    const data = await res.json();
    setAlerts(data.alerts || []);
  }

  // Initialize Mapbox
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || !mapContainer.current || mapRef.current) return;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      import("mapbox-gl/dist/mapbox-gl.css");
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: userLoc ? [userLoc.lng, userLoc.lat] : [80.2707, 13.0827],
        zoom: 13,
      });
      mapRef.current = map;

      map.on("click", (e) => {
        setClickedLoc({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        setShowForm(true);
      });

      // Add alert pins
      alerts.forEach((a) => addPin(map, a, mapboxgl));
    });
  }, [userLoc]);

  function addPin(map, alert, mapboxgl) {
    const colors = { harassment: "#E8365D", lighting: "#F59E0B", suspicious: "#8B5CF6", road: "#3B82F6", other: "#6B7280" };
    const el = document.createElement("div");
    el.style.cssText = `width:28px;height:28px;border-radius:50%;background:${colors[alert.type] || "#6B7280"};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;`;
    el.textContent = INCIDENT_TYPES.find((t) => t.value === alert.type)?.emoji || "📍";
    new mapboxgl.Marker({ element: el }).setLngLat([alert.lng, alert.lat]).setPopup(
      new mapboxgl.Popup({ offset: 14 }).setHTML(
        `<div style="font-family:sans-serif;padding:4px"><strong style="color:#E8365D">${alert.type}</strong><br/><span style="font-size:12px">${alert.description}</span><br/><small style="color:#999">${new Date(alert.createdAt).toLocaleString()}</small></div>`
      )
    ).addTo(map);
  }

  async function submitAlert() {
    if (!clickedLoc) { showToast("Drop a pin on the map first", "error"); return; }
    if (!form.description) { showToast("Add a description", "error"); return; }
    const res = await authFetch("/alerts", {
      method: "POST",
      body: JSON.stringify({ ...form, lat: clickedLoc.lat, lng: clickedLoc.lng }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.message || "Failed", "error"); return; }
    showToast("Alert reported!", "success");
    setShowForm(false);
    setClickedLoc(null);
    loadAlerts();
  }

  async function upvote(alertId) {
    await authFetch(`/alerts/${alertId}/upvote`, { method: "POST" });
    showToast("Upvoted — expiry reset");
    loadAlerts();
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="topbar-logo"><div className="logo-shield">🛡</div>Safety Board</div>
        <button className="btn btn-sm btn-primary" onClick={() => setShowForm(true)}>+ Report</button>
      </div>

      <div className="page">
        <p className="page-sub" style={{ marginTop: 0 }}>Tap the map to report. Pins expire in 48h.</p>

        {/* Map */}
        <div className="map-box mb-4" ref={mapContainer} style={{ height: 280 }}>
          {!import.meta.env.VITE_MAPBOX_TOKEN && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 32 }}>🗺️</p>
              <p className="text-sm text-3">Add VITE_MAPBOX_TOKEN to enable map</p>
            </div>
          )}
        </div>

        {/* Report form modal */}
        {showForm && (
          <div className="card mb-4" style={{ border: "0.5px solid var(--rose-glow)" }}>
            <div className="flex justify-between items-center mb-3">
              <p style={{ fontWeight: 600 }}>Report Incident</p>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowForm(false)}>✕</button>
            </div>
            {clickedLoc && (
              <p className="text-xs text-3 mb-3">
                📍 {clickedLoc.lat.toFixed(4)}, {clickedLoc.lng.toFixed(4)}
              </p>
            )}
            <div className="input-group mb-3">
              <label className="input-label">Incident Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {INCIDENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                ))}
              </select>
            </div>
            <div className="input-group mb-3">
              <label className="input-label">Description</label>
              <textarea className="input" rows={3} placeholder="What happened? Be brief."
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ resize: "none" }} />
            </div>
            {!clickedLoc && <p className="text-xs text-amber mb-3">👆 Tap the map to drop a pin</p>}
            <button className="btn btn-primary btn-full" onClick={submitAlert} disabled={!clickedLoc}>
              Submit Report
            </button>
          </div>
        )}

        {/* Alert List */}
        <p className="section-label mb-3">Active Reports ({alerts.length})</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alerts.length === 0 && <p className="text-sm text-3">No active reports nearby. Stay safe!</p>}
          {alerts.map((a) => {
            const type = INCIDENT_TYPES.find((t) => t.value === a.type);
            const hoursLeft = Math.max(0, 48 - (Date.now() - new Date(a.createdAt)) / 3600000);
            return (
              <div key={a._id} className="card" style={{ padding: "12px 16px" }}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`pin-badge ${type?.cls}`}>{type?.emoji} {type?.label}</span>
                  <span className="text-xs text-3">{hoursLeft.toFixed(0)}h left</span>
                </div>
                <p className="text-sm text-2 mb-2">{a.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-3">👍 {a.upvotes || 0} confirmations</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => upvote(a._id)}>
                    Confirm Active
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="alerts" />
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}