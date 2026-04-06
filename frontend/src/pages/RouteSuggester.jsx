import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BackArrow = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

// Safety score computation (mirrors backend README formula)
const computeSafetyScore = (alerts, routePoints, radiusMeters = 200) => {
    if (!alerts?.length) return 100;

    const toRad = d => (d * Math.PI) / 180;
    const haversine = (lat1, lng1, lat2, lng2) => {
        const R = 6371000; // meters
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const PENALTIES = {
        harassment: 15,
        suspicious_activity: 15,
        unsafe_road: 10,
        poor_lighting: 8,
        other: 5,
    };

    let penalty = 0;
    for (const alert of alerts) {
        for (const pt of routePoints) {
            const dist = haversine(alert.lat, alert.lng, pt.lat, pt.lng);
            if (dist <= radiusMeters) {
                const base = PENALTIES[alert.incidentType] || 5;
                const multiplier = alert.upvotes > 0 ? 1.2 : 1;
                penalty += base * multiplier;
                break; // count each alert once per route
            }
        }
    }
    return Math.max(0, Math.min(100, Math.round(100 - penalty)));
};

const ScoreBadge = ({ score }) => {
    const color = score >= 80 ? 'text-green-400 bg-green-500/15 border-green-500/30'
        : score >= 60 ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
            : 'text-red-400 bg-red-500/15 border-red-500/30';
    const label = score >= 80 ? 'Safe' : score >= 60 ? 'Moderate' : 'Risky';
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color}`}>
            <span className="text-lg font-display font-bold">{score}</span>
            <div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs opacity-60">Safety Score</p>
            </div>
        </div>
    );
};

const ScoreBar = ({ score }) => {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${color}`}
            />
        </div>
    );
};

// Simulated route points (in production use Mapbox Directions API)
const mockRoutePoints = (lat, lng, count = 10) =>
    Array.from({ length: count }, (_, i) => ({
        lat: lat + (i * 0.002) + (Math.random() * 0.001),
        lng: lng + (i * 0.002) + (Math.random() * 0.001),
    }));

const mockSafeRoutePoints = (lat, lng, count = 12) =>
    Array.from({ length: count }, (_, i) => ({
        lat: lat + (i * 0.0018) + (Math.random() * 0.0005),
        lng: lng - (i * 0.001) + (Math.random() * 0.001),
    }));

export default function RouteSuggester() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ origin: '', destination: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [routes, setRoutes] = useState(null);
    const [selected, setSelected] = useState(null);
    const [alerts, setAlerts] = useState([]);

    // Fetch active alerts for scoring
    useEffect(() => {
        axios.get('/api/alerts').then(r => setAlerts(r.data)).catch(() => { });
    }, []);

    const analyzeRoutes = async () => {
        if (!form.origin || !form.destination) { setError('Enter both origin and destination.'); return; }
        setError(''); setLoading(true);

        try {
            const pos = await new Promise((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(
                    p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
                    reject
                )
            );

            // In production: call Mapbox Directions API for real route geometries
            // Here we generate mock route data to demonstrate the scoring logic
            const fastPoints = mockRoutePoints(pos.lat, pos.lng);
            const safePoints = mockSafeRoutePoints(pos.lat, pos.lng);

            const fastScore = computeSafetyScore(alerts, fastPoints);
            const safeScore = computeSafetyScore(alerts, safePoints);

            setRoutes({
                fastest: {
                    label: 'Fastest Route',
                    distKm: (Math.random() * 5 + 3).toFixed(1),
                    durationMin: Math.floor(Math.random() * 15 + 10),
                    score: fastScore,
                    points: fastPoints,
                    alertsNearby: alerts.filter(a => fastPoints.some(p => {
                        const d = Math.sqrt((a.lat - p.lat) ** 2 + (a.lng - p.lng) ** 2);
                        return d < 0.003;
                    })).length,
                },
                safest: {
                    label: 'Safest Route',
                    distKm: (Math.random() * 3 + 5).toFixed(1),
                    durationMin: Math.floor(Math.random() * 10 + 18),
                    score: safeScore,
                    points: safePoints,
                    alertsNearby: alerts.filter(a => safePoints.some(p => {
                        const d = Math.sqrt((a.lat - p.lat) ** 2 + (a.lng - p.lng) ** 2);
                        return d < 0.003;
                    })).length,
                },
            });
            setSelected('safest');
        } catch (err) {
            setError('Could not analyze routes. Enable GPS and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 font-body">
            <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] px-5 py-4 flex items-center gap-3">
                <button onClick={() => navigate('/')} className="text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
                    <BackArrow />
                </button>
                <h1 className="font-display text-xl font-bold text-white">Safe Routes</h1>
            </header>

            <main className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-6 animate-fade-in">
                {/* Search form */}
                <div className="card space-y-4">
                    <div>
                        <h2 className="section-title">Analyze Route Safety</h2>
                        <p className="text-sm text-white/40 mt-1">Routes are scored using active community alerts within 200m.</p>
                    </div>

                    {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

                    <div>
                        <label className="label">From</label>
                        <input className="input-field" placeholder="e.g. Adyar" value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label">To</label>
                        <input className="input-field" placeholder="e.g. T. Nagar" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
                    </div>

                    <button onClick={analyzeRoutes} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Analyzing…</> : '🗺️ Find Safe Route'}
                    </button>
                </div>

                {/* Active alerts indicator */}
                {alerts.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-amber-400">⚠️</span>
                        <p className="text-sm text-amber-300/80">
                            <span className="font-semibold">{alerts.length} active alerts</span> factored into safety scores
                        </p>
                    </div>
                )}

                {/* Route results */}
                <AnimatePresence>
                    {routes && (
                        <motion.div key="routes" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <p className="text-xs uppercase tracking-widest text-white/40">Route Options</p>

                            {['safest', 'fastest'].map((key) => {
                                const r = routes[key];
                                const isSelected = selected === key;
                                return (
                                    <motion.button
                                        key={key}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelected(key)}
                                        className={`card w-full text-left space-y-4 transition-all duration-200 ${isSelected ? 'border-primary-500/50 bg-dark-700' : 'hover:border-white/15'}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span>{key === 'safest' ? '🛡️' : '⚡'}</span>
                                                    <p className="font-semibold text-white">{r.label}</p>
                                                    {key === 'safest' && <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 text-xs">Recommended</span>}
                                                </div>
                                                <p className="text-sm text-white/50 mt-1">
                                                    {r.distKm} km · ~{r.durationMin} min
                                                    {r.alertsNearby > 0 && <span className="text-amber-400 ml-2">· {r.alertsNearby} alert{r.alertsNearby > 1 ? 's' : ''} nearby</span>}
                                                </p>
                                            </div>
                                            <ScoreBadge score={r.score} />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-white/40">
                                                <span>Safety Score</span>
                                                <span>{r.score}/100</span>
                                            </div>
                                            <ScoreBar score={r.score} />
                                        </div>
                                    </motion.button>
                                );
                            })}

                            {/* Safety score explanation */}
                            <div className="card bg-dark-800 border-white/5 space-y-3">
                                <p className="text-xs uppercase tracking-widest text-white/40">How Safety Score Works</p>
                                <div className="space-y-2 text-xs text-white/50">
                                    <p>Base score: <span className="text-white/80">100</span></p>
                                    <p>Harassment/Suspicious: <span className="text-red-400">−15 per alert within 200m</span></p>
                                    <p>Unsafe road: <span className="text-amber-400">−10 per alert within 200m</span></p>
                                    <p>Poor lighting: <span className="text-amber-400">−8 per alert within 200m</span></p>
                                    <p>Community upvoted alerts: <span className="text-orange-400">×1.2 penalty multiplier</span></p>
                                    <p>Other: <span className="text-white/40">−5 per alert</span></p>
                                </div>
                            </div>

                            {selected && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="btn-primary w-full py-3"
                                    onClick={() => navigate('/trip')}
                                >
                                    Start Trip on {selected === 'safest' ? 'Safest' : 'Fastest'} Route →
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}