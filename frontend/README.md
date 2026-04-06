# 🛡️ SheSafe — Women's Safety Companion

> SDG 5 · Gender Equality | SDG 11 · Sustainable Cities & Communities

SheSafe is a production-grade women's safety web application built with React + Node.js. It works powerfully as a standalone app and gets smarter when paired with a wearable. A woman walking home late shouldn't have to think about triggering help.

---

## 🚀 Features

| Feature | Status |
|---|---|
| One-Tap SOS with 5-second cancel window | ✅ |
| Discreet Mode (fake calculator, press = 5× to exit) | ✅ |
| SOS location updates every 60 seconds | ✅ |
| Live Trip Sharing with public tracking link | ✅ |
| Auto-alert if not marked safe 10 min past ETA | ✅ |
| Ride Verification (vehicle logging + SMS) | ✅ |
| Buddy System with in-app chat | ✅ |
| Community Alert Board (48h TTL, upvote to extend) | ✅ |
| Safe Route Suggester with Safety Score (0–100) | ✅ |
| Real SMS via Twilio | ✅ |
| Real GPS via browser Geolocation API | ✅ |
| Socket.io real-time updates | ✅ |
| JWT authentication | ✅ |

---

## 🧠 Safety Score Formula

The Safety Score (0–100) rates how safe a route is based on active Community Alert Board pins within 200 metres of the route path.

### Algorithm

```
Base Score = 100

For each active alert within 200m of any route point:
  Penalty = base_penalty × upvote_multiplier

  Where base_penalty by incident type:
    harassment           → −15
    suspicious_activity  → −15
    unsafe_road          → −10
    poor_lighting        → −8
    other                → −5

  Where upvote_multiplier:
    alert has ≥1 upvote  → × 1.2  (community-verified)
    alert has 0 upvotes  → × 1.0

Final Score = max(0, min(100, round(100 − Σ penalties)))
```

### Example

A route passes through an area with:
- 1 harassment alert with 3 upvotes → −15 × 1.2 = −18
- 1 poor lighting alert (no upvotes) → −8 × 1.0 = −8

**Safety Score = 100 − 18 − 8 = 74** (Moderate)

Scores are computed client-side from the alerts fetched via `/api/alerts` and update automatically when new community alerts are posted while the user is viewing the route screen.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| Auth | JWT (7-day tokens) |
| SMS | Twilio |
| Maps | Mapbox GL (optional but recommended) |

---

## ⚙️ Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Twilio account
- Mapbox account (optional, for map views)

### 1. Clone
```bash
git clone https://github.com/Kaviyashreepalani/SheSafe.git
cd SheSafe
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, TWILIO_* in .env
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install  # Includes new @tailwindcss/postcss for v4 compatibility
cp .env.example .env
# Add VITE_MAPBOX_TOKEN to .env (optional)
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5000`

---

## 🔑 Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/shesafe
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

### Frontend `.env`
```
VITE_MAPBOX_TOKEN=pk.eyJ1...
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🗂️ API Reference

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register with emergency contacts |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PATCH | `/api/auth/update-contacts` | ✅ | Update emergency contacts |

### SOS
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/sos/trigger` | ✅ | Trigger SOS, SMS contacts |
| POST | `/api/sos/update-location` | ✅ | Update location every 60s |
| POST | `/api/sos/cancel` | ✅ | Cancel within 5s window |
| POST | `/api/sos/mark-safe` | ✅ | Resolve SOS |
| GET | `/api/sos/history` | ✅ | Get SOS log history |

### Trips
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/trips/start` | ✅ | Start trip, alert contacts |
| PATCH | `/api/trips/:id/location` | ✅ | Stream location update |
| PATCH | `/api/trips/:id/safe` | ✅ | Mark arrived safely |
| GET | `/api/trips/history` | ✅ | Trip history |
| GET | `/api/tracking/:id` | — | **Public** tracker (no auth) |

### Rides
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/rides` | ✅ | Log ride, SMS contacts |
| POST | `/api/rides/:id/reshare` | ✅ | Reshare ride details |
| GET | `/api/rides` | ✅ | Ride history |

### Alerts
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/alerts` | ✅ | Post community alert |
| GET | `/api/alerts` | — | Get active alerts (public) |
| POST | `/api/alerts/:id/upvote` | ✅ | Upvote & reset 48h TTL |

### Buddies
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/buddies/` | ✅ | Create/Update buddy request |
| GET | `/api/buddies/find` | ✅ | Find matching buddies on route |
| PUT | `/api/buddies/match/:id` | ✅ | Match with a buddy + chat |

---

## 🎭 Discreet Mode

Navigate to `/disguise` or **triple-tap the status bar** on the dashboard.

The app shows a **fully functional iOS-style calculator**. To return to the real dashboard, press the **= button 5 times consecutively**.

SOS continues running in the background while the disguise is active.

---

## ⚡ Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `sos-triggered` | Server → Client | SOS fired by a user |
| `sos-resolved` | Server → Client | User marked safe |
| `location-update` | Server → Client | Live trip location |
| `trip-completed` | Server → Client | Trip marked safe |
| `new-alert` | Server → Client | Community alert posted |
| `alert-upvoted` | Server → Client | Alert upvoted |
| `buddy-message` | Bidirectional | Buddy chat message |

---

## 📄 License

Built for safety and community well-being. SDG 5 · SDG 11.