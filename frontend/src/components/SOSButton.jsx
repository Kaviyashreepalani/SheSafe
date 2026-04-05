import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const SOSButton = () => {
  const { user } = useAuth();
  const [isTriggering, setIsTriggering] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    if (isTriggering && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isTriggering) {
      triggerSOS();
    }
    return () => clearInterval(timer);
  }, [isTriggering, countdown]);

  const triggerSOS = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await axios.post(
            "http://localhost:5000/api/sos",
            { latitude, longitude, source: "App Tap" },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          toast.error("SOS SENT! Help is on the way.", {
            position: "top-center",
            autoClose: 10000,
          });
          setIsTriggering(false);
          setCountdown(5);
        } catch (err) {
          toast.error("Failed to send SOS. Try again!");
        }
      },
      (error) => {
        toast.error("GPS Access Denied! Enable location for SOS.");
      }
    );
  };

  const handleCancel = () => {
    setIsTriggering(false);
    setCountdown(5);
    toast.info("SOS Cancelled");
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-2xl border border-primary/10">
      {!isTriggering ? (
        <button
          onClick={() => setIsTriggering(true)}
          className="group relative w-64 h-64 bg-primary hover:bg-secondary rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-primary/40 active:scale-95"
        >
          <div className="absolute inset-0 rounded-full animate-ping-slow bg-primary/20 group-hover:bg-primary/40"></div>
          <div className="flex flex-col items-center">
            <AlertCircle size={80} className="text-white mb-2" />
            <span className="text-white font-bold text-2xl tracking-widest">SOS</span>
          </div>
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-64 h-64 rounded-full border-8 border-primary flex items-center justify-center relative">
              <span className="text-6xl font-black text-primary">{countdown}</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="120"
                  fill="transparent"
                  stroke="#ff4d6d"
                  strokeWidth="8"
                  strokeDasharray="754"
                  strokeDashoffset={754 - (754 * countdown) / 5}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
            </div>
            <p className="mt-4 text-slate-500 font-medium italic">Hold to trigger, tap X to cancel...</p>
            <button
              onClick={handleCancel}
              className="mt-6 p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors flex items-center"
            >
              <X size={24} className="mr-2" />
              <span className="font-bold">CANCEL</span>
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default SOSButton;
