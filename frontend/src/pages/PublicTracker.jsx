import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import MapContainer from '../components/MapContainer';
import { useSocket } from '../context/SocketContext';

const StatusBadge = ({ status }) => {
  const map = {
    active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: '● Live Tracking' },
    completed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: '✓ Arrived Safely' },
    overdue: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: '⚠ Overdue' },
  };
  const s = map[status] || map.active;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${s.color}`}>
      {s.label}
    </span>
  );
};

export default function PublicTracker() {
  const { trackingId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { socket, connected } = useSocket();
  const fetchRef = useRef(false);

  useEffect(() => {
    if (!fetchRef.current) {
        fetchTrip();
        fetchRef.current = true;
    }
  }, [trackingId]);

  useEffect(() => {
    if (socket && trip?.trackingId) {
        socket.emit('join-trip', trip.trackingId);

        socket.on('location-update', (data) => {
            setTrip(prev => ({
                ...prev,
                currentLat: data.lat,
                currentLng: data.lng,
                routeHistory: [...(prev.routeHistory || []), { lat: data.lat, lng: data.lng }]
            }));
        });

        socket.on('trip-completed', () => {
            setTrip(prev => ({ ...prev, status: 'completed' }));
        });

        return () => {
            socket.off('location-update');
            socket.off('trip-completed');
        };
    }
  }, [socket, trip?.trackingId]);

  const fetchTrip = async () => {
    try {
      const res = await axios.get(`/api/tracking/${trackingId}`);
      setTrip(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Trip not found or link expired.');
      } else {
        setError('Unable to load tracking data.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-900/10 via-dark-900 to-dark-900">
        <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm animate-pulse">Connecting to live stream…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center text-4xl mb-6 shadow-2xl shadow-primary-500/10">🚫</div>
        <h1 className="text-2xl font-bold text-white mb-2">Tracking Interrupted</h1>
        <p className="text-white/40 max-w-xs">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10"
        >
          Try Refreshing
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white font-body selection:bg-primary-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">SheSafe Live Tracking</h1>
          <p className="text-sm text-white/40 mt-1">Peace of mind, in real-time.</p>
        </div>
      </header>

      <main className="relative z-10 max-w-md mx-auto px-5 pb-12 space-y-6">
        {/* User Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800/50 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-xl font-bold">
              {trip?.userName?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">{trip?.userName}'s journey</h2>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={trip?.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold mb-1">Destination</p>
              <p className="text-sm font-medium text-white/90 truncate">{trip?.destination || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold mb-1">Updated</p>
              <p className="text-sm font-medium text-white/90">Just now</p>
            </div>
          </div>

          {trip?.status === 'overdue' && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <span className="text-lg">⚠</span>
              <p className="leading-relaxed">This trip is overdue. If you cannot reach {trip?.userName}, consider contacting local authorities or their emergency circle.</p>
            </div>
          )}
        </motion.div>

        {/* Map Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="h-80 w-full rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl relative"
        >
          <MapContainer 
            center={trip?.currentLat ? [trip.currentLng, trip.currentLat] : [77.209, 28.613]} 
            route={trip?.routeHistory?.map(p => [p.lng, p.lat]) || []}
            markers={trip?.currentLat ? [{
              latitude: trip.currentLat,
              longitude: trip.currentLng,
              type: trip.status === 'overdue' ? 'alert' : 'primary',
              title: trip.userName,
              description: `Last seen at ${new Date().toLocaleTimeString()}`
            }] : []}
            interactive={true}
          />
          
          {/* Map Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 bg-dark-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <p className="text-[10px] text-white/70 font-medium">GPS Signal Active</p>
            </div>
            <p className="text-[10px] text-white/40">Secure End-to-End Tracking</p>
          </div>
        </motion.div>

        <footer className="text-center space-y-4">
          <p className="text-xs text-white/20">
            Powered by SheSafe. Location accuracy depends on the sender's device.
          </p>
        </footer>
      </main>
    </div>
  );
}
