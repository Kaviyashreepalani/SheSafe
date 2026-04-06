import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const BackArrow = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

export default function Buddies() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket } = useSocket();

    const [phase, setPhase] = useState('search'); // search | results | chat
    const [form, setForm] = useState({ origin: '', destination: '', departureTime: '' });
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socket || !chatId) return;
        socket.emit('join-buddy-chat', chatId);
        socket.on('buddy-message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });
        return () => socket.off('buddy-message');
    }, [socket, chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getCoords = (placeName) => {
        // In production, use a geocoding API (Mapbox/Google)
        // For now, use device location as fallback
        return new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(
                p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
                reject
            )
        );
    };

    const searchBuddies = async () => {
        if (!form.origin || !form.destination || !form.departureTime) {
            setError('All fields required.'); return;
        }
        setError(''); setLoading(true);
        try {
            const [originCoords, destCoords] = await Promise.all([getCoords(form.origin), getCoords(form.destination)]);
            const res = await axios.post('/api/buddies/search', {
                ...form,
                originLat: originCoords.lat,
                originLng: originCoords.lng,
                destLat: destCoords.lat,
                destLng: destCoords.lng,
            });
            setMatches(res.data);
            setPhase('results');
        } catch (err) {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const acceptBuddy = async (buddyId) => {
        try {
            const res = await axios.post('/api/buddies/accept', { buddyRequestId: buddyId });
            setChatId(res.data.chatId);
            setPhase('chat');
        } catch {
            setError('Could not connect with buddy.');
        }
    };

    const sendMessage = () => {
        if (!inputMsg.trim() || !socket || !chatId) return;
        const msg = { chatId, message: inputMsg.trim(), senderId: user?.id };
        socket.emit('buddy-message', msg);
        setMessages(prev => [...prev, { ...msg, timestamp: new Date(), isMine: true }]);
        setInputMsg('');
    };

    const minDeparture = new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16);

    return (
        <div className="min-h-screen bg-dark-900 font-body flex flex-col">
            <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] px-5 py-4 flex items-center gap-3">
                <button
                    onClick={() => phase === 'search' ? navigate('/') : setPhase(phase === 'chat' ? 'results' : 'search')}
                    className="text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
                >
                    <BackArrow />
                </button>
                <h1 className="font-display text-xl font-bold text-white">
                    {phase === 'search' ? 'Buddy Match' : phase === 'results' ? 'Matches Found' : 'Buddy Chat'}
                </h1>
                {phase === 'results' && (
                    <span className="ml-auto badge bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                    </span>
                )}
            </header>

            <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-6 pb-10">
                <AnimatePresence mode="wait">
                    {/* Search form */}
                    {phase === 'search' && (
                        <motion.div key="search" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                            <div className="card space-y-4">
                                <div>
                                    <h2 className="section-title">Find a Travel Buddy</h2>
                                    <p className="text-sm text-white/40 mt-1">Match with women on the same route within 30 minutes of your departure.</p>
                                </div>

                                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

                                <div>
                                    <label className="label">From</label>
                                    <input className="input-field" placeholder="e.g. Adyar, Chennai" value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">To</label>
                                    <input className="input-field" placeholder="e.g. Anna Nagar, Chennai" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Departure Time</label>
                                    <input type="datetime-local" className="input-field" min={minDeparture} value={form.departureTime} onChange={e => setForm(p => ({ ...p, departureTime: e.target.value }))} />
                                </div>

                                <button onClick={searchBuddies} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                                    {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Searching…</> : '🔍 Find Buddies'}
                                </button>
                            </div>

                            <div className="card bg-purple-500/5 border-purple-500/20 space-y-2">
                                <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest">How it works</p>
                                <div className="space-y-2 text-sm text-white/50">
                                    <p>1. Enter your route and departure time</p>
                                    <p>2. We match you with women on the same route (±30 min window)</p>
                                    <p>3. Accept a buddy to start a private chat</p>
                                    <p>4. Travel together virtually or physically</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Results */}
                    {phase === 'results' && (
                        <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            {matches.length === 0 ? (
                                <div className="card flex flex-col items-center py-12 text-center">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <p className="font-semibold text-white/80">No buddies found right now</p>
                                    <p className="text-sm text-white/40 mt-1 max-w-xs">Your request is active. We'll match you as others search for the same route.</p>
                                    <button onClick={() => setPhase('search')} className="btn-ghost text-sm mt-6">Modify Search</button>
                                </div>
                            ) : (
                                matches.map((match, i) => (
                                    <motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="card space-y-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-lg">
                                                {match.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{match.name}</p>
                                                <p className="text-xs text-white/40">
                                                    Departs {new Date(match.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <span className="ml-auto badge bg-green-500/15 text-green-400 border border-green-500/20 text-xs">Route match</span>
                                        </div>
                                        <div className="text-xs text-white/40 space-y-1">
                                            <p>From: <span className="text-white/70">{match.origin}</span></p>
                                            <p>To: <span className="text-white/70">{match.destination}</span></p>
                                        </div>
                                        <button onClick={() => acceptBuddy(match.id)} className="btn-primary w-full py-2 text-sm">
                                            ✓ Connect as Buddy
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Chat */}
                    {phase === 'chat' && (
                        <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[calc(100vh-140px)]">
                            <div className="card mb-3 flex items-center gap-3 py-3">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <p className="text-sm text-white/70">Buddy matched — chat is end-to-end</p>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto space-y-3 px-1">
                                {messages.length === 0 && (
                                    <div className="text-center py-10 text-white/30 text-sm">
                                        Say hi to your buddy! 👋
                                    </div>
                                )}
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.isMine ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-dark-700 text-white/90 rounded-bl-sm'}`}>
                                            <p>{msg.message}</p>
                                            <p className={`text-xs mt-1 ${msg.isMine ? 'text-white/50' : 'text-white/30'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="flex gap-2 mt-3">
                                <input
                                    className="input-field flex-1 py-2.5"
                                    placeholder="Type a message…"
                                    value={inputMsg}
                                    onChange={e => setInputMsg(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                />
                                <button onClick={sendMessage} className="w-11 h-11 rounded-xl bg-primary-600 hover:bg-primary-500 flex items-center justify-center transition-colors">
                                    <SendIcon />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}