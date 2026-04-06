import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BackArrow = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const vehicleTypes = [
    { value: 'cab', label: '🚕 Cab', desc: 'Ola, Uber, taxi' },
    { value: 'auto', label: '🛺 Auto', desc: 'Auto-rickshaw' },
    { value: 'bus', label: '🚌 Bus', desc: 'Public / private' },
    { value: 'other', label: '🚗 Other', desc: 'Any vehicle' },
];

export default function RideVerification() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ vehicleNumber: '', vehicleType: '', driverName: '' });
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { fetchRides(); }, []);

    const fetchRides = async () => {
        try {
            const res = await axios.get('/api/rides');
            setRides(res.data);
        } catch { }
    };

    const getLocation = () =>
        new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(
                p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
                reject, { enableHighAccuracy: true }
            )
        );

    const handleSubmit = async () => {
        if (!form.vehicleNumber || !form.vehicleType) { setError('Vehicle number and type are required.'); return; }
        setError(''); setLoading(true);
        try {
            const { lat, lng } = await getLocation();
            await axios.post('/api/rides', { ...form, lat, lng });
            setSuccess('Ride logged! Emergency contacts have been notified via SMS.');
            setForm({ vehicleNumber: '', vehicleType: '', driverName: '' });
            fetchRides();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log ride. Check GPS permissions.');
        } finally {
            setLoading(false);
        }
    };

    const reshareRide = async (rideId) => {
        try {
            await axios.post(`/api/rides/${rideId}/reshare`);
            setSuccess('Ride details reshared with contacts!');
            setTimeout(() => setSuccess(''), 3000);
        } catch { }
    };

    return (
        <div className="min-h-screen bg-dark-900 font-body">
            <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] px-5 py-4 flex items-center gap-3">
                <button onClick={() => navigate('/')} className="text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
                    <BackArrow />
                </button>
                <h1 className="font-display text-xl font-bold text-white">Ride Verification</h1>
            </header>

            <main className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-6 animate-fade-in">
                {/* Log new ride */}
                <div className="card space-y-5">
                    <div>
                        <h2 className="section-title">Log This Ride</h2>
                        <p className="text-sm text-white/40 mt-1">Vehicle details will be sent to all emergency contacts instantly.</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">✓ {success}</motion.div>
                        )}
                    </AnimatePresence>

                    {/* Vehicle type selector */}
                    <div>
                        <label className="label">Vehicle Type *</label>
                        <div className="grid grid-cols-2 gap-2">
                            {vehicleTypes.map(vt => (
                                <button
                                    key={vt.value}
                                    onClick={() => setForm(p => ({ ...p, vehicleType: vt.value }))}
                                    className={`p-3 rounded-xl border text-left transition-all ${form.vehicleType === vt.value ? 'border-primary-500 bg-primary-600/10' : 'border-white/10 bg-dark-700 hover:border-white/20'}`}
                                >
                                    <p className="text-sm font-medium text-white">{vt.label}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{vt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="label">Vehicle Registration Number *</label>
                        <input
                            className="input-field uppercase"
                            placeholder="TN 01 AB 1234"
                            value={form.vehicleNumber}
                            onChange={e => setForm(p => ({ ...p, vehicleNumber: e.target.value.toUpperCase() }))}
                        />
                    </div>

                    <div>
                        <label className="label">Driver Name (optional)</label>
                        <input
                            className="input-field"
                            placeholder="e.g. Rajan"
                            value={form.driverName}
                            onChange={e => setForm(p => ({ ...p, driverName: e.target.value }))}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {loading
                            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                            : '📤 Log Ride & Notify Contacts'
                        }
                    </button>
                </div>

                {/* Ride history */}
                {rides.length > 0 && (
                    <div className="card space-y-1">
                        <h3 className="section-title text-sm mb-4">Ride Log</h3>
                        {rides.map((ride, i) => (
                            <motion.div
                                key={ride._id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center text-base shrink-0">
                                        {ride.vehicleType === 'cab' ? '🚕' : ride.vehicleType === 'auto' ? '🛺' : ride.vehicleType === 'bus' ? '🚌' : '🚗'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-mono font-medium text-white/90">{ride.vehicleNumber}</p>
                                        <p className="text-xs text-white/40">
                                            {ride.driverName ? `${ride.driverName} · ` : ''}
                                            {new Date(ride.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => reshareRide(ride._id)}
                                    className="text-xs text-primary-400 hover:text-primary-300 px-3 py-1.5 rounded-lg hover:bg-primary-600/10 transition-all"
                                >
                                    Reshare
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}