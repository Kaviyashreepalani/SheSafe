import React, { useState } from 'react';
import { useSafety } from '../context/SafetyContext';
import { Car, Send, History, MapPin, Bus, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RideLog = () => {
    const { rideLog, setRideLog, location } = useSafety();
    const [isLogging, setIsLogging] = useState(false);
    const [newRide, setNewRide] = useState({ reg: '', type: 'cab', driver: '' });

    const handleLogSubmit = (e) => {
        e.preventDefault();
        const entry = {
            id: Date.now(),
            ...newRide,
            timestamp: new Date().toISOString(),
            location: { ...location }
        };
        setRideLog([entry, ...rideLog]);
        alert(`Ride Details Shared! Contacts notified: [${newRide.reg}] at your current GPS.`);
        setIsLogging(false);
        setNewRide({ reg: '', type: 'cab', driver: '' });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px', background: 'var(--surface-color)', textAlign: 'center' }}>
                <Car size={48} color="var(--secondary-color)" style={{ marginBottom: '15px' }} />
                <h2 style={{ marginBottom: '10px' }}>Ride Verification</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Log your vehicle details before boarding to share them instantly with your contacts.</p>
                <button 
                    onClick={() => setIsLogging(true)}
                    style={{ background: 'var(--secondary-color)', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}
                >
                    LOG NEW RIDE
                </button>
            </div>

            <AnimatePresence>
                {isLogging && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="glass-card" style={{ padding: '24px', position: 'fixed', bottom: '100px', left: '20px', right: '20px', zIndex: 1100 }}>
                        <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>Ride Details</h3>
                                <button type="button" onClick={() => setIsLogging(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>Close</button>
                            </div>
                            <input 
                                required
                                placeholder="Vehicle Number (e.g. KA01AB1234)" 
                                value={newRide.reg} 
                                onChange={e => setNewRide({...newRide, reg: e.target.value.toUpperCase()})}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select 
                                    value={newRide.type} 
                                    onChange={e => setNewRide({...newRide, type: e.target.value})}
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px' }}
                                >
                                    <option value="cab">Cab</option>
                                    <option value="auto">Auto</option>
                                    <option value="bus">Bus</option>
                                    <option value="other">Other</option>
                                </select>
                                <input 
                                    placeholder="Driver Name (Optional)" 
                                    value={newRide.driver} 
                                    onChange={e => setNewRide({...newRide, driver: e.target.value})}
                                    style={{ flex: 2, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px' }}
                                />
                            </div>
                            <button type="submit" style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Send size={18} /> CONFIRM & NOTIFY
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '15px' }}>RIDE HISTORY</h3>
                {rideLog.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No rides logged yet.</div>
                ) : (
                    rideLog.map((ride, idx) => (
                        <div key={idx} className="glass-card" style={{ padding: '15px', marginBottom: '12px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {ride.type === 'bus' ? <Bus size={20} /> : <Navigation size={20} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <strong style={{ fontSize: '16px' }}>{ride.reg}</strong>
                                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{new Date(ride.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    <span>{ride.type.toUpperCase()}</span> • 
                                    <span>{ride.driver || 'No Driver Name'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '10px', color: 'var(--secondary-color)' }}>
                                    <MapPin size={10} /> Shared at {new Date(ride.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                            <button style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: '8px', color: 'white', fontSize: '10px' }}>Reshare</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RideLog;
