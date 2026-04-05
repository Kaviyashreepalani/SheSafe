import React, { useState, useEffect } from "react";
import MapContainer from "../components/MapContainer";
import AlertCard from "../components/AlertCard";
import { AlertTriangle, Plus, MapPin, CheckCircle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Community = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [isReporting, setIsReporting] = useState(false);
  const [newAlert, setNewAlert] = useState({ type: "Safety Concern", description: "" });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/alerts");
      setAlerts(res.data);
    } catch (err) {
      toast.error("Failed to fetch alerts");
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.post(
          "http://localhost:5000/api/alerts",
          {
            ...newAlert,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        toast.success("Alert reported! Stay safe.");
        setIsReporting(false);
        setNewAlert({ type: "Safety Concern", description: "" });
        fetchAlerts();
      } catch (err) {
        toast.error("Failed to report alert");
      }
    });
  };

  const handleUpvote = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/alerts/${id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchAlerts();
    } catch (err) {
      toast.error("Error upvoting alert");
    }
  };

  const mapMarkers = alerts.map(a => ({
    latitude: a.location.latitude,
    longitude: a.location.longitude,
    type: "alert",
    title: a.type,
    description: a.description
  }));

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Map Section */}
      <div className="h-[40vh] w-full relative">
        <MapContainer markers={mapMarkers} />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
            <AlertTriangle size={18} className="text-primary" />
            <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">Live Traffic Safety</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Community Board</h2>
          <button
            onClick={() => setIsReporting(true)}
            className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <Plus size={20} />
            <span>REPORT</span>
          </button>
        </div>

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
              <CheckCircle size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Area looks safe! No active alerts.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <AlertCard key={alert._id} alert={alert} onUpvote={handleUpvote} />
            ))
          )}
        </div>
      </div>

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="text-primary" />
              Report Incident
            </h3>
            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Issue Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-primary/50 text-sm font-bold"
                >
                  <option>Safety Concern</option>
                  <option>Poor Lighting</option>
                  <option>Harassment</option>
                  <option>Suspicious Activity</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Details</label>
                <textarea
                  placeholder="Tell others what's happening..."
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-primary/50 text-sm font-medium h-24"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20"
                >
                  SUBMIT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
