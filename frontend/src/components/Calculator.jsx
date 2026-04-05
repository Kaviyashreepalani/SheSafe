import React, { useState } from "react";
import { Grid, Delete, Divide, Minus, Plus, Sidebar } from "lucide-react";
import { motion } from "framer-motion";

const Calculator = ({ onUnlock }) => {
  const [display, setDisplay] = useState("0");
  const [tapCount, setTapCount] = useState(0);

  const handleNum = (num) => {
    setDisplay((prev) => (prev === "0" ? num : prev + num));
  };

  const handleClear = () => {
    setDisplay("0");
  };

  // ✅ Hidden Gesture: Tap "=" 5 times to unlock
  const handleEqual = () => {
    setTapCount((prev) => prev + 1);
    if (tapCount + 1 >= 5) {
      onUnlock();
    }
  };

  const buttons = [
    "C", "/", "*", "Del",
    "7", "8", "9", "-",
    "4", "5", "6", "+",
    "1", "2", "3", "=",
    "0", ".", "%", "AC"
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
      >
        {/* Display */}
        <div className="p-8 text-right bg-slate-900">
          <div className="text-slate-400 text-sm mb-1 uppercase tracking-widest font-bold">Standard Calculator</div>
          <div className="text-white text-6xl font-light overflow-hidden whitespace-nowrap">{display}</div>
        </div>

        {/* Buttons */}
        <div className="p-4 grid grid-cols-4 gap-3 bg-black">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => {
                if (btn === "=") handleEqual();
                else if (btn === "C" || btn === "AC") handleClear();
                else handleNum(btn);
              }}
              className={`h-20 rounded-2xl text-2xl font-medium transition-all active:scale-95 flex items-center justify-center
                ${btn === "=" ? "bg-primary text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}
                ${["/", "*", "-", "+"].includes(btn) ? "bg-slate-700 text-primary" : ""}
                ${btn === "C" || btn === "AC" ? "text-danger" : ""}
              `}
            >
              {btn === "Del" ? <Delete size={24} /> : btn}
            </button>
          ))}
        </div>
        
        <div className="p-4 text-center bg-slate-950">
          <p className="text-slate-600 text-xs tracking-tighter">© 2024 SecureCalc Utility v2.4.1</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Calculator;
