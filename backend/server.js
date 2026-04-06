const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/buddies', require('./routes/buddies'));
app.use('/api/rides', require('./routes/rides'));

// Public tracking route (no auth needed)
app.use('/api/tracking', require('./routes/tracking'));

// Socket.io for real-time features
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a trip tracking room
    socket.on('join-trip', (tripId) => {
        socket.join(`trip-${tripId}`);
        console.log(`Socket ${socket.id} joined trip-${tripId}`);
    });

    // Broadcast location update to trip watchers
    socket.on('location-update', ({ tripId, lat, lng }) => {
        socket.to(`trip-${tripId}`).emit('location-update', { lat, lng, timestamp: new Date() });
    });

    // Buddy chat
    socket.on('join-buddy-chat', (chatId) => {
        socket.join(`chat-${chatId}`);
    });

    socket.on('buddy-message', ({ chatId, message, senderId }) => {
        io.to(`chat-${chatId}`).emit('buddy-message', { message, senderId, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// Periodic Overdue Trip Checker (runs every 60s)
const Trip = require('./models/Trip');
const { sendTripOverdueAlert } = require('./services/smsService');

setInterval(async () => {
    try {
        const gracePeriod = 10 * 60 * 1000; // 10 minutes
        const overdueThreshold = new Date(Date.now() - gracePeriod);

        const overdueTrips = await Trip.find({
            status: 'active',
            expectedArrival: { $lt: overdueThreshold }
        }).populate('userId', 'name emergencyContacts');

        for (const trip of overdueTrips) {
            console.log(`⚠️ Overdue trip detected for ${trip.userId.name}. Destination: ${trip.destination}`);
            
            trip.status = 'overdue';
            await trip.save();

            const contacts = trip.userId.emergencyContacts.map(c => c.phone);
            if (contacts.length > 0) {
                await sendTripOverdueAlert(
                    contacts,
                    trip.userId.name,
                    trip.destination,
                    trip.currentLat,
                    trip.currentLng
                );
            }

            io.to(`trip-${trip.trackingId}`).emit('trip-overdue', { 
                tripId: trip._id, 
                userName: trip.userId.name 
            });
            io.emit('global-alert', { message: `Trip overdue: ${trip.userId.name}` });
        }
    } catch (err) {
        console.error('❌ Overdue checker error:', err);
    }
}, 60000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 SheSafe server running on port ${PORT}`);
});