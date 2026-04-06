import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function EmergencyContacts() {
  const { user, updateContacts, logout } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState(
    user?.emergencyContacts?.length > 0
      ? user.emergencyContacts
      : [{ name: '', phone: '', relation: '' }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const updateContact = (idx, field, value) => {
    const newContacts = [...contacts];
    newContacts[idx] = { ...newContacts[idx], [field]: value };
    setContacts(newContacts);
    setSuccess(false);
  };

  const addContact = () => {
    if (contacts.length < 5) {
      setContacts([...contacts, { name: '', phone: '', relation: '' }]);
    }
  };

  const removeContact = (idx) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    const validContacts = contacts.filter(c => c.name && c.phone);
    if (validContacts.length === 0) {
      setError('Please add at least one complete contact.');
      return;
    }

    setLoading(true);
    try {
      await updateContacts(validContacts);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Failed to update contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4 py-10 font-body">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <header className="mb-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
             </button>
             <h1 className="font-display text-xl font-bold text-white">Contacts</h1>
           </div>
           
           <button onClick={logout} className="text-white/40 hover:text-white/80 transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center gap-2 text-xs">
              <span>Logout</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
           </button>
        </header>

        <div className="card space-y-6">
          <div>
            <p className="text-sm text-white/60">Manage the people who will be alerted when you trigger an SOS.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Contacts updated successfully!
            </div>
          )}

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {contacts.map((c, i) => (
              <div key={i} className="bg-dark-700/50 rounded-xl p-4 space-y-3 border border-white/5 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">Contact #{i + 1}</span>
                  {contacts.length > 1 && (
                    <button onClick={() => removeContact(i)} className="text-red-400/40 hover:text-red-400 text-xs transition-colors">
                      Remove
                    </button>
                  )}
                </div>
                <input className="input-field text-sm" placeholder="Full Name" value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} />
                <input className="input-field text-sm" placeholder="Phone (+91XXXXXXXXXX)" value={c.phone} onChange={e => updateContact(i, 'phone', e.target.value)} />
                <p className="text-[10px] text-white/20 mt-1 italic">Must start with + and country code (e.g. +91...)</p>
                <input className="input-field text-sm" placeholder="Relation (e.g. Mom, Buddy)" value={c.relation} onChange={e => updateContact(i, 'relation', e.target.value)} />
              </div>
            ))}
          </div>

          {contacts.length < 5 && (
            <button onClick={addContact} className="w-full py-3 border border-dashed border-white/10 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 hover:border-white/20 text-sm transition-all flex items-center justify-center gap-2">
              <span className="text-lg">+</span> Add Another Contact
            </button>
          )}

          <div className="pt-2">
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
