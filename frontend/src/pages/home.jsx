import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, authFetch } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";
import Toast from "../components/Toast";

const COUNTDOWN = 5;

export default function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // SOS state machine: idle | countdown | active | safe
    const [sosState, setSosState] = useState("idle");
    const [count, setCount] = useState(COUNTDOWN);
    const [discreet, setDiscreet] = useState(false);
    const [equalsCount, setEqualsCount] = useState(0);
    const [toast, setToast] = useState(null);
    const [gps, setGps] = useState(null);
    const [calcDisplay, setCalcDisplay] = useState("0");
    const [calcExpr, setCalcExpr] = useState("");
    const intervalRef = useRef(null);
    const locIntervalRef = useRef(null);
    const sosLogId = useRef(null);

    // Watch GPS always
    useEffect(() => {
        if (!navigator.geolocation) return;
        const watcher = navigator.geolocation.watchPosition(
            (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => { },
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    const showToast = (msg, type = "default") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- SOS LOGIC ---
    const triggerSos = useCallback(() => {
        if (sosState !== "idle") return;
        setSosState("countdown");
        setCount(COUNTDOWN);
    }, [sosState]);

    // Countdown ticker
    useEffect(() => {
        if (sosState !== "countdown") return;
        if (count <= 0) {
            fireSos();
            return;
        }
        intervalRef.current = setTimeout(() => setCount((c) => c - 1), 1000);
        return () => clearTimeout(intervalRef.current);
    }, [sosState, count]);

    async function fireSos() {
        setSosState("active");
        if (!gps) { showToast("GPS not available", "error"); return; }
        try {
            const res = await authFetch("/sos/trigger", {
                method: "POST",
                body: JSON.stringify({ lat: gps.lat, lng: gps.lng }),
            });
            const data = await res.json();
            sosLogId.current = data.sosId;
            showToast("SOS sent! Contacts alerted.", "error");
            // Send location every 60s
            locIntervalRef.current = setInterval(sendLocUpdate, 60000);
        } catch {
            showToast("Failed to send SOS", "error");
        }
    }

    async function sendLocUpdate() {
        if (!gps || !sosLogId.current) return;
        await authFetch("/sos/update-location", {
            method: "POST",
            body: JSON.stringify({ sosId: sosLogId.current, lat: gps.lat, lng: gps.lng }),
        });
    }

    async function markSafe() {
        clearInterval(locIntervalRef.current);
        if (sosLogId.current) {
            await authFetch("/sos/mark-safe", {
                method: "POST",
                body: JSON.stringify({ sosId: sosLogId.current }),
            });
        }
        sosLogId.current = null;
        setSosState("idle");
        showToast("Marked safe. Stay strong 💜", "success");
    }

    function cancelCountdown() {
        clearTimeout(intervalRef.current);
        authFetch("/sos/log-cancel", { method: "POST", body: JSON.stringify({ lat: gps?.lat, lng: gps?.lng }) });
        setSosState("idle");
        setCount(COUNTDOWN);
        showToast("SOS cancelled");
    }

    // --- CALCULATOR DISCREET MODE ---
    function calcPress(key) {
        if (key === "=") {
            const newCount = equalsCount + 1;
            setEqualsCount(newCount);
            if (newCount >= 5) { setDiscreet(false); setEqualsCount(0); return; }
            try { setCalcDisplay(String(eval(calcExpr || calcDisplay))); setCalcExpr(""); }
            catch { setCalcDisplay("Error"); }
            return;
        }
        if (key === "AC") { setCalcDisplay("0"); setCalcExpr(""); setEqualsCount(0); return; }
        if (key === "+/-") { setCalcDisplay((d) => d.startsWith("-") ? d.slice(1) : "-" + d); return; }
        if (key === "%") { setCalcDisplay(String(parseFloat(calcDisplay) / 100)); return; }
        if ("+-×÷".includes(key)) {
            const op = key === "×" ? "*" : key === "÷" ? "/" : key;
            setCalcExpr((calcExpr || calcDisplay) + op); setCalcDisplay("0"); setEqualsCount(0); return;
        }
        if (key === ".") {
            if (calcDisplay.includes(".")) return;
            setCalcDisplay((d) => d + "."); return;
        }
        const digit = key;
        setCalcDisplay((d) => d === "0" ? digit : d + digit);
        setEqualsCount(0);
    }

    if (discreet) return <Calculator onPress={calcPress} display={calcDisplay} expr={calcExpr} />;

    return (
        <div className="app-shell">
            <div className="topbar">
                <div className="topbar-logo">
                    <div className="logo-shield">🛡</div>
                    SheSafe
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="topbar-action" title="Discreet mode" onClick={() => setDiscreet(true)}>🧮</button>
                    <button className="topbar-action" onClick={logout}>→</button>
                </div>
            </div>

            <div className="page">
                {/* Greeting */}
                <div style={{ marginBottom: 28 }}>
                    <p className="text-sm text-3">Welcome back,</p>
                    <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, color: "var(--text-1)" }}>
                        {user?.name} 👋
                    </h1>
                </div>

                {/* Status pills */}
                <div className="flex gap-2 mb-6" style={{ flexWrap: "wrap" }}>
                    <span className={`status-pill ${gps ? "active" : "inactive"}`}>
                        <span className="dot" />
                        GPS {gps ? "Active" : "Searching…"}
                    </span>
                    <span className="status-pill inactive">
                        <span className="dot" style={{ background: "var(--amber)" }} />
                        Battery OK
                    </span>
                    {sosState === "active" && (
                        <span className="status-pill danger">
                            <span className="dot" />
                            SOS Active
                        </span>
                    )}
                </div>

                {/* SOS ZONE */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
                    {sosState === "idle" && (
                        <div className="sos-ring-outer" onClick={triggerSos}>
                            <div className="sos-ring-mid">
                                <button className="sos-btn">
                                    <span className="sos-btn-label">SOS</span>
                                    <span className="sos-btn-sub">tap to alert</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {sosState === "countdown" && (
                        <div className="sos-active" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                            <div className="sos-ring-outer">
                                <div className="sos-ring-mid">
                                    <div className="sos-btn" style={{ background: "var(--amber)", boxShadow: "0 0 40px rgba(245,158,11,0.4)" }}>
                                        <span className="countdown-num">{count}</span>
                                        <span className="sos-btn-sub">sending in…</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-secondary" onClick={cancelCountdown}>Cancel SOS</button>
                        </div>
                    )}

                    {sosState === "active" && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                            <div className="sos-ring-outer" style={{ borderColor: "rgba(232,54,93,0.4)", animation: "pulse-ring 1s ease-in-out infinite" }}>
                                <div className="sos-ring-mid">
                                    <div className="sos-btn">
                                        <span style={{ fontSize: 28 }}>📡</span>
                                        <span className="sos-btn-sub">transmitting</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-3" style={{ textAlign: "center" }}>
                                Location sent every 60s. Contacts are notified.
                            </p>
                            <button className="btn btn-mint btn-full" onClick={markSafe}>✓ Mark Me Safe</button>
                        </div>
                    )}
                </div>

                {/* Feature Grid */}
                <p className="section-label mb-3">Safety Suite</p>
                <div className="feature-grid">
                    <Link to="/trip" className="feature-card">
                        <div className="feature-icon mint">🗺️</div>
                        <div>
                            <p className="feature-name">Live Trip</p>
                            <p className="feature-desc">Share your journey in real time</p>
                        </div>
                    </Link>
                    <Link to="/buddy" className="feature-card">
                        <div className="feature-icon rose">👯</div>
                        <div>
                            <p className="feature-name">Buddy Match</p>
                            <p className="feature-desc">Travel with someone nearby</p>
                        </div>
                    </Link>
                    <Link to="/alerts" className="feature-card">
                        <div className="feature-icon amber">⚠️</div>
                        <div>
                            <p className="feature-name">Safety Board</p>
                            <p className="feature-desc">Crowdsourced danger zones</p>
                        </div>
                    </Link>
                    <Link to="/ride" className="feature-card">
                        <div className="feature-icon blue">🚗</div>
                        <div>
                            <p className="feature-name">Ride Verify</p>
                            <p className="feature-desc">Log vehicle before boarding</p>
                        </div>
                    </Link>
                    <Link to="/route" className="feature-card" style={{ gridColumn: "span 2" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div className="feature-icon mint">🧭</div>
                            <div>
                                <p className="feature-name">Safe Route Suggester</p>
                                <p className="feature-desc">Fastest vs safest path with AI scoring</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <BottomNav active="home" />
            {toast && <Toast message={toast.msg} type={toast.type} />}
        </div>
    );
}

function Calculator({ onPress, display, expr }) {
    const keys = [
        ["AC", "+/-", "%", "÷"],
        ["7", "8", "9", "×"],
        ["4", "5", "6", "-"],
        ["1", "2", "3", "+"],
        ["0", ".", "="],
    ];
    return (
        <div className="calc-screen">
            <div className="calc-display">
                <div className="calc-sub">{expr || ""}</div>
                <div className="calc-result">{display}</div>
            </div>
            <div className="calc-grid">
                {keys.flat().map((k, i) => (
                    <div
                        key={i}
                        className={`calc-key${k === "=" ? " equal" : "+-×÷%".includes(k) ? " op" : "AC+/-".includes(k) ? " fn" : ""}${k === "0" ? " zero" : ""}`}
                        onClick={() => onPress(k)}
                    >
                        {k}
                    </div>
                ))}
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: "#555", padding: "8px 0", background: "#1a1a1a" }}>
                Tap = five times to return
            </p>
        </div>
    );
}