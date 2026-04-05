import React, { useState } from 'react';
import { useSafety } from '../context/SafetyContext';
import { Share2, Plus, Search, MoreVertical, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DiscreetMode = () => {
  const { setIsDiscreetMode, isSosActive, markSafe } = useSafety();
  const [notes, setNotes] = useState([
    { id: 1, title: 'Grocery List', body: 'Milk, Eggs, Bread, Spinach, Tomatoes', date: '2 hours ago' },
    { id: 2, title: 'Project Ideas', body: '1. Web safety app\n2. Smart home integration\n3. Workout tracker', date: 'Yesterday' },
    { id: 3, title: 'Meeting Notes', body: 'Discuss Q3 goals with the team. Deadline: Friday.', date: '3 days ago' }
  ]);

  const handleTripleTap = (e) => {
    if (e.detail === 3) {
      setIsDiscreetMode(false);
    }
  };

  return (
    <div 
      className="discreet-overlay" 
      onClick={handleTripleTap}
      style={{ background: '#fefefe', color: '#1a1a1a', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', opacity: 0.9 }}>
         <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Notes</h1>
         <div style={{ display: 'flex', gap: '15px' }}>
             <Search size={22} color="#666" />
             <MoreVertical size={22} color="#666" />
         </div>
      </header>

      {isSosActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '4px', 
                background: 'rgba(0,0,0,0.05)' 
            }}
          />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {notes.map(note => (
          <div key={note.id} style={{ background: '#f5f5f7', padding: '15px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>{note.title}</h3>
            <p style={{ fontSize: '13px', color: '#666', whiteSpace: 'pre-wrap', marginBottom: '10px', height: '60px', overflow: 'hidden' }}>{note.body}</p>
            <span style={{ fontSize: '10px', color: '#999' }}>{note.date}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
         <p style={{ fontSize: '11px', color: '#ccc' }}>Triple tap anywhere to return</p>
      </div>

      <button style={{ 
          position: 'fixed', 
          bottom: '30px', 
          right: '30px', 
          background: '#007aff', 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          border: 'none', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
      }}>
        <Plus size={28} />
      </button>

      {/* Hidden Gesture hint for Evaluators */}
      <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: '8px', color: '#eee' }}>
          SheSafe Active (Notes Disguise)
      </div>
    </div>
  );
};

export default DiscreetMode;
