import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BackArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const StatusBadge = ({ status }) => {
  const map = {
    active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: '● Active' },
    completed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: '✓ Safe' },
    overdue: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: '⚠ Overdue' },
  };
  const s = map[status] || map.active;
  return (
    <span className={`badge border text-xs ${s.color}`}>{s.label}</span>
  );
};

export default function LiveTrip() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('form'); // form | active
  const [form, setForm] = useState({ destination: '', origin: '', expectedArrival: '' });
  const [trip, setTrip] = useState(null);
  const [trackingLink, setTrackingLink] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const locationIntervalRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    return () => clearInterval(locationIntervalRef.current);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/trips/history');
      setHistory(res.data.slice(0, 5));
    } catch { }
  };

  const getLocation = () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        reject, { enableHighAccuracy: true }
      )
    );

  const startTrip = async () => {
    if (!form.destination || !form.expectedArrival) { setError('Destination and arrival time required.'); return; }
    setError('');
    setLoading(true);
    try {
      const { lat, lng } = await getLocation();
      const res = await axios.post('/api/trips/start', { ...form, lat, lng });
      setTrip(res.data.trip);
      setTrackingLink(res.data.trackingLink);
      setPhase('active');

      // Stream location every 30s
      locationIntervalRef.current = setInterval(async () => {
        try {
          const loc = await getLocation();
          await axios.patch(`/api/trips/${res.data.trip._id}/location`, loc);
        } catch { }
      }, 30000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start trip. Check GPS permissions.');
    } finally {
      setLoading(false);
    }
  };

  const markSafe = async () => {
    if (!trip) return;
    clearInterval(locationIntervalRef.current);
    try {
      await axios.patch(`/api/trips/${trip._id}/safe`);
      setPhase('form');
      setTrip(null);
      fetchHistory();
    } catch { }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const minArrival = new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-dark-900 font-body">
      <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
          <BackArrow />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Live Trip</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-6 animate-fade-in">
        <AnimatePresence mode="wait">
          {phase === 'form' ? (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {/* Start trip form */}
              <div className="card space-y-4">
                <h2 className="section-title">Start a Trip</h2>
                <p className="text-sm text-white/40">Your live location will be shared with emergency contacts.</p>

                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

                <div>
                  <label className="label">Origin (optional)</label>
                  <input className="input-field" placeholder="e.g. Home, Office" value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Destination *</label>
                  <input className="input-field" placeholder="e.g. T. Nagar, Chennai" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Expected Arrival *</label>
                  <input type="datetime-local" className="input-field" min={minArrival} value={form.expectedArrival} onChange={e => setForm(p => ({ ...p, expectedArrival: e.target.value }))} />
                </div>

                <button onClick={startTrip} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Starting…</> : '▶ Start Trip & Alert Contacts'}
                </button>
              </div>

              {/* Trip history */}
              {history.length > 0 && (
                <div className="card space-y-3">
                  <h3 className="section-title text-sm">Recent Trips</h3>
                  {history.map(t => (
                    <div key={t._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white/90">{t.destination}</p>
                        <p className="text-xs text-white/40">{new Date(t.startTime).toLocaleString()}</p>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
              {/* Active trip card */}
              <div className="card border-green-500/20 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="section-title">Trip in Progress</h2>
                  <StatusBadge status="active" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <p className="text-sm text-white/70">To: <span className="text-white font-medium">{trip?.destination}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <p className="text-sm text-white/50">ETA: {trip?.expectedArrival ? new Date(trip.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                  </div>
                </div>

                {/* Tracking link */}
                <div className="bg-dark-700 rounded-xl p-4 space-y-2">
                  <p className="text-xs text-white/40 uppercase tracking-widest">Tracking Link</p>
                  <p className="text-xs font-mono text-primary-400 break-all">{trackingLink}</p>
                  <button onClick={copyLink} className={`text-xs px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60 hover:text-white'}`}>
                    {copied ? '✓ Copied!' : '⎘ Copy link'}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={markSafe}
                    className="btn-primary bg-green-600 hover:bg-green-500 flex-1 text-sm py-3"
                  >
                    ✓ I've Arrived Safely
                  </button>
                </div>

                <p className="text-xs text-white/30 text-center">
                  Location updates every 30s. Contacts will be alerted if you don't mark safe 10 min after ETA.
                </p>
              </div>

              {/* Live map placeholder — replace with MapContainer when Mapbox token is set */}
              <div className="card h-48 flex items-center justify-center border-dashed">
                <div className="text-center">
                  <div className="text-3xl mb-2">📍</div>
                  <p className="text-sm text-white/40">Live map — add <code className="text-primary-400 text-xs">VITE_MAPBOX_TOKEN</code> to .env</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}