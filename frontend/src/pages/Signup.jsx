import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const StepIndicator = ({ current, total }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= current ? 'bg-primary-500' : 'bg-white/10'}`} />
    ))}
  </div>
);

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
  });

  const updateField = (field, value) =>
    setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    if (!form.name || !form.email || !form.password || !form.phone) {
      setError('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup({ ...form, emergencyContacts: [] });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4 font-body">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center mb-3 shadow-lg shadow-primary-600/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Create Account</h1>
        </div>

        <div className="card">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-5"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="section-title mb-4">Your details</h2>
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" placeholder="Aswini Priya" value={form.name} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => updateField('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone (with country code)</label>
              <input className="input-field" placeholder="+919876543210" value={form.phone} onChange={e => updateField('phone', e.target.value)} />
              <p className="text-xs text-white/30 mt-1">E.164 format, e.g. +919876543210</p>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={e => updateField('password', e.target.value)} />
            </div>
            
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}