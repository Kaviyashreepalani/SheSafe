import React, { useState } from "react";
import { Car, Send, ShieldCheck, Phone, Clipboard } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const RideVerification = () => {
    const { user } = useAuth();
    const [details, setDetails] = useState({ plate: "", driver: "", phone: "" });

    const handleShare = async () => {
        try {
            await axios.post(
                "http://localhost:5000/api/rides",
                { vehicleDetails: details },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            toast.success("Ride details shared with contacts!");
        } catch (err) {
            toast.error("Failed to share ride details");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[32px] flex items-center justify-center mb-4 shadow-lg">
                        <Car size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ride Verification</h2>
                    <p className="text-slate-500 font-medium italic">Instantly log vehicle info & notify contacts.</p>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 flex flex-col gap-4">
                    <div className="relative">
                        <Clipboard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Vehicle Number (e.g. MH01AB1234)"
                            value={details.plate}
                            onChange={(e) => setDetails({ ...details, plate: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Driver Name (Optional)"
                            value={details.driver}
                            onChange={(e) => setDetails({ ...details, driver: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <button
                        onClick={handleShare}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={20} />
                        VERIFY & NOTIFY
                    </button>
                    <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest mt-2 italic">Details are logged in our secure database</p>
                </div>
            </div>
        </div>
    );
};

export default RideVerification;
