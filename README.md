# VJAI - Indian Chess Academy Operations Platform

**VJAI** is a strategic operations platform designed for modern chess academies. It replaces chaotic spreadsheets and WhatsApp groups with a unified, role-based system for Parents, Coaches, and Admins.

## 🛠️ Technology Stack

We built this using a **"Purist" Performance Stack** to ensure maximum speed, control, and brand alignment without bloat.

- **Frontend**: [React 18](https://react.dev/) (via [Vite](https://vitejs.dev/))
- **Backend**: Node.js & Express
- **Routing**: `react-router-dom` v6
- **Styling**: **Vanilla CSS (CSS Modules approach)**
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`)
- **Assets**: Pure Unicode Chess Symbols (♔ ♕ ♖ ♗ ♘ ♙)

---

## 🚀 Key Features

### 1. Complete Onboarding Flow
- Landing Page & Role Selection
- Dynamic Registration
- Role-based value propositions

### 2. Role-Based Dashboards
- **👑 Admin**: Financial reports, student database, funnel analytics.
- **♟️ Parent**: Class schedules, payment history, assignments.
- **♞ Coach**: Student management, lesson plans, puzzle assignment.

### 3. Integrated Chess Tools
- **Stockfish Engine**: Server-side chess analysis.
- **Puzzle Editor**: Coaches can create and assign puzzles.
- **Game Replay**: Review student games.

---

## 📂 Project Structure

```bash
VJAI/
 ├── server/             # Backend (Node/Express)
 │   ├── server.js       # Entry point
 │   ├── .env            # Backend config (PORT, EMAILS)
 │   └── package.json    # Backend dependencies
 ├── src/                # Frontend (React)
 ├── dist/               # Production build output
 ├── package.json        # Root config & scripts
 ├── vite.config.js      # Vite config (Proxy setup)
 └── README.md
```

---

## 🏁 How to Run & Deploy

### 1. Setup Environment Variables

**Backend (`server/.env`):**
```env
PORT=3001
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

**Frontend (`.env`):**
```env
VITE_API_URL=/api  # Production (Relative path)
# OR
VITE_API_URL=http://localhost:3001 # Local Dev (if not using proxy)
```

### 2. Install Dependencies

You need to install dependencies for **both** folders:

```bash
# Root (Frontend)
npm install

# Backend
cd server
npm install
cd ..
```

### 3. Development (Run Both)

Run frontend and backend concurrently with a single command:

```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- API Proxy: configured in `vite.config.js` to forward `/api` -> `3001`

### 4. Production Build

To build the React app and have the backend serve it:

```bash
# Build Frontend
npm run build

# Start Production Server
npm start
```
The application will be live at `[http://localhost:3001](https://vjai.onrender.com/)`.
