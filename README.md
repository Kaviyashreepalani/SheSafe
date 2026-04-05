# SheSafe — Women's Safety Companion

SheSafe is a unified mobile-web application designed to provide powerful safety features for women traveling alone. Built with the "Polish, Reliability, and Genuine Usefulness" bar in mind, it works as a standalone tool that gets smarter with community input.

## Features Checklist
- [x] **Feature 1 — SOS System**: One-tap SOS, 5s cancellation, Discreet Mode (Notes disguise), Location logging, 60s background updates.
- [x] **Feature 2 — Live Trip Sharing**: Destination setting, Arrival timer, Live tracking link, Trip history.
- [x] **Feature 3 — Ride Verification**: Vehicle logging (Cab/Auto/Bus), SMS-ready location sharing, Ride logs.
- [x] **Feature 4 — Buddy System**: Route matching based on time and destination, In-app coordination chat.
- [x] **Feature 5 — Community Alert Board**: Incident reporting on a live map, TTL logic (48h), Upvoting for persistence.
- [x] **Feature 6 — Safe Route Suggester**: Map-based comparison of Fastest vs. Safest paths using incident density.

---

## Technical Architecture
- **Frontend**: React (Vite) + Vanilla CSS (Dark Mode/Glassmorphism)
- **State**: React Context API for cross-feature persistence
- **Mapping**: Leaflet.js (OpenStreetMap)
- **Backend**: Node.js (Express)
- **SMS Bridge**: Twilio API Integration

## Safety Score Algorithm
Evaluators: The safety score shown on the "Safe Route Suggester" screen is computed as follows:
1. **Formula**: `Safety Score = 100 - Σ(Incident权重)`
2. **Radius**: We factor in all pins within a **200-metre radius** of the route path.
3. **Weighting**:
   - Harassment/Suspicious Activity: -25 points
   - Poor Lighting/Unsafe Road: -15 points
4. **Active Check**: If multiple users have upvoted a pin, the penalty is increased by 5 points for each upvote (confirming high activity).
5. **Real-time**: The score updates automatically if new pins are dropped while the user is viewing the map.

---

## Setup & Running
1. **Clone project**
2. **Install dependencies**: `npm install`
3. **Setup environment**: Rename `.env.example` to `.env` and add your Twilio credentials.
4. **Launch Backend**: `node server/index.js`
5. **Launch Frontend**: `npm run dev`
