import React, { useState, useEffect } from 'react';
import { useSafety } from '../context/SafetyContext';
import { MapPin, Navigation, Clock, CheckCircle, Share2, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TripSharing = () => {
    const { currentTrip, setCurrentTrip, location, markSafe } = useSafety();
    const [tripInput, setTripInput] = useState({ dest: '', eta: '' });
    const [history, setHistory] = useState([
        { id: 1, dest: 'City Mall', start: '10:00 AM', end: '10:45 AM', status: 'Safe' },
        { id: 2, dest: 'Work', start: '08:30 AM', end: '09:12 AM', status: 'Safe' }
    ]);

    const startTrip = (e) => {
        e.preventDefault();
        const trip = {
            id: Date.now(),
            ...tripInput,
            startTime: new Date().toLocaleTimeString(),
            liveLink: `https://shesafe.app/track/${Math.random().toString(36).substr(2, 9)}`
        };
        setCurrentTrip(trip);
        alert(`Trip Started! Live link shared with contacts: ${trip.liveLink}`);
    };

    const endTrip = () => {
        const finished = {
            ...currentTrip,
            end: new Date().toLocaleTimeString(),
            status: 'Safe'
        };
        setHistory([finished, ...history]);
        setCurrentTrip(null);
        markSafe();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence mode="wait">
                {!currentTrip ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="setup">
                        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', marginBottom: '30px' }}>
                            <Navigation size={48} color="var(--primary-color)" style={{ marginBottom: '15px' }} />
                            <h2>Live Trip Sharing</h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Share your live location with contacts until you arrive safely.</p>
                        </div>

                        <form onSubmit={startTrip} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>DESTINATION</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <MapPin size={18} color="var(--primary-color)" />
                                    <input required placeholder="Enter destination..." value={tripInput.dest} onChange={e => setTripInput({...tripInput, dest: e.target.value})} style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>EXPECTED ARRIVAL TIME</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <Clock size={18} color="var(--primary-color)" />
                                    <input required type="time" value={tripInput.eta} onChange={e => setTripInput({...tripInput, eta: e.target.value})} style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }} />
                                </div>
                            </div>
                            <button type="submit" style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: '800' }}>START SHARING</button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} key="tracking">
                        <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--primary-color)', opacity: 0.2 }}></div>
                            <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Timer size={20} color="var(--primary-color)" /> TRIP IN PROGRESS
                            </h3>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Destination</span>
                                    <span style={{ fontWeight: '700' }}>{currentTrip.dest}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Started At</span>
                                    <span>{currentTrip.startTime}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Expected At</span>
                                    <span style={{ color: 'var(--warning-color)', fontWeight: '700' }}>{currentTrip.eta}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Your live tracking link is active:</div>
                                <div style={{ padding: '10px', background: 'var(--bg-color)', borderRadius: '10px', fontSize: '10px', border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Share2 size={12} /> {currentTrip.liveLink}
                                </div>
                            </div>
                            <button onClick={endTrip} style={{ width: '100%', background: 'var(--safe-color)', color: '#000', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: '800' }}>MARK SAFE & ARRIVED</button>
                            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '15px', textAlign: 'center' }}>If you don't mark safe within 10 mins of arrival, contacts will be alerted.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '15px' }}>TRIP HISTORY</h3>
                {history.map(item => (
                    <div key={item.id} className="glass-card" style={{ padding: '15px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>{item.dest}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                {item.start} - {item.end}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--safe-color)' }}>
                            <CheckCircle size={14} /> {item.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TripSharing;
