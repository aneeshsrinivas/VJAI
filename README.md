# Indian Chess Academy - Operations Management Platform

A comprehensive, enterprise-grade operations management system designed specifically for modern chess academies. This platform replaces fragmented communication channels and manual tracking systems with a unified, role-based solution that streamlines student management, coaching operations, and administrative oversight.

**Live Application:** [https://vjai.onrender.com](https://vjai.onrender.com)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Installation](#installation)
7. [Configuration](#configuration)
8. [Development](#development)
9. [Deployment](#deployment)
10. [API Documentation](#api-documentation)
11. [Security](#security)
12. [Contributing](#contributing)
13. [License](#license)

---

## Overview

Indian Chess Academy (ICA) Platform addresses the operational challenges faced by chess training institutions:

- **Fragmented Communication:** Eliminates the need for multiple WhatsApp groups by providing centralized, role-appropriate messaging
- **Manual Record Keeping:** Replaces spreadsheet-based student tracking with a real-time database system
- **Payment Tracking:** Automates subscription management and payment history
- **Schedule Coordination:** Provides unified calendar views for classes, demos, and coaching sessions
- **Progress Monitoring:** Enables data-driven insights into student development and coach performance

The platform serves three distinct user roles, each with tailored interfaces and capabilities designed for their specific operational needs.

---

## Architecture

```
                                    +------------------+
                                    |   Firebase Auth  |
                                    |   + Firestore    |
                                    +--------+---------+
                                             |
                    +------------------------+------------------------+
                    |                        |                        |
            +-------v-------+        +-------v-------+        +-------v-------+
            |    Parent     |        |     Coach     |        |     Admin     |
            |   Dashboard   |        |   Dashboard   |        |   Dashboard   |
            +---------------+        +---------------+        +---------------+
                    |                        |                        |
                    +------------------------+------------------------+
                                             |
                                    +--------v---------+
                                    |   React Frontend |
                                    |   (Vite + SPA)   |
                                    +--------+---------+
                                             |
                                    +--------v---------+
                                    |  Express Backend |
                                    |  (Node.js API)   |
                                    +------------------+
```

### System Components

| Component | Purpose |
|-----------|---------|
| Firebase Authentication | Secure user authentication with role-based access control |
| Cloud Firestore | Real-time NoSQL database for application data |
| React SPA | Single-page application with client-side routing |
| Express API | RESTful backend for email services and server-side operations |
| Stockfish Engine | Chess analysis and puzzle validation |

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | Component-based UI framework |
| Vite | 5.x | Build tool and development server |
| React Router | 6.x | Client-side routing |
| Lucide React | Latest | Icon library |
| React Toastify | Latest | Notification system |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x+ | JavaScript runtime |
| Express | 4.x | Web application framework |
| Nodemailer | Latest | Email delivery service |
| CORS | Latest | Cross-origin resource sharing |

### Database and Authentication
| Service | Purpose |
|---------|---------|
| Firebase Authentication | User identity management |
| Cloud Firestore | Document-based data storage |
| Firebase Storage | File and media storage |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code quality and consistency |
| Git | Version control |
| npm | Package management |

---

## Features

### For Parents and Students

**Dashboard Overview**
- Personalized welcome with student progress summary
- Quick access to upcoming classes and assignments
- Real-time notifications for schedule changes

**Schedule Management**
- Weekly class calendar with session details
- Coach information and contact options
- Session history and attendance tracking

**Assignments and Progress**
- View assigned puzzles and homework
- Track completion status and deadlines
- Access learning resources and materials

**Payment and Subscription**
- View current subscription plan details
- Access payment history and invoices
- Subscription upgrade options

**Communication**
- Direct messaging with academy administration
- Batch group chat for class discussions
- Announcement notifications

### For Coaches

**Student Management**
- Complete roster of assigned students
- Individual student profiles with skill assessments
- Progress tracking and performance analytics

**Batch Operations**
- Manage multiple student batches
- Schedule classes and sessions
- Assign homework and puzzles to groups

**Teaching Tools**
- Puzzle creation and assignment system
- Game analysis integration
- Lesson planning resources

**Communication**
- Batch group messaging
- Private communication channels (contact details protected)
- Announcement broadcasting

### For Administrators

**Student Database**
- Comprehensive student records with search and filtering
- Enrollment management and status tracking
- Parent contact information management

**Coach Management**
- Coach roster with specialization details
- Performance metrics and student feedback
- Schedule and availability management

**Demo and Lead Management**
- Demo class booking system
- Lead tracking and follow-up management
- Conversion analytics

**Financial Operations**
- Revenue tracking and reporting
- Subscription management
- Payment processing oversight

**Analytics Dashboard**
- Enrollment trends and growth metrics
- Retention rate analysis
- Coach performance comparisons
- Financial projections

**System Administration**
- User account management
- Role assignment and permissions
- System configuration and settings

---

## Project Structure

```
VJAI/
├── public/                     # Static assets
│   └── favicon.ico
├── server/                     # Backend application
│   ├── server.js               # Express server entry point
│   ├── package.json            # Backend dependencies
│   └── .env                    # Backend environment variables
├── src/                        # Frontend application
│   ├── components/             # Reusable UI components
│   │   ├── features/           # Feature-specific components
│   │   ├── icons/              # Custom icon components
│   │   ├── layout/             # Layout components (Navbar, Sidebar)
│   │   └── ui/                 # Generic UI components (Button, Card, Input)
│   ├── context/                # React Context providers
│   │   └── AuthContext.jsx     # Authentication state management
│   ├── lib/                    # External service configurations
│   │   └── firebase.js         # Firebase initialization
│   ├── pages/                  # Page components
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── coach/              # Coach dashboard pages
│   │   ├── common/             # Shared pages (Chat, etc.)
│   │   └── parent/             # Parent dashboard pages
│   ├── services/               # API and data services
│   │   └── firestoreService.js # Firestore operations
│   ├── styles/                 # Global styles
│   ├── App.jsx                 # Root application component
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global CSS
├── .env                        # Frontend environment variables
├── .gitignore                  # Git ignore rules
├── cors.json                   # CORS configuration
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML entry point
├── package.json                # Frontend dependencies and scripts
├── vite.config.js              # Vite configuration
└── README.md                   # Project documentation
```

---

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git
- Firebase project with Authentication and Firestore enabled

### Clone Repository

```bash
git clone https://github.com/aneeshsrinivas/VJAI.git
cd VJAI
```

### Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

## Configuration

### Frontend Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_URL=/api
```

### Backend Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=3001

# Email Service Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_specific_password
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database in production mode
4. Configure security rules for your collections
5. Copy configuration values to your `.env` file

---

## Development

### Start Development Servers

Run both frontend and backend concurrently:

```bash
npm run dev
```

This starts:
- Frontend development server at `http://localhost:5173`
- Backend API server at `http://localhost:3001`

The Vite development server is configured to proxy `/api` requests to the backend server.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development servers (frontend + backend) |
| `npm run build` | Build production frontend bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code analysis |
| `npm start` | Start production server |

### Code Style

The project uses ESLint for code quality enforcement. Run linting with:

```bash
npm run lint
```

---

## Deployment

### Production Build

```bash
# Build the frontend application
npm run build

# The build output will be in the dist/ directory
```

### Render Deployment

The application is configured for deployment on Render:

1. Connect your GitHub repository to Render
2. Configure environment variables in Render dashboard
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`

### Environment Configuration for Production

Ensure all environment variables are configured in your deployment platform:

- Firebase configuration variables
- Email service credentials
- API URL configuration

---

## API Documentation

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send-email` | Send email notifications |
| GET | `/api/health` | Health check endpoint |

### Firestore Collections

| Collection | Purpose |
|------------|---------|
| `users` | User profiles and authentication data |
| `students` | Student records and enrollment information |
| `coaches` | Coach profiles and assignments |
| `batches` | Class batch configurations |
| `chats` | Chat room metadata |
| `messages` | Chat message content |
| `subscriptions` | User subscription records |
| `demos` | Demo class bookings |
| `assignments` | Homework and puzzle assignments |

---

## Security

### Authentication

- Firebase Authentication handles all user identity verification
- Session tokens are managed client-side with automatic refresh
- Role-based access control enforced at both client and database levels

### Data Protection

- Firestore security rules restrict data access based on user roles
- Sensitive information (payment details, contact info) is access-controlled
- Coach access to parent contact details is restricted by design

### Best Practices

- Environment variables used for all sensitive configuration
- CORS configured to restrict API access
- Input validation on all form submissions
- XSS protection through React's built-in escaping

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit changes with descriptive messages
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request with detailed description

### Code Standards

- Follow existing code style and patterns
- Write descriptive commit messages
- Test all changes locally before submitting
- Update documentation for significant changes

### Reporting Issues

Open an issue on GitHub with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and environment details

---

## License

This project is proprietary software developed for Indian Chess Academy. All rights reserved.

---

## Contact

For technical support or inquiries regarding the platform, please contact the development team through the official repository.

**Repository:** [https://github.com/aneeshsrinivas/VJAI](https://github.com/aneeshsrinivas/VJAI)

**Live Application:** [https://vjai.onrender.com](https://vjai.onrender.com)
