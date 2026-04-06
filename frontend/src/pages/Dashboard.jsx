import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Icons as SVG components
const Icon = {
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Map: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  ),
  Car: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3" />
      <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Navigation: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.62 4.35 2 2 0 0 1 3.62 2.18l3-.02a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l1.09-1.09a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
};

// SOS Button Component with countdown
const SOSButton = ({ onTrigger }) => {
  const [state, setState] = useState('idle'); // idle | countdown | active
  const [countdown, setCountdown] = useState(5);
  const [sosId, setSosId] = useState(null);
  const intervalRef = useRef(null);
  const locationIntervalRef = useRef(null);

  const getLocation = () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        reject,
        { enableHighAccuracy: true }
      )
    );

  const handleSOSPress = async () => {
    if (state === 'active') return;
    setState('countdown');
    setCountdown(5);

    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          fireSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fireSOS = async () => {
    try {
      const { lat, lng } = await getLocation();
      const res = await axios.post('/api/sos/trigger', { lat, lng });
      setSosId(res.data.sosId);
      setState('active');
      onTrigger?.('active');

      // Update location every 60s
      locationIntervalRef.current = setInterval(async () => {
        try {
          const loc = await getLocation();
          await axios.post('/api/sos/update-location', { sosId: res.data.sosId, ...loc });
        } catch { }
      }, 60000);
    } catch (err) {
      console.error('SOS failed:', err);
      setState('idle');
    }
  };

  const handleCancel = () => {
    clearInterval(intervalRef.current);
    setState('idle');
    setCountdown(5);
    if (sosId) axios.post('/api/sos/cancel', { sosId }).catch(() => { });
  };

  const handleMarkSafe = async () => {
    clearInterval(locationIntervalRef.current);
    if (sosId) await axios.post('/api/sos/mark-safe', { sosId }).catch(() => { });
    setSosId(null);
    setState('idle');
    onTrigger?.('safe');
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="idle"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={handleSOSPress}
            className="relative w-36 h-36 rounded-full bg-primary-600 sos-glow flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 transition-transform"
          >
            <span className="text-white font-display text-4xl font-bold tracking-wider">SOS</span>
            <span className="text-white/70 text-xs mt-1">Tap to trigger</span>
          </motion.button>
        )}

        {state === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="64" fill="none" stroke="#2e2e55" strokeWidth="8" />
                <circle
                  cx="72" cy="72" r="64"
                  fill="none" stroke="#e8005a" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 64}`}
                  strokeDashoffset={`${2 * Math.PI * 64 * (1 - countdown / 5)}`}
                  className="countdown-ring"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-display text-5xl font-bold">{countdown}</span>
                <span className="text-white/60 text-xs">seconds</span>
              </div>
            </div>
            <button onClick={handleCancel} className="btn-ghost text-sm px-8 py-2">
              Cancel
            </button>
          </motion.div>
        )}

        {state === 'active' && (
          <motion.div
            key="active"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-36 h-36 rounded-full bg-primary-800 border-4 border-primary-500 flex flex-col items-center justify-center animate-pulse-ring">
              <span className="text-primary-400 font-display text-lg font-bold">ACTIVE</span>
              <span className="text-white/60 text-xs mt-1">Contacts alerted</span>
            </div>
            <button onClick={handleMarkSafe} className="btn-primary bg-green-600 hover:bg-green-500 px-8 py-2 text-sm">
              ✓ I'm Safe
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Navigation card
const NavCard = ({ icon, label, desc, to, color }) => {
  const navigate = useNavigate();
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(to)}
      className="card flex items-start gap-4 text-left hover:border-white/20 transition-all duration-200 w-full group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">{label}</p>
        <p className="text-xs text-white/40 mt-0.5">{desc}</p>
      </div>
    </motion.button>
  );
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [discreetMode, setDiscreetMode] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos =>
      setLocation({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) })
    );
  }, []);

  // Triple-tap on status bar to enter discreet mode
  const handleStatusTap = () => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 500);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      navigate('/disguise');
    }
  };

  const navItems = [
    { icon: <Icon.Map />, label: 'Live Trip', desc: 'Share real-time location with contacts', to: '/trip', color: 'bg-blue-500/20 text-blue-400' },
    { icon: <Icon.Car />, label: 'Ride Verification', desc: 'Log vehicle & notify contacts instantly', to: '/ride', color: 'bg-amber-500/20 text-amber-400' },
    { icon: <Icon.Users />, label: 'Buddy Match', desc: 'Find travel companions on your route', to: '/buddy', color: 'bg-purple-500/20 text-purple-400' },
    { icon: <Icon.AlertTriangle />, label: 'Safety Board', desc: 'View & report community incidents', to: '/community', color: 'bg-orange-500/20 text-orange-400' },
    { icon: <Icon.Navigation />, label: 'Safe Routes', desc: 'Get safest path avoiding danger zones', to: '/routes', color: 'bg-green-500/20 text-green-400' },
    { icon: <Icon.Phone />, label: 'Fake Call', desc: 'Schedule a fake incoming call', to: '/?fakecall=1', color: 'bg-teal-500/20 text-teal-400' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 font-body">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Icon.Shield />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">SheSafe</span>
        </div>
        <button onClick={logout} className="text-white/40 hover:text-white/80 transition-colors p-2 rounded-lg hover:bg-white/5">
          <Icon.LogOut />
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-10 pt-6 space-y-8 animate-fade-in">
        {/* Welcome */}
        <div>
          <p className="text-white/40 text-sm">Welcome back,</p>
          <h1 className="font-display text-2xl font-bold text-white mt-0.5">{user?.name} 👋</h1>
        </div>

        {/* Status bar */}
        <div
          onClick={handleStatusTap}
          className="card flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-white/70">GPS Active</span>
          </div>
          {location ? (
            <span className="font-mono text-xs text-white/40">{location.lat}, {location.lng}</span>
          ) : (
            <span className="text-xs text-white/30">Locating…</span>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary-500" />
            <span className="text-xs text-white/50">{user?.emergencyContacts?.length || 0} contacts</span>
          </div>
        </div>

        {/* SOS Section */}
        <section className="card flex flex-col items-center py-8 gap-2">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Emergency SOS</p>
          <SOSButton />
          <p className="text-white/30 text-xs mt-4 text-center max-w-xs">
            Tap to send your location to all emergency contacts. 5-second cancel window.
            <br />
            <span className="text-primary-500/60">Triple-tap status bar for discreet mode.</span>
          </p>
        </section>

        {/* Features grid */}
        <section className="space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-widest">Safety Suite</p>
          <div className="grid grid-cols-1 gap-3">
            {navItems.map(item => (
              <NavCard key={item.to} {...item} />
            ))}
          </div>
        </section>

        {/* Emergency contacts quick view */}
        {user?.emergencyContacts?.length > 0 && (
          <section className="card space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/40">Emergency Contacts</p>
            {user.emergencyContacts.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 text-sm font-bold">
                  {c.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{c.name}</p>
                  <p className="text-xs text-white/40">{c.phone} · {c.relation}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}