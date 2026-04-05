const mongoose = require("mongoose");

const buddyRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    route: {
        start: { type: String, required: true },
        end: { type: String, required: true }
    },
    time: { type: Date, required: true },
    matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["Pending", "Matched", "Cancelled"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("BuddyRequest", buddyRequestSchema);
