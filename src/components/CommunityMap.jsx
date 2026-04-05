import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSafety } from '../context/SafetyContext';
import { AlertCircle, Plus, Navigation, ChevronRight, ShieldCheck, MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fixed Leaflet Icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const INCIDENT_TYPES = {
    harassment: { color: '#ff3b3b', label: 'Harassment' },
    lighting: { color: '#ff9100', label: 'Poor Lighting' },
    unsafe: { color: '#ffeb3b', label: 'Unsafe Road' },
    suspicious: { color: '#7c4dff', label: 'Suspicious Activity' },
    other: { color: '#a0a0a5', label: 'Other' }
};

const CommunityMap = () => {
  const { location } = useSafety();
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('shesafe_reports');
    return saved ? JSON.parse(saved) : [
        { id: 1, type: 'harassment', lat: 12.9716, lng: 77.5946, desc: 'Avoid this corner, group of men bothering passersby.', upvotes: 3, timestamp: Date.now() },
        { id: 2, type: 'lighting', lat: 12.9750, lng: 77.5990, desc: 'Street lights not working for past 2 days.', upvotes: 1, timestamp: Date.now() }
    ];
  });
  const [isReporting, setIsReporting] = useState(false);
  const [newReport, setNewReport] = useState({ type: 'harassment', desc: '' });
  const [routeMode, setRouteMode] = useState(null); // 'fastest' | 'safest'

  useEffect(() => {
    localStorage.setItem('shesafe_reports', JSON.stringify(reports));
  }, [reports]);

  // TTL Logic Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setReports(prev => prev.filter(r => (Date.now() - r.timestamp) < 48 * 60 * 60 * 1000));
    }, 600000); // Check every 10 mins
    return () => clearInterval(interval);
  }, []);

  const handleReportSubmit = () => {
    const report = {
        id: Date.now(),
        ...newReport,
        lat: location.lat + (Math.random() - 0.5) * 0.005, // Random near current
        lng: location.lng + (Math.random() - 0.5) * 0.005,
        upvotes: 0,
        timestamp: Date.now()
    };
    setReports([...reports, report]);
    setIsReporting(false);
    setNewReport({ type: 'harassment', desc: '' });
  };

  const upvoteReport = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1, timestamp: Date.now() } : r));
  };

  // Safe Route Calculation
  const calculateSafetyScore = (routePath) => {
    let score = 100;
    reports.forEach(r => {
        // Simple distance proxy for safety score logic
        const dist = Math.sqrt(Math.pow(r.lat - location.lat, 2) + Math.pow(r.lng - location.lng, 2));
        if (dist < 0.002) score -= 25; // Close to an incident
    });
    return Math.max(0, score);
  };

  return (
    <div style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div className="glass-card" style={{ padding: '12px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
         <button onClick={() => setRouteMode('fastest')} style={{ 
             flex: 1, 
             background: routeMode === 'fastest' ? 'var(--secondary-color)' : 'rgba(255,255,255,0.05)', 
             border: 'none', 
             padding: '10px', 
             borderRadius: '12px', 
             color: 'white',
             fontSize: '11px',
             fontWeight: '700',
             transition: '0.3s'
         }}>
             FASTEST
         </button>
         <button onClick={() => setRouteMode('safest')} style={{ 
             flex: 1, 
             background: routeMode === 'safest' ? 'var(--safe-color)' : 'rgba(255,255,255,0.05)', 
             border: 'none', 
             padding: '10px', 
             borderRadius: '12px', 
             color: routeMode === 'safest' ? '#000' : 'white',
             fontSize: '11px',
             fontWeight: '700',
             transition: '0.3s'
         }}>
             SAFEST
         </button>
      </div>

      <div style={{ flex: 1, borderRadius: '24px', overflow: 'hidden', position: 'relative', border: '1px solid var(--glass-border)' }}>
          <MapContainer center={[location.lat, location.lng]} zoom={14} scrollWheelZoom={false}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={[location.lat, location.lng]} />
            <Circle center={[location.lat, location.lng]} radius={200} pathOptions={{ color: 'var(--primary-color)', fillOpacity: 0.1 }} />

            {reports.map(report => (
                <Marker key={report.id} position={[report.lat, report.lng]}>
                    <Popup>
                        <div style={{ minWidth: '150px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <AlertCircle size={14} color={INCIDENT_TYPES[report.type].color} />
                                <strong style={{ textTransform: 'uppercase', fontSize: '10px' }}>{INCIDENT_TYPES[report.type].label}</strong>
                            </div>
                            <p style={{ fontSize: '12px', margin: '8px 0' }}>{report.desc}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <span style={{ fontSize: '10px', color: '#666' }}>{report.upvotes} Confirmations</span>
                                <button onClick={() => upvoteReport(report.id)} style={{ padding: '4px 8px', borderRadius: '4px', background: '#f0f0f0', border: 'none', fontSize: '10px', cursor: 'pointer' }}>Upvote</button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {routeMode === 'safest' && (
                <Polyline positions={[
                    [location.lat, location.lng],
                    [location.lat + 0.005, location.lng + 0.005],
                    [location.lat + 0.012, location.lng + 0.01]
                ]} color="var(--safe-color)" weight={5} opacity={0.7} />
            )}
            {routeMode === 'fastest' && (
                <Polyline positions={[
                    [location.lat, location.lng],
                    [location.lat + 0.01, location.lng + 0.008],
                    [location.lat + 0.012, location.lng + 0.01]
                ]} color="var(--secondary-color)" weight={5} opacity={0.7} dashArray="10, 10" />
            )}
          </MapContainer>

          <button onClick={() => setIsReporting(true)} style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000, background: 'var(--primary-color)', color: 'white', border: 'none', width: '50px', height: '50px', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} />
          </button>
      </div>

      <AnimatePresence>
          {isReporting && (
              <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className="glass-card" style={{ position: 'fixed', bottom: 0, left: 0, width: '100vw', borderRadius: '24px 24px 0 0', zIndex: 2000, color: 'white' }}>
                  <h3 style={{ marginBottom: '15px' }}>Report Incident</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <select value={newReport.type} onChange={(e) => setNewReport({ ...newReport, type: e.target.value })} style={{ background: 'var(--surface-color)', color: 'white', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                          {Object.entries(INCIDENT_TYPES).map(([val, info]) => (
                              <option key={val} value={val}>{info.label}</option>
                          ))}
                      </select>
                      <textarea placeholder="Describe what happened..." value={newReport.desc} onChange={(e) => setNewReport({ ...newReport, desc: e.target.value })} style={{ background: 'var(--surface-color)', color: 'white', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', minHeight: '80px' }} />
                      <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => setIsReporting(false)} style={{ flex: 1, background: 'transparent', color: 'white', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px' }}>Cancel</button>
                          <button onClick={handleReportSubmit} style={{ flex: 1, background: 'var(--primary-color)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700' }}>Submit Report</button>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {routeMode && (
          <div className="glass-card" style={{ fontSize: '12px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                   <span>Route: <strong>{routeMode.toUpperCase()}</strong></span>
                   <span style={{ color: routeMode === 'safest' ? 'var(--safe-color)' : 'var(--text-secondary)' }}>Safety Score: {routeMode === 'safest' ? 98 : 72}/100</span>
               </div>
               <div style={{ color: 'var(--text-secondary)' }}>Est. Time: {routeMode === 'safest' ? '14 mins' : '10 mins'} • Distance: 2.4km</div>
          </div>
      )}
    </div>
  );
};

export default CommunityMap;
