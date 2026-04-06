import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const BackArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const INCIDENT_TYPES = [
  { value: 'harassment', label: 'Harassment', color: '#ef4444', emoji: '⚠️' },
  { value: 'poor_lighting', label: 'Poor Lighting', color: '#f59e0b', emoji: '🔦' },
  { value: 'unsafe_road', label: 'Unsafe Road', color: '#f97316', emoji: '🚧' },
  { value: 'suspicious_activity', label: 'Suspicious Activity', color: '#a855f7', emoji: '👁️' },
  { value: 'other', label: 'Other', color: '#6b7280', emoji: '📌' },
];

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 1) return `${h}h ago`;
  if (m >= 1) return `${m}m ago`;
  return 'Just now';
};

const expiresIn = (expiresAt) => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const h = Math.floor(diff / 3600000);
  if (h >= 1) return `Expires in ${h}h`;
  const m = Math.floor(diff / 60000);
  return m > 0 ? `Expires in ${m}m` : 'Expiring soon';
};

export default function Community() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ incidentType: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new-alert', (alert) => setAlerts(prev => [alert, ...prev]));
    socket.on('alert-upvoted', ({ alertId, upvotes }) => {
      setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, upvotes } : a));
    });
    return () => {
      socket.off('new-alert');
      socket.off('alert-upvoted');
    };
  }, [socket]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/alerts');
      setAlerts(res.data);
    } catch { }
    setLoading(false);
  };

  const getLocation = () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        reject, { enableHighAccuracy: true }
      )
    );

  const submitAlert = async () => {
    if (!form.incidentType) { setError('Select an incident type.'); return; }
    setError(''); setSubmitting(true);
    try {
      const { lat, lng } = await getLocation();
      await axios.post('/api/alerts', { ...form, lat, lng });
      setSuccess('Alert posted! Community has been notified.');
      setForm({ incidentType: '', description: '' });
      setShowForm(false);
      fetchAlerts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post alert. Check GPS permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  const upvoteAlert = async (alertId) => {
    try {
      await axios.post(`/api/alerts/${alertId}/upvote`);
      setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, upvotes: a.upvotes + 1 } : a));
    } catch { }
  };

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.incidentType === filter);

  return (
    <div className="min-h-screen bg-dark-900 font-body">
      <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
          <BackArrow />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Safety Board</h1>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto btn-primary py-2 px-4 text-sm"
        >
          + Report
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-5 animate-fade-in">
        {/* Success toast */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">✓ {success}</motion.div>
          )}
        </AnimatePresence>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card py-3 text-center">
            <p className="text-2xl font-display font-bold text-primary-400">{alerts.length}</p>
            <p className="text-xs text-white/40 mt-0.5">Active Alerts</p>
          </div>
          <div className="card py-3 text-center">
            <p className="text-2xl font-display font-bold text-amber-400">
              {alerts.filter(a => a.incidentType === 'harassment').length}
            </p>
            <p className="text-xs text-white/40 mt-0.5">Harassment</p>
          </div>
          <div className="card py-3 text-center">
            <p className="text-2xl font-display font-bold text-white/70">
              {alerts.reduce((s, a) => s + a.upvotes, 0)}
            </p>
            <p className="text-xs text-white/40 mt-0.5">Upvotes</p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-dark-700 text-white/50 hover:text-white'}`}
          >All</button>
          {INCIDENT_TYPES.map(it => (
            <button key={it.value} onClick={() => setFilter(it.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === it.value ? 'text-white' : 'bg-dark-700 text-white/50 hover:text-white'}`}
              style={filter === it.value ? { backgroundColor: it.color + '40', border: `1px solid ${it.color}60` } : {}}
            >
              {it.emoji} {it.label}
            </button>
          ))}
        </div>

        {/* Alert list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="card flex flex-col items-center py-12 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <p className="font-semibold text-white/80">No reports in this area</p>
            <p className="text-sm text-white/40 mt-1">Be the first to report a hazard</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert, i) => {
              const type = INCIDENT_TYPES.find(t => t.value === alert.incidentType) || INCIDENT_TYPES[4];
              return (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card space-y-3"
                  style={{ borderLeft: `3px solid ${type.color}60` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.emoji}</span>
                      <div>
                        <p className="font-semibold text-white text-sm">{type.label}</p>
                        <p className="text-xs text-white/40">{timeAgo(alert.createdAt)}</p>
                      </div>
                    </div>
                    <span className="text-xs text-white/30 shrink-0">{expiresIn(alert.expiresAt)}</span>
                  </div>

                  {alert.description && (
                    <p className="text-sm text-white/60 leading-relaxed">{alert.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {alert.lat?.toFixed(3)}, {alert.lng?.toFixed(3)}
                    </div>
                    <button
                      onClick={() => upvoteAlert(alert._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-white/60 hover:text-white text-xs transition-all"
                    >
                      ▲ <span>{alert.upvotes} confirm</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Report modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-dark-800 rounded-2xl border border-white/10 p-6 space-y-5"
            >
              <h3 className="section-title">Report an Incident</h3>

              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

              <div>
                <label className="label">Incident Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {INCIDENT_TYPES.map(it => (
                    <button
                      key={it.value}
                      onClick={() => setForm(p => ({ ...p, incidentType: it.value }))}
                      className={`p-2.5 rounded-xl border text-left text-sm transition-all ${form.incidentType === it.value ? 'border-white/30 text-white' : 'border-white/10 text-white/60 hover:border-white/20'}`}
                      style={form.incidentType === it.value ? { backgroundColor: it.color + '20', borderColor: it.color + '60' } : {}}
                    >
                      {it.emoji} {it.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Description (optional)</label>
                <textarea
                  className="input-field resize-none h-20 text-sm"
                  placeholder="Brief description of what you observed…"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  maxLength={500}
                />
                <p className="text-xs text-white/30 mt-1">{form.description.length}/500</p>
              </div>

              <p className="text-xs text-white/30">📍 Your current GPS location will be used as the pin location.</p>

              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={submitAlert} disabled={submitting} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Posting…</> : 'Post Alert'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}