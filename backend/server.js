require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./config/db");

// ✅ Initialize DB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ✅ Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/sos", require("./routes/sos"));
app.use("/api/trips", require("./routes/trips"));
app.use("/api/alerts", require("./routes/alerts"));
app.use("/api/buddies", require("./routes/buddies"));

// ✅ Socket.io logic (Basic setup)
io.on("connection", (socket) => {
    console.log("⚡ A user connected:", socket.id);

    socket.on("join-trip", (tripId) => {
        socket.join(tripId);
        console.log(`📍 User joined trip: ${tripId}`);
    });

    socket.on("update-location", (data) => {
        const { tripId, latitude, longitude } = data;
        io.to(tripId).emit("location-updated", { latitude, longitude });
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected");
    });
});

// ✅ Test route
app.get("/", (req, res) => {
    res.send("SheSafe Backend Running 🚀");
});

// ✅ Error handling
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({ error: "Something went wrong" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

