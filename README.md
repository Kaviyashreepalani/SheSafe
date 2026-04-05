# 🛡️ SheSafe – Women’s Safety Companion

SheSafe is a professional, production-ready safety application designed to provide women with a unified suite of tools for emergency response, trip tracking, and community-driven hazard reporting.

## 🚀 Key Features

### 1. 🚨 One-Tap SOS System
- Large, high-impact SOS trigger with a 5-second cancel countdown.
- Automatically sends live GPS coordinates via Real SMS to trusted contacts.
- **Discreet Mode**: A fully functional fake calculator UI. Tap the "=" button 5 times to reveal the real safety dashboard.

### 2. 📍 Live Trip Sharing
- Generate secure, public tracking links (no login required for viewers).
- Real-time location streaming via Socket.io.
- Automatic alerts if the user does not mark themselves safe by the ETA.

### 3. 🚗 Ride Verification
- Instantly log vehicle registration, driver details, and location.
- One-click notification to emergency contacts before starting a ride.

### 4. 👥 Buddy System
- Match with other users walking or traveling the same route at the same time.
- Integrated real-time chat for coordinated safety.

### 5. 🗺️ Community Alert Board
- Interactive Mapbox integration showing real-time hazard reports.
- Types: Poor Lighting, Harassment, Suspicious Activity, Safety Concern.
- **Expiry Logic**: Reports expire after 48 hours unless upvoted by the community.

### 6. 🧠 Safe Route Suggester
- Visual comparison between the **Fastest** and **Safest** routes.
- **Safety Score (0-100)**: Calculated dynamically based on nearby community alerts.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Mapbox GL.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io.
- **SMS**: Twilio SMS API.
- **Auth**: JWT (JSON Web Tokens).

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Kaviyashreepalani/SheSafe.git
cd SheSafe
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables (.env)

### Backend
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Connection String |
| `JWT_SECRET` | Secret for token signing |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio Phone Number |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_MAPBOX_TOKEN` | Mapbox Public Access Token |

---

## 🧠 Safety Score Formula
Our algorithm analyzes routes within a 500m radius of reported alerts:
- **Base Score**: 100
- **Harassment/Suspicious**: -15 points per alert
- **Safety Concern**: -10 points per alert
- **Upvoted Alert**: Penalty multiplied by 1.2 (Community verified)

---

## 🧪 Testing with Postman
- **Signup**: `POST /api/auth/signup`
- **Login**: `POST /api/auth/login`
- **SOS**: `POST /api/sos` (Header: `Authorization: Bearer <TOKEN>`)

---

## 📄 License
Proudly built for safety and community well-being.
