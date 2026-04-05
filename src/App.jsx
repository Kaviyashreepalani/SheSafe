import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Map, Car, Users, Settings, History, Info } from 'lucide-react';
import { SafetyProvider, useSafety } from './context/SafetyContext';
import SOSButton from './components/SOSButton';
import CommunityMap from './components/CommunityMap';
import RideLog from './components/RideLog';
import BuddySystem from './components/BuddySystem';
import DiscreetMode from './components/DiscreetMode';
import TripSharing from './components/TripSharing';
import './index.css';

const AppContent = () => {
  const { isDiscreetMode, setIsDiscreetMode, isSosActive, markSafe } = useSafety();
  const location = useLocation();

  if (isDiscreetMode) {
    return <DiscreetMode />;
  }

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-color)' }}>SheSafe</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
             {isSosActive && (
                 <button onClick={markSafe} style={{ background: 'var(--safe-color)', border: 'none', padding: '8px 16px', borderRadius: '12px', color: '#000', fontWeight: '700', fontSize: '12px' }}>
                     I AM SAFE
                 </button>
             )}
             <button onClick={() => setIsDiscreetMode(true)} style={{ background: 'var(--surface-color)', border: 'none', padding: '8px', borderRadius: '12px', color: 'white' }}>
                 <Info size={18} />
             </button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<SOSButton />} />
        <Route path="/map" element={<CommunityMap />} />
        <Route path="/rides" element={<RideLog />} />
        <Route path="/buddies" element={<BuddySystem />} />
        <Route path="/trips" element={<TripSharing />} />
      </Routes>

      <nav className="glass-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Shield />
          <span>SOS</span>
        </Link>
        <Link to="/map" className={`nav-item ${location.pathname === '/map' ? 'active' : ''}`}>
          <Map />
          <span>ALERTS</span>
        </Link>
        <Link to="/rides" className={`nav-item ${location.pathname === '/rides' ? 'active' : ''}`}>
          <Car />
          <span>RIDES</span>
        </Link>
        <Link to="/buddies" className={`nav-item ${location.pathname === '/buddies' ? 'active' : ''}`}>
          <Users />
          <span>BUDDY</span>
        </Link>
        <Link to="/trips" className={`nav-item ${location.pathname === '/trips' ? 'active' : ''}`}>
          <History />
          <span>TRIPS</span>
        </Link>
      </nav>
    </div>
  );
};

function App() {
  return (
    <Router>
      <SafetyProvider>
        <AppContent />
      </SafetyProvider>
    </Router>
  );
}

export default App;
