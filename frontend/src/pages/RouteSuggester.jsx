import React, { useState } from "react";
import MapContainer from "../components/MapContainer";
import { Shield, Zap, MapPin, Search, Navigation, AlertTriangle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const RouteSuggester = () => {
    const { user } = useAuth();
    const [destination, setDestination] = useState("");
    const [results, setResults] = useState(null);

    const suggestRoute = async () => {
        try {
            // In a real app, this would call specialized routing API with safety weights
            // For now, simulating the calculation
            const score = Math.floor(Math.random() * (95 - 65 + 1)) + 65;
            setResults({
                fastest: { time: "12m", distance: "2.4km", safety: score - 15 },
                safest: { time: "15m", distance: "2.9km", safety: score },
                points: [
                    { latitude: 28.6139, longitude: 77.2090, type: "route", title: "Start" },
                    { latitude: 28.6200, longitude: 77.2150, type: "alert", title: "Low Lighting", description: "Reported 2h ago" }
                ]
            });
            toast.success("Safe route calculated!");
        } catch (err) {
            toast.error("Error calculating routes");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="h-[45vh] w-full relative">
                <MapContainer markers={results?.points || []} />
                <div className="absolute top-4 left-4 right-4 z-10">
                    <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 flex gap-2">
                        <div className="flex-1 relative">
                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Enter destination..."
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <button
                            onClick={suggestRoute}
                            className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Search size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Route Suggestions</h3>

                {!results ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                        <Navigation size={48} className="mb-4 opacity-10 rotate-45" />
                        <p className="font-bold">Enter a destination to plan safely</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Safest Route Card */}
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-safe/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 bg-safe/10 text-safe rounded-bl-3xl font-black text-xs uppercase tracking-widest">
                                Recommended
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-safe/10 text-safe rounded-2xl flex items-center justify-center">
                                    <Shield size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800">Safest Route</h4>
                                    <p className="text-sm text-slate-500 font-medium">Prioritizes well-lit, populated roads</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Time</p>
                                        <p className="font-black text-slate-800">{results.safest.time}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Dist</p>
                                        <p className="font-black text-slate-800">{results.safest.distance}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Safety Score</p>
                                    <p className="text-3xl font-black text-safe tracking-tighter">{results.safest.safety}<span className="text-sm">/100</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Fastest Route Card */}
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                                    <Zap size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800">Fastest Route</h4>
                                    <p className="text-sm text-slate-500 font-medium">Uses main roads for speed</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Time</p>
                                        <p className="font-black text-slate-800">{results.fastest.time}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Dist</p>
                                        <p className="font-black text-slate-800">{results.fastest.distance}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Safety Score</p>
                                    <p className="text-3xl font-black text-blue-500 tracking-tighter">{results.fastest.safety}<span className="text-sm">/100</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RouteSuggester;
