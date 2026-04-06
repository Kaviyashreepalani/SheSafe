import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import LiveTrip from './pages/LiveTrip';
import RideVerification from './pages/RideVerification';
import Buddies from './pages/Buddies';
import Community from './pages/Community';
import RouteSuggester from './pages/RouteSuggester';
import PublicTracker from './pages/PublicTracker';
import EmergencyContacts from './pages/EmergencyContacts';
import Calculator from './components/Calculator';

// Protected route wrapper
const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// App with providers
const AppInner = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Loading SheSafe…</p>
      </div>
    </div>
  );

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/track/:trackingId" element={<PublicTracker />} />
      <Route path="/disguise" element={<Calculator />} />

      {/* Protected routes */}
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/trip" element={<Protected><LiveTrip /></Protected>} />
      <Route path="/ride" element={<Protected><RideVerification /></Protected>} />
      <Route path="/buddy" element={<Protected><Buddies /></Protected>} />
      <Route path="/community" element={<Protected><Community /></Protected>} />
      <Route path="/routes" element={<Protected><RouteSuggester /></Protected>} />
      <Route path="/contacts" element={<Protected><EmergencyContacts /></Protected>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppInner />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}