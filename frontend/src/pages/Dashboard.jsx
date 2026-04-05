import React, { useState } from "react";
import SOSButton from "../components/SOSButton";
import { useAuth } from "../context/AuthContext";
import { Shield, Navigation, Users, AlertTriangle, PhoneCall, Calculator as CalcIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Calculator from "../components/Calculator";

const Dashboard = () => {
  const { user } = useAuth();
  const [isDiscreet, setIsDiscreet] = useState(false);

  if (isDiscreet) {
    return <Calculator onUnlock={() => setIsDiscreet(false)} />;
  }

  const quickActions = [
    { title: "Live Trip", icon: <Navigation />, path: "/trip", color: "bg-blue-500" },
    { title: "Buddy Match", icon: <Users />, path: "/buddies", color: "bg-purple-500" },
    { title: "Safety Board", icon: <AlertTriangle />, path: "/community", color: "bg-amber-500" },
    { title: "Fake Call", icon: <PhoneCall />, path: "/fake-call", color: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 pb-12 rounded-b-[40px] shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">SheSafe</h1>
          </div>
          <button 
            onClick={() => setIsDiscreet(true)}
            className="p-3 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
            title="Discreet Mode"
          >
            <CalcIcon size={20} />
          </button>
        </div>
        
        <div className="flex flex-col">
          <span className="text-slate-400 font-medium">Welcome back,</span>
          <h2 className="text-3xl font-black text-slate-900">{user?.name} 👋</h2>
        </div>
      </div>

      {/* SOS Section */}
      <div className="px-6 -mt-8 flex justify-center">
        <SOSButton />
      </div>

      {/* Safety Status */}
      <div className="px-6 mt-8">
        <div className="glass p-5 rounded-3xl flex items-center justify-between border-primary/20">
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Device Status</p>
            <h3 className="text-slate-800 font-bold text-lg">GPS: Active • Battery: 84%</h3>
          </div>
          <div className="w-4 h-4 bg-safe rounded-full animate-pulse shadow-[0_0_10px_2px_rgba(46,204,113,0.5)]"></div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-6 mt-8">
        <h3 className="text-slate-900 font-black text-xl mb-4 px-2 tracking-tight">Safety Suite</h3>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, idx) => (
            <Link 
              key={idx} 
              to={action.path}
              className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-start gap-4 hover:shadow-md transition-all active:scale-95 group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="font-black text-slate-800 tracking-tight">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Nav Simulation (Mobile-First) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex justify-around items-center rounded-t-[30px] shadow-2xl z-50">
        <Link to="/" className="flex flex-col items-center text-primary">
          <Shield size={24} />
          <span className="text-[10px] font-bold mt-1">HOME</span>
        </Link>
        <Link to="/community" className="flex flex-col items-center text-slate-400 hover:text-primary">
          <AlertTriangle size={24} />
          <span className="text-[10px] font-bold mt-1">ALERTS</span>
        </Link>
        <Link to="/trip" className="flex flex-col items-center text-slate-400 hover:text-primary">
          <Navigation size={24} />
          <span className="text-[10px] font-bold mt-1">TRIP</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400 hover:text-primary">
          <Users size={24} />
          <span className="text-[10px] font-bold mt-1">BUDDY</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
