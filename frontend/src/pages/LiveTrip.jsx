import React, { useState, useEffect } from "react";
import MapContainer from "../components/MapContainer";
import { Navigation, Clock, Share2, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const LiveTrip = () => {
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [destination, setDestination] = useState("");
  const [eta, setEta] = useState("");

  const startTrip = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/trips",
        {
          destination,
          eta: new Date(Date.now() + parseInt(eta) * 60000),
          contactsToNotify: user.emergencyContacts
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTrip(res.data);
      toast.success("Trip shared with emergency contacts!");
      startLocationUpdates();
    } catch (err) {
      toast.error("Failed to start trip");
    }
  };

  const startLocationUpdates = () => {
    setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await axios.put(
            "http://localhost:5000/api/trips/location",
            { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
        } catch (err) {
          console.error("Location sync failed");
        }
      });
    }, 30000); // 30s updates
  };

  const endTrip = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/trips/end",
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTrip(null);
      toast.info("Trip ended. Glad you're safe!");
    } catch (err) {
      toast.error("Error ending trip");
    }
  };

  if (trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="h-[60vh] w-full">
          <MapContainer center={[77.209, 28.613]} />
        </div>
        <div className="p-6 -mt-8 flex-1 bg-white rounded-t-[40px] shadow-2xl relative z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-1 bg-slate-200 rounded-full mb-6"></div>
            <div className="w-full flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Journey</h2>
                <p className="text-slate-500 font-medium">Tracking enabled • Live Feed</p>
              </div>
              <div className="bg-safe/10 text-safe px-4 py-2 rounded-2xl flex items-center gap-2 border border-safe/20">
                <ShieldCheck size={18} />
                <span className="font-bold text-sm">SECURE</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</p>
                  <p className="text-slate-800 font-bold">{trip.destination}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Arrival</p>
                  <p className="text-slate-800 font-bold">{new Date(trip.eta).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 w-full flex gap-4">
              <button
                onClick={() => {
                  const url = `http://localhost:5173/track/${trip.trackingToken}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Tracking link copied!");
                }}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-4 rounded-3xl flex items-center justify-center gap-2"
              >
                <Share2 size={20} />
                SHARE LINK
              </button>
              <button
                onClick={endTrip}
                className="flex-1 bg-primary text-white font-bold py-4 rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <CheckCircle2 size={20} />
                END TRIP
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 items-center justify-center">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center shadow-lg mb-6 rotate-12">
          <Navigation size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-2">Live Trip Share</h2>
        <p className="text-slate-500 font-medium text-center mb-8">Share your real-time journey with trusted contacts for extra safety.</p>

        <div className="w-full space-y-4">
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Where are you going?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/50 font-bold text-slate-800"
            />
          </div>

          <div className="relative">
            <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              placeholder="ETA (minutes)"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/50 font-bold text-slate-800"
            />
          </div>

          <button
            onClick={startTrip}
            className="w-full bg-primary hover:bg-secondary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95"
          >
            START JOURNEY & NOTIFY
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveTrip;
