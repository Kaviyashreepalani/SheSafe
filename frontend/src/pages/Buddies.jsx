import React, { useState, useEffect } from "react";
import { Users, Search, MapPin, CheckCircle, MessageSquare, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ChatBox from "../components/ChatBox";

const Buddies = () => {
    const { user } = useAuth();
    const [route, setRoute] = useState({ start: "", end: "" });
    const [buddies, setBuddies] = useState([]);
    const [activeChat, setActiveChat] = useState(null);

    const findBuddies = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/buddies/find?start=${route.start}&end=${route.end}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBuddies(res.data);
            if (res.data.length === 0) toast.info("No matching buddies found for this route yet.");
        } catch (err) {
            toast.error("Error searching for buddies");
        }
    };

    const handleMatch = async (requestId) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/buddies/match/${requestId}`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success("Chat opened with buddy!");
            setActiveChat(res.data.request._id);
        } catch (err) {
            toast.error("Failed to connect with buddy");
        }
    };

    if (activeChat) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
                <div className="w-full max-w-md">
                    <button 
                        onClick={() => setActiveChat(null)}
                        className="mb-4 text-primary font-bold flex items-center gap-2"
                    >
                        &larr; Back to Search
                    </button>
                    <ChatBox tripId={activeChat} userName={user.name} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="bg-primary p-8 pt-12 pb-20 rounded-b-[40px] shadow-xl text-white">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                        <Users size={32} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">Safety Buddies</h2>
                    <p className="text-white/80 font-medium">Find someone nearby walking the same route.</p>
                </div>
            </div>

            <div className="px-6 -mt-10">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-4">
                    <div className="relative">
                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Current Location"
                            value={route.start}
                            onChange={(e) => setRoute({ ...route, start: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="relative">
                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Destination"
                            value={route.end}
                            onChange={(e) => setRoute({ ...route, end: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <button
                        onClick={findBuddies}
                        className="w-full bg-primary hover:bg-secondary text-white font-black py-4 rounded-2xl shadow-lg transition-transform active:scale-95"
                    >
                        SEARCH BUDDIES
                    </button>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 mb-4 px-2">Matches Near You</h3>
                <div className="space-y-4">
                    {buddies.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
                             <Search size={48} className="mb-4 opacity-20" />
                             <p className="font-bold">Enter route to see matches</p>
                        </div>
                    ) : (
                        buddies.map((buddy) => (
                            <div key={buddy._id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800">{buddy.userId.name}</h4>
                                        <p className="text-xs text-slate-500 font-bold">{buddy.route.start} → {buddy.route.end}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleMatch(buddy._id)}
                                    className="bg-primary/10 text-primary p-3 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    <MessageSquare size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Buddies;
