import React from 'react';
import { useSafety } from '../context/SafetyContext';
import { ShieldAlert, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOSButton = () => {
    const { isSosActive, triggerSos, cancelSos, sosCountdown, sosHistory } = useSafety();

    return (
        <div className="sos-button-container">
            <AnimatePresence mode="wait">
                {!isSosActive ? (
                    <motion.button 
                        key="idle"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        className="sos-outer"
                        onClick={triggerSos}
                    >
                        <div className="sos-ripple"></div>
                        <div className="sos-inner">SOS</div>
                    </motion.button>
                ) : sosCountdown !== null ? (
                    <motion.div 
                        key="countdown"
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card"
                        style={{ textAlign: 'center', borderColor: 'var(--primary-color)' }}
                    >
                        <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>ALERT TRIGGERING</h2>
                        <div style={{ fontSize: '64px', fontWeight: '900', color: 'var(--primary-color)' }}>{sosCountdown}s</div>
                        <p style={{ color: 'var(--text-secondary)', margin: '15px 0' }}>Hold to cancel or wait 5s for auto-alert.</p>
                        <button 
                            onClick={cancelSos}
                            style={{ 
                                background: 'transparent', 
                                border: '2px solid var(--text-secondary)', 
                                color: 'white', 
                                padding: '12px 24px', 
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                margin: '0 auto'
                            }}
                        >
                            <XCircle size={18} /> CANCEL
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="active"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-card"
                        style={{ borderColor: 'var(--primary-color)', background: 'rgba(255, 59, 59, 0.1)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <ShieldAlert color="var(--primary-color)" size={32} />
                            <h2 style={{ color: 'var(--primary-color)' }}>SOS ACTIVE</h2>
                        </div>
                        <p style={{ marginBottom: '20px' }}>Contacts have been notified with your GPS coordinates. We are updating your location every 60 seconds.</p>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '12px' }}>
                             <strong>Status:</strong> Sending live pings...
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ width: '100%', marginTop: '30px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '15px' }}>RECENT LOGS</h3>
                {sosHistory.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '12px' }}>No recent triggers.</p>
                ) : (
                    sosHistory.slice(0, 3).map((log, idx) => (
                        <div key={idx} className="glass-card" style={{ padding: '10px 15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '600' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                            </div>
                            <div style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                 {log.status.toUpperCase()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SOSButton;
