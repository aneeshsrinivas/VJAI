# Indian Chess Academy — Quick Overview

## Platform Summary
Online chess education platform connecting students with FIDE-rated coaches through live classes, interactive curriculum, and real-time learning dashboards.

---

## 🎯 Key Features

### Landing Page
- **Hero section** with cinematic video background and parallax scrolling
- **Live stats**: 500+ students trained, 15+ FIDE coaches, 98% tournament success rate
- **About section** with academy story and service cards
- **4 testimonials** from real students and parents
- **Flexible pricing** with billing options
- **AI Chatbot** (GPT-3.5 powered) answering questions about academy
- **FAQ timeline** with 5 expandable questions

### Pricing Page (`/pricing`)
- 2 subscription plans (Beginner $60/mo, Intermediate $70/mo)
- Billing toggle (1/3/4 months) with dynamic pricing
- Full feature comparison table
- Trust badges and guarantee banner
- **Sticky checkout bar** (appears on plan selection)

### Student Dashboard (`/parent`)
- **Welcome card** with skill progress tracker
- **Coach profile** with qualifications and contact
- **Weekly schedule** with merged live classes + demo sessions
- **Join Now button** (enabled 5 minutes before class)
- **Chess assignments** with submission tracking
- **Payment history** and subscription management
- Real-time batch chat with assigned coach

### Coach Dashboard (`/coach`)
- **Live stats** (active students, scheduled demos, batches)
- **Weekly calendar** (7-day grid with 6 time slots)
- **Schedule new classes** via interactive modal
- **Block availability** (students can't book blocked times)
- **Upload materials** (PDFs, PGN files) per batch
- **Student skill distribution** visualization
- Chat with assigned students in batches

### Admin Dashboard (`/admin`)
- **5 key metrics**: Total students, active coaches, pending demos, monthly revenue, conversion rate
- **Demo management** with status tracking (Pending/Confirmed/Completed/Converted/No Show)
- **Coach performance** leaderboard
- **PDF report export** (full academy statistics)
- **14 admin sub-pages** for managing students, coaches, finances, subscriptions, analytics
- **Broadcast system** for academy-wide announcements

---

## 🔄 User Flow

1. **Landing Page** → Browse courses, pricing, testimonials
2. **Register** → Choose role (Student/Coach), create account
3. **Book Demo** → FREE 30-minute assessment with FIDE coach
4. **Select Plan** → Choose Beginner/Intermediate subscription
5. **Payment** → Razorpay checkout
6. **Admin Approval** → Coach assignment
7. **Active** → Access full dashboard, live classes, assignments, progress tracking

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite, React Router v7
- **Database**: Firebase (Firestore, Auth, Storage)
- **Real-time**: Firestore listeners with `onSnapshot`
- **Chess**: chess.js + react-chessboard library
- **Animations**: Framer Motion, GSAP, Lenis
- **Video Classes**: Zoom integration
- **AI Chatbot**: GPT-3.5-turbo via OpenRouter API
- **Charts**: Recharts
- **PDF Reports**: jsPDF + AutoTable
- **Icons**: Lucide React

---

## 🔐 User Roles

| Role | Access | Key Pages |
|------|--------|-----------|
| **Student/Parent** | Schedule, assignments, chat, payments | `/parent/schedule`, `/parent/assignments`, `/parent/payments` |
| **Coach** | Schedule classes, manage batches, chat with students | `/coach/schedule`, `/coach/batches`, `/coach/students` |
| **Admin** | Full platform control, analytics, finances, approvals | `/admin/students`, `/admin/coaches`, `/admin/finances` |

---

## 📊 Database Collections

- `users` — All user profiles with roles
- `coaches` — Coach qualifications and batches
- `schedule` — Live classes (date, time, Zoom link)
- `demos` — Demo requests and outcomes
- `subscriptions` — Active student plans
- `batches` — Student groupings by level
- `messages` — Real-time chat messages
- `assignments` — Chess puzzles and submissions
- `broadcasts` — Admin announcements

---

## ✨ Unique Features

✓ **Real-time messaging** between coaches and students
✓ **Interactive weekly calendar** for coach scheduling
✓ **Auto-cleanup** of past classes from database
✓ **Join Now button** (enabled only 5 mins before class)
✓ **Free demo booking** with conversion tracking
✓ **AI chatbot** trained on full academy knowledge
✓ **Structured curriculum** (Beginner → Intermediate → Advanced)
✓ **Lichess integration** for rating sync
✓ **PDF reports** (full admin analytics)
✓ **Dark mode** across all dashboards
✓ **Responsive design** (desktop, tablet, mobile)

---

## 🚀 Ready for Demo

✅ Landing page with all sections
✅ Student dashboard and schedule
✅ Coach dashboard with calendar scheduling
✅ Admin dashboard with analytics
✅ Real-time messaging system
✅ AI chatbot (structured responses)
✅ Payment flow (Razorpay integrated)
✅ Dark mode across all pages

---

*Prepared for Indian Chess Academy platform presentation*
