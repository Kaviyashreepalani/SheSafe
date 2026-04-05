import React from "react";
import { ThumbsUp, MapPin, Clock } from "lucide-react";

const AlertCard = ({ alert, onUpvote }) => {
  const { type, description, location, upvotes, createdAt } = alert;

  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${type === "Harassment" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"}
            `}>
              {type}
            </span>
            <span className="text-slate-400 text-xs flex items-center">
              <Clock size={12} className="mr-1" />
              {new Date(createdAt).toLocaleTimeString()}
            </span>
          </div>
          <h3 className="text-slate-800 font-semibold mb-1">{description || "No description provided"}</h3>
          <p className="text-slate-500 text-sm flex items-center">
            <MapPin size={14} className="mr-1" />
            Near {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>
        
        <button
          onClick={() => onUpvote(alert._id)}
          className="flex flex-col items-center p-3 rounded-xl bg-slate-50 hover:bg-primary/10 hover:text-primary transition-colors border border-slate-100"
        >
          <ThumbsUp size={20} />
          <span className="text-xs font-bold mt-1">{upvotes}</span>
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
