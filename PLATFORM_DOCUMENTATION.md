# Indian Chess Academy (ICA) — Platform Documentation

## 1. Project Overview

**Indian Chess Academy** is a full-stack, real-time online chess education platform that connects students with FIDE-rated coaches through live classes, structured curriculum, and personalized learning paths. The platform supports three distinct user roles — **Student/Parent**, **Coach**, and **Admin** — each with dedicated dashboards and role-specific functionality.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7 |
| Backend/Database | Firebase (Firestore, Auth, Storage) |
| Real-time | Firestore `onSnapshot` listeners |
| Animations | Framer Motion, GSAP, Lenis (smooth scroll) |
| Chess Engine | chess.js, react-chessboard |
| Video Classes | Zoom Integration |
| AI Chatbot | OpenRouter API (GPT-3.5-turbo) with custom knowledge base |
| Charts | Recharts |
| PDF Reports | jsPDF + jsPDF-AutoTable |
| Icons | Lucide React |
| Notifications | React Toastify |
| Email | EmailJS |

---

## 2. Landing Page (Home)

The landing page is designed as a premium, single-page marketing site with cinematic aesthetics and smooth scroll transitions.

### Sections (Top to Bottom)

| # | Section | Description |
|---|---------|-------------|
| 1 | **Hero** | Full-screen background video (`chess-slow.mp4`) with parallax scrolling, headline *"Master Strategy. Dominate The Board."*, two magnetic CTAs: *Start Training Now* and *View Pricing* |
| 2 | **Stats** | 4 animated counter cards — 500+ Students Trained, 15+ FIDE-Rated Coaches, 98% Tournament Win Rate, 4.9 Student Rating |
| 3 | **About** | Split layout — Academy story (founded by Viraj Pandit & Nachiket Chitre), blockquote on personalized coaching, two interactive service cards: *Courseware* (opens modal with 3 course levels) and *Online Classes* (opens modal with class features) |
| 4 | **Testimonials** | 4 student/parent testimonials with star ratings and proof-driven heading *"Proof, Not Promises"* |
| 5 | **Pricing** | 2 glass-style plan cards — Beginner ($60/mo) and Intermediate ($70/mo) with billing options |
| 6 | **FAQ** | 5 expandable questions on a vertical timeline, paired with a video player for visual engagement |
| 7 | **CTA** | Final call-to-action section encouraging sign-up |
| 8 | **Footer** | Site navigation, contact information, social links |
| 9 | **AI Chatbot** | Floating chat widget (bottom-right) powered by GPT-3.5-turbo via OpenRouter, trained on complete academy knowledge base |

---

## 3. Pricing Page (`/pricing`)

A dedicated, dark-themed pricing page with full plan comparison:

- **Billing Toggle**: 1 Month / 3 Months (Save 11%) / 4 Months (Save 17%)
- **2 Plan Cards**: Beginner/Advanced Beginner ($60/mo) and Intermediate-I/II ($70/mo, "Most Popular" badge)
- **Trust Strip**: 4 badges — 100% Satisfaction, FIDE-Rated Coaches, 4 Sessions/Month, Free Demo First
- **Comparison Table**: 7-row feature comparison across both plans
- **Guarantee Bar**: Free demo, no commitment, cancel anytime
- **Sticky Checkout Bar**: Appears on plan selection, slides in from bottom via React Portal — shows selected plan with *"Continue to Checkout"* button

---

## 4. Authentication & User Roles

### Registration Flow
1. User visits `/select-role` to choose their role (Student/Parent or Coach)
2. Fills registration form at `/register` with personal details
3. Account created via Firebase Authentication
4. Firestore user document created at `users/{uid}`
5. Redirected to success page

### Login Flow
1. User signs in at `/login`
2. Firebase Auth validates credentials
3. Role fetched from Firestore document (priority) or detected from email
4. Redirected to role-specific dashboard (`/parent`, `/coach`, or `/admin`)

### Role Structure

| Role | Access | Dashboard |
|------|--------|-----------|
| Student/Parent (`customer`) | Student dashboard, schedule, assignments, chat, payments | `/parent` |
| Coach (`coach`) | Coach dashboard, schedule, batches, students, chat, attendance | `/coach` |
| Admin (`admin`) | Full platform access — students, coaches, demos, finances, analytics, broadcasts | `/admin` |

### Session Management
- Tab-level session isolation via `sessionStorage` prevents cross-tab user contamination
- Automatic role persistence across page reloads

---

## 5. Student/Parent Dashboard (`/parent`)

### Hero Section
- Dynamic greeting (Good Morning/Afternoon/Evening) with student name
- Progress card showing skills mastered (X/7), current level, and assigned batch
- Attendance card with circular progress indicator and performance status
- Action buttons: *Batch Chat* and *Request Review*

### Status-Based Banners
The dashboard adapts based on the student's enrollment status:
- **BLOCKED**: Full-screen restricted access overlay
- **PAYMENT_PENDING**: Payment action banner with plan selection
- **PAYMENT_SUCCESSFUL**: Awaiting admin approval banner
- **PENDING_COACH**: Coach assignment in progress banner
- **ACTIVE**: Full dashboard access

### Main Content

| Section | Description |
|---------|-------------|
| **Announcements** | Admin broadcasts displayed as notification cards |
| **Chess Assignments** | Interactive assignment cards with submission tracking, opens chess puzzle/assignment modal |
| **Quick Actions** | 4-card grid: Schedule, Assignments, Payments, Upgrade |
| **Coach Card** | Assigned coach profile — photo, name, title, rating, experience stats |
| **Subscription** | Active plan info, status, next billing date, manage link |

### Sub-Pages

| Route | Page | Features |
|-------|------|----------|
| `/parent/schedule` | **Weekly Schedule** | Merged view of live classes and demo sessions, chronological sort, Join Now button (enabled 5 min before class), auto-cleanup of past classes |
| `/parent/assignments` | **Assignments** | Full assignment list with submission capability |
| `/parent/payments` | **Payments & Billing** | Subscription details, payment history, transaction records |
| `/parent/chat` | **Batch Chat** | Real-time messaging with assigned coach |
| `/parent/settings` | **Settings** | Profile management |
| `/parent/lichess` | **Lichess Integration** | Lichess account connection and rating sync |

---

## 6. Coach Dashboard (`/coach`)

### Hero Section
- Animated background with floating chess piece shapes
- Welcome greeting with coach name
- Tagline: *"You're shaping the next generation of chess champions"*
- Quick action buttons: Schedule, Chat

### Stats Cards (4 Cards)

| Stat | Description |
|------|-------------|
| **Active Students** | Count of assigned students |
| **Scheduled Demos** | Upcoming demo count |
| **My Batches** | Active batch count |
| **Lichess Rating** | Integrated rating display |

### Main Content

| Section | Description |
|---------|-------------|
| **Schedule Overview** | Combined demo and class list sorted by date, Join button enabled 10 min before start |
| **Student Skill Distribution** | Visual skill bars (Beginner/Intermediate/Advanced) + student table with progress |
| **Upload Materials** | Drag-and-drop file upload (PDF, PGN, DOC, max 10MB) with batch selector |
| **My Batches** | Per-batch cards with level, student count, and action buttons (Puzzle, Material) |
| **Quick Actions** | Schedule, Batches, Chat, Students |

### Sub-Pages

| Route | Page | Features |
|-------|------|----------|
| `/coach/schedule` | **Weekly Calendar** | Interactive 7-day calendar grid with 6 time slots, week navigation, schedule new classes, block availability, class detail modals, auto-delete past classes |
| `/coach/students` | **Student Management** | View and manage assigned students |
| `/coach/batches` | **Batch Management** | Create and manage student batches |
| `/coach/chat` | **Chat** | Real-time messaging with students |
| `/coach/attendance` | **Attendance** | Track student attendance |
| `/coach/lichess` | **Lichess Integration** | Rating sync and game imports |

---

## 7. Admin Dashboard (`/admin`)

### Command Center Header
- Title: *"Command Center — Academy Operations Overview"*
- Broadcast button for academy-wide announcements
- Admin name badge

### Key Metrics (5 Cards)

| Metric | Source |
|--------|--------|
| **Total Students** | Live count from `users` collection |
| **Active Coaches** | Count from `coaches` collection |
| **Pending Demos** | Demos awaiting action |
| **Monthly Revenue** | Calculated from active subscriptions |
| **Conversion Rate** | Demo-to-enrollment percentage |

### Main Content

| Section | Description |
|---------|-------------|
| **Recent Demo Requests** | Latest 5 demos with status badges (Pending/Confirmed/Completed/Converted/No Show) |
| **Coach Performance** | Leaderboard of top coaches with ratings |
| **Quick Actions** | Manage Demos, Messages, Export PDF Report |
| **System Status** | Firebase connection status, real-time sync indicator |
| **Navigation** | Students Database, Subscriptions, Finance Reports, User Accounts |

### Admin Sub-Pages

| Route | Page | Features |
|-------|------|----------|
| `/admin/students` | **Student Database** | Full student roster with search and filters |
| `/admin/coaches` | **Coach Roster** | Coach management, applications, assignments |
| `/admin/demos` | **Demo Management** | Demo requests, scheduling, outcome tracking |
| `/admin/subscriptions` | **Subscriptions** | Plan management, student plan assignments |
| `/admin/subscription-plans` | **Plan Manager** | Create/edit subscription plans stored in Firestore |
| `/admin/finances` | **Finance Reports** | Revenue tracking, payment records |
| `/admin/broadcast` | **Broadcast** | Send announcements to all students |
| `/admin/messages` | **Admin Chat** | Direct messaging with coaches and students |
| `/admin/accounts` | **User Accounts** | Account management across all roles |
| `/admin/analytics` | **Analytics** | Platform usage and growth metrics |
| `/admin/live-analytics` | **Live Analytics** | Real-time platform monitoring |
| `/admin/applications` | **Coach Applications** | Review and approve coach applications |
| `/admin/skillsets` | **Skill Sets** | Manage curriculum skill tracking |
| `/admin/attendance` | **Attendance Report** | Academy-wide attendance tracking |

---

## 8. Key Platform Features

### 8.1 AI-Powered Chatbot
- **Model**: GPT-3.5-turbo via OpenRouter API
- **Knowledge Base**: Comprehensive academy information injected as system prompt including courses, pricing, coaches, FAQs, testimonials, and support info
- **Features**: Conversation history, structured responses with formatting, typing indicators, auto-scroll, new chat reset
- **Placement**: Landing page (floating widget, bottom-right)

### 8.2 Real-Time Messaging System
- Firebase Firestore-backed real-time chat
- Role-based chat rooms (Student ↔ Coach, Admin ↔ All)
- Batch-specific group messaging

### 8.3 Class Scheduling System
- Coaches schedule classes through an interactive weekly calendar
- Students see merged schedule (live classes + demos) sorted chronologically
- **Join Now** button enabled 5 minutes before class start time
- Classes conducted via Zoom with auto-populated meeting links
- Past classes automatically cleaned up from the database

### 8.4 Chess Assignment System
- Coaches create chess puzzles and assignments per batch
- Students submit solutions through interactive chess board (chess.js + react-chessboard)
- Submission tracking with status indicators

### 8.5 Demo Booking Flow
1. Prospective student books a free demo at `/demo-booking`
2. Demo request created in Firestore with status `PENDING`
3. Admin assigns a coach and confirms the demo
4. Coach conducts the demo via Zoom
5. Admin records outcome (Converted / Not Converted / No Show)
6. If converted → Student enrollment process begins

### 8.6 Payment & Subscription Flow
1. Student selects a plan on the Pricing page
2. Proceeds to checkout at `/payment/checkout`
3. Payment processed (Razorpay integration)
4. Subscription record created in Firestore
5. Student status updated to `PAYMENT_SUCCESSFUL`
6. Admin approves and assigns coach
7. Student gets full dashboard access

### 8.7 Lichess Integration
- Students and coaches can connect their Lichess accounts
- Automatic 24-hour rating sync
- Rating history and game import capabilities

### 8.8 PDF Report Generation
- Admin can export comprehensive PDF reports
- Includes: summary statistics, student tables, demo tables, subscription tables
- Generated client-side using jsPDF + AutoTable

### 8.9 Broadcast System
- Admin can send academy-wide announcements
- Broadcasts appear on all student dashboards in the Announcements section

---

## 9. End-to-End User Flow

```
┌─────────────────────────────────────────────────────────┐
│                    LANDING PAGE                          │
│  Hero → Stats → About → Testimonials → Pricing → FAQ    │
│                    ↓                                     │
│              [Start Training]                            │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│              ROLE SELECTION (/select-role)                │
│         Student/Parent  |  Coach Application             │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│              REGISTRATION (/register)                    │
│     Account Creation → Firebase Auth + Firestore         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│              DEMO BOOKING (/demo-booking)                │
│     Free 30-min assessment → Coach assignment            │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│              PLAN SELECTION (/pricing)                    │
│     Choose plan → Billing toggle → Checkout              │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│              PAYMENT (/payment/checkout)                  │
│     Razorpay → Subscription created → Await approval     │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│              ADMIN APPROVAL                              │
│     Admin reviews → Assigns coach → Activates student    │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│              ACTIVE STUDENT DASHBOARD (/parent)          │
│  Schedule │ Assignments │ Chat │ Payments │ Progress     │
│                                                          │
│  Join live classes → Complete assignments → Track growth  │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Database Structure (Firestore Collections)

| Collection | Purpose |
|-----------|---------|
| `users` | User profiles (all roles) with role, status, batch info |
| `coaches` | Coach-specific data — batches, ratings, qualifications |
| `demos` | Demo session requests and outcomes |
| `schedule` | Scheduled classes with time, batch, coach, meeting link |
| `subscriptions` | Student subscription plans and billing |
| `payments` | Payment transaction records |
| `batches` | Student groupings with level and coach assignment |
| `broadcasts` | Admin announcements |
| `messages` | Chat messages between users |
| `assignments` | Chess assignments and puzzle submissions |
| `materials` | Uploaded study materials (PDFs, PGNs) |

---

## 11. Security & Access Control

- Firebase Authentication for user identity
- Role-based access: Dashboards render content based on authenticated user's role
- Firestore security rules govern data access
- Session isolation prevents cross-tab contamination

---

## 12. Responsive Design

- Fully responsive across desktop, tablet, and mobile
- Dark mode support across all dashboards
- Smooth animations and page transitions via Framer Motion
- Cinematic hero section with video background and parallax effects

---

*Document prepared for Indian Chess Academy platform review.*
