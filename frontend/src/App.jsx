import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Community from "./pages/Community";
import LiveTrip from "./pages/LiveTrip";
import Buddies from "./pages/Buddies";
import RouteSuggester from "./pages/RouteSuggester";
import RideVerification from "./pages/RideVerification";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center text-primary font-black animate-pulse">SHESAFE...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl relative border-x border-slate-200">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/trip" element={<ProtectedRoute><LiveTrip /></ProtectedRoute>} />
            <Route path="/buddies" element={<ProtectedRoute><Buddies /></ProtectedRoute>} />
            <Route path="/ride" element={<ProtectedRoute><RideVerification /></ProtectedRoute>} />
            <Route path="/fake-call" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>

          <ToastContainer position="top-center" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;