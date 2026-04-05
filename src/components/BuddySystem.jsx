import React, { useState } from 'react';
import { useSafety } from '../context/SafetyContext';
import { Users, Search, MessageSquare, ShieldCheck, MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BuddySystem = () => {
    const { location } = useSafety();
    const [matchingStep, setMatchingStep] = useState('input'); // 'input', 'matching', 'results', 'chat'
    const [tripDetails, setTripDetails] = useState({ origin: '', destination: '', time: '' });
    const [matches, setMatches] = useState([]);
    const [activeChat, setActiveChat] = useState(null);

    const startMatching = (e) => {
        e.preventDefault();
        setMatchingStep('matching');
        // Simulated AI Matching Delay
        setTimeout(() => {
            setMatches([
                { id: 1, name: 'Aditi', distance: '0.4km away', overlap: '85%', timeLeft: '12 mins' },
                { id: 2, name: 'Priya', distance: '0.8km away', overlap: '60%', timeLeft: '25 mins' },
                { id: 3, name: 'Sanya', distance: '1.2km away', overlap: '95%', timeLeft: '05 mins' }
            ]);
            setMatchingStep('results');
        }, 3000);
    };

    const handleAcceptBuddy = (buddy) => {
        setActiveChat(buddy);
        setMatchingStep('chat');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence mode="wait">
                {matchingStep === 'input' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="input">
                        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', marginBottom: '30px' }}>
                            <Users size={48} color="var(--secondary-color)" style={{ marginBottom: '15px' }} />
                            <h2>Buddy System</h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Match with women traveling similar routes to walk or ride together.</p>
                        </div>

                        <form onSubmit={startMatching} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>FROM</label>
                                    <input required placeholder="Current Location" value={tripDetails.origin} onChange={e => setTripDetails({...tripDetails, origin: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>TO</label>
                                    <input required placeholder="Destination" value={tripDetails.destination} onChange={e => setTripDetails({...tripDetails, destination: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>DEPARTURE TIME</label>
                                <input required type="time" value={tripDetails.time} onChange={e => setTripDetails({...tripDetails, time: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px' }} />
                            </div>
                            <button type="submit" style={{ background: 'var(--secondary-color)', color: 'white', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: '800' }}>FIND BUDDIES</button>
                        </form>
                    </motion.div>
                )}

                {matchingStep === 'matching' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="matching" className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                         <div className="sos-ripple" style={{ margin: '0 auto', width: '80px', height: '80px', border: '2px solid var(--secondary-color)', position: 'relative' }}></div>
                         <Search size={32} color="var(--secondary-color)" style={{ marginTop: '-55px', position: 'relative' }} />
                         <h3 style={{ marginTop: '40px' }}>Finding Nearby Buddies...</h3>
                         <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Matching routes within 30 minutes of your time.</p>
                    </motion.div>
                )}

                {matchingStep === 'results' && (
                    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key="results">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>Found {matches.length} Matches</h3>
                            <button onClick={() => setMatchingStep('input')} style={{ background: 'transparent', border: 'none', color: 'var(--secondary-color)', fontSize: '12px' }}>Reset</button>
                        </div>
                        {matches.map(m => (
                            <div key={m.id} className="glass-card" style={{ padding: '15px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', background: 'var(--surface-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>
                                            {m.name[0]}
                                        </div>
                                        <strong>{m.name}</strong> • <span style={{ fontSize: '10px', color: 'var(--secondary-color)' }}>{m.overlap} Overlap</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                        Leaving in {m.timeLeft} • {m.distance}
                                    </div>
                                </div>
                                <button onClick={() => handleAcceptBuddy(m)} style={{ background: 'var(--secondary-color)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>Chat</button>
                            </div>
                        ))}
                    </motion.div>
                )}

                {matchingStep === 'chat' && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} key="chat">
                        <div className="glass-card" style={{ padding: '15px', height: '400px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShieldCheck size={18} color="var(--safe-color)" />
                                    <strong>{activeChat.name}</strong>
                                </div>
                                <button onClick={() => setMatchingStep('results')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '12px' }}>Exit</button>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                                <div style={{ alignSelf: 'flex-start', background: 'var(--surface-color)', padding: '8px 12px', borderRadius: '12px 12px 12px 0', fontSize: '13px' }}>
                                    Hi! I'm heading to {tripDetails.destination} too. Should we meet at the metro station?
                                </div>
                                <div style={{ alignSelf: 'flex-end', background: 'var(--secondary-color)', padding: '8px 12px', borderRadius: '12px 12px 0 12px', fontSize: '13px' }}>
                                    Sounds good! I'll be there in 15 mins.
                                </div>
                            </div>
                            <div style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
                                <input placeholder="Type a message..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '10px', fontSize: '13px' }} />
                                <button style={{ background: 'white', color: 'black', border: 'none', padding: '10px', borderRadius: '10px' }}><MessageSquare size={16} /></button>
                            </div>
                        </div>
                        <div className="glass-card" style={{ marginTop: '15px', padding: '10px', fontSize: '11px', textAlign: 'center', color: 'var(--safe-color)' }}>
                            Buddy Status: Connected • If she doesn't check in within 15m of arrival, you'll be alerted.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BuddySystem;
