import React, { useState, useEffect, useRef } from "react";
import { Send, User, MessageCircle } from "lucide-react";
import { io } from "socket.io-client";

const ChatBox = ({ tripId, userName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    
    socketRef.current.emit("join-trip", tripId);

    socketRef.current.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socketRef.current.disconnect();
  }, [tripId]);

  const handleSend = () => {
    if (!input.trim()) return;

    const msg = {
      tripId,
      sender: userName,
      text: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    socketRef.current.emit("send-message", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-primary text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <MessageCircle size={20} />
        </div>
        <div>
          <h3 className="font-bold">Buddy Chat</h3>
          <p className="text-xs text-white/70">Connected for Trip: {tripId.slice(-6)}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === userName ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm
                ${msg.sender === userName ? "bg-primary text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-200"}
              `}
            >
              <div className="text-[10px] opacity-70 mb-1 font-bold uppercase">{msg.sender}</div>
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 bg-primary hover:bg-secondary text-white rounded-full flex items-center justify-center transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
