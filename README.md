# VJAI - Indian Chess Academy Operations Platform

**VJAI** is a strategic operations platform designed for modern chess academies. It replaces chaotic spreadsheets and WhatsApp groups with a unified, role-based system for Parents, Coaches, and Admins.

![Platform Screenshot](./src/assets/platform_preview.png)

## 🛠️ Technology Stack

We built this using a **"Purist" Performance Stack** to ensure maximum speed, control, and brand alignment without bloat.

- **Core Framework**: [React 18](https://react.dev/) (via [Vite](https://vitejs.dev/))
- **Routing**: `react-router-dom` v6
- **Styling**: **Vanilla CSS (CSS Modules approach)**
  - *Why?* To strictly enforce the "Strategic Elegance" design system using CSS Variables (`--color-deep-blue`, `--font-display`) without fighting framework defaults like Tailwind or Bootstrap.
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`)
- **Assets**: 
  - **Icons**: Pure Unicode Chess Symbols (♔ ♕ ♖ ♗ ♘ ♙) - *Zero external SVG libraries for faster load.*
  - **Fonts**: [Bodoni Moda](https://fonts.google.com/specimen/Bodoni+Moda) (Display) & [Figtree](https://fonts.google.com/specimen/Figtree) (Body).

---

## 🚀 Key Features Implemented

### 1. "Game-Changing" AI Modules (Hackathon Specials)
We integrated 5 conceptual AI widgets to demonstrate the platform's intelligence:
- **🤖 Demo Success Predictor**: Real-time conversion probability meter for Admin sales tracking.
- **⚡ Smart Batch Optimizer**: Algorithm to reorganize batches based on student rating variance.
- **🚨 Engagement Health Monitor**: Gamified "Churn Risk" score for every parent account.
- **♟️ Chess Skill Heatmap**: Visual 8x8 grid showing student proficiency (Opening/Middle/Endgame).
- **💰 Dynamic Pricing Optimizer**: AI suggestions for upsizing packages based on payment behavior.

### 2. Complete Onboarding Flow
- **Landing Page**: Premium brand introduction with role-based value props.
- **Role Selection**: Interactive grid for Parents, Coaches, and Admins.
- **Dynamic Registration**: Custom fields based on selected role (e.g., FIDE Rating for Coaches).
- **Success & Login**: Polished post-registration experience with auto-redirects.

### 3. Role-Based Dashboards
- **👑 Admin Command Center**: Central hub for financial reports (`/admin/finances`), student database (`/admin/students`), and funnel analytics.
- **♟️ Parent Portal**: Access to class schedules, payment history, and the **Batch Chat**.
- **♞ Coach Portal**: Tools for managing students and lesson plans.

### 4. Special Core Features
- **Batch Chat Interface**: A 3-way messaging system (Coach-Parent-Admin) with file sharing UI.
- **Demo Outcome Modal**: "Blocker" UI that forces admins to record results (Attended/No-Show) to prevent data leakage.

### 5. Design System Highlights
- **"Strategic Elegance" Theme**: Deep Blue (#003366), Ivory (#FFFEF3), and Warm Orange (#FC8A24).
- **Visuals**: Subtle 5% opacity "Chess Board" backgrounds, Rangoli-inspired borders, and "Knight Move" (L-shape) animations.

---

## 📂 Project Structure

```
src/
├── components/
│   ├── features/       # Complex widgets (Hackathon AI tools, Modals)
│   ├── layout/         # Sidebar, Header
│   └── ui/             # Reusable atoms (Button, Card, Input)
├── pages/
│   ├── admin/          # Admin sub-pages (Student Database, Finance)
│   ├── LandingPage.jsx
│   ├── Login.jsx
│   ├── RegistrationPage.jsx
│   └── ...
├── App.jsx             # Main routing configuration
├── index.css           # Global Design System (Variables, Reset, Utilities)
└── ...
```

## 🏁 How to Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
3. **Open Application**:
   Visit `http://localhost:5173`
