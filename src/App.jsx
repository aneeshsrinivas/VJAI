import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login';
import SelectRolePage from './pages/RoleSelectionPage';
import RegisterPage from './pages/RegistrationPage';

import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PlanSelection from './pages/PlanSelection';

import DemoBooking from './pages/DemoBooking';
import CustomCursor from './components/animated/CustomCursor';
import PaymentPage from './pages/PaymentCheckout';
import PaymentSuccess from './pages/PaymentSuccess';
import PageTransition from './components/animations/PageTransition';

// Dashboard Pages
import AdminDashboard from './pages/AdminDashboard';
import CoachDashboard from './pages/CoachDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Admin Pages
import StudentDatabase from './pages/admin/StudentDatabase';
import CoachRoster from './pages/admin/CoachRoster';
import FinanceReports from './pages/admin/FinanceReports';
import DemosPage from './pages/admin/DemosPage';
import BroadcastPage from './pages/admin/BroadcastPage';
import SubscriptionPage from './pages/admin/SubscriptionPage';
import SubscriptionPlansManager from './pages/admin/SubscriptionPlansManager';
import AccountsPage from './pages/admin/AccountsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import LiveAnalytics from './pages/admin/LiveAnalytics';
import AdminCoachApplications from './pages/admin/AdminCoachApplications';
import SkillSetsPage from './pages/admin/SkillSetsPage';

// Coach Pages
import CoachPage from './pages/CoachPage';
import CoachStudents from './pages/coach/CoachStudents';
import CoachBatches from './pages/coach/CoachBatches';
import CoachSchedule from './pages/coach/CoachSchedule';

// Parent Pages
import ParentSchedule from './pages/parent/ParentSchedule';
import ParentAssignments from './pages/parent/ParentAssignments';
import ParentPayments from './pages/parent/ParentPayments';
import ParentSettings from './pages/parent/ParentSettings';

// Chat
import ChatPage from './pages/common/ChatPage';
import PlaceholderPage from './pages/PlaceholderPage';

// Components
import Navbar from './components/layout/Navbar';

// Animated Routes Component
const AnimatedRoutes = () => {
  const location = useLocation();

  // Check if current path starts with any dashboard prefix
  const isDashboardRoute = location.pathname.startsWith('/admin') || 
                            location.pathname.startsWith('/coach') || 
                            location.pathname.startsWith('/parent') || 
                            location.pathname.startsWith('/student');
  
  // Define routes where Navbar should be hidden (login, register, and all dashboard routes)
  const hideNavbarRoutes = [
    '/login', 
    '/register', 
    '/select-role'
  ];
  
  const showNavbar = !hideNavbarRoutes.includes(location.pathname) && !isDashboardRoute;

  return (
    <>
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/select-role" element={<PageTransition><SelectRolePage /></PageTransition>} />
          <Route path="/demo-booking" element={<PageTransition><DemoBooking /></PageTransition>} />
          <Route path="/payment" element={<PageTransition><PaymentPage /></PageTransition>} />
          <Route path="/payment-success" element={<PageTransition><PaymentSuccess /></PageTransition>} />

          {/* Secondary Pages */}
          <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactUs /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsAndConditions /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><PlanSelection /></PageTransition>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="/admin/students" element={<PageTransition><StudentDatabase /></PageTransition>} />
          <Route path="/admin/coaches" element={<PageTransition><CoachRoster /></PageTransition>} />
          <Route path="/admin/demos" element={<PageTransition><DemosPage /></PageTransition>} />
          <Route path="/admin/finances" element={<PageTransition><FinanceReports /></PageTransition>} />
          <Route path="/admin/broadcast" element={<PageTransition><BroadcastPage /></PageTransition>} />
          <Route path="/admin/subscriptions" element={<PageTransition><SubscriptionPage /></PageTransition>} />
          <Route path="/admin/subscription-plans" element={<PageTransition><SubscriptionPlansManager /></PageTransition>} />
          <Route path="/admin/accounts" element={<PageTransition><AccountsPage /></PageTransition>} />
          <Route path="/admin/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
          <Route path="/admin/live-analytics" element={<PageTransition><LiveAnalytics /></PageTransition>} />
          <Route path="/admin/applications" element={<PageTransition><AdminCoachApplications /></PageTransition>} />
          <Route path="/admin/skillsets" element={<PageTransition><SkillSetsPage /></PageTransition>} />
          <Route path="/admin/calendar" element={<PageTransition><PlaceholderPage title="Calendar Management" /></PageTransition>} />
          <Route path="/chat" element={<PageTransition><ChatPage userRole="ADMIN" /></PageTransition>} />

          {/* Coach Routes */}
          <Route path="/coach" element={<PageTransition><CoachPage /></PageTransition>} />
          <Route path="/coach/students" element={<PageTransition><CoachStudents /></PageTransition>} />
          <Route path="/coach/batches" element={<PageTransition><CoachBatches /></PageTransition>} />
          <Route path="/coach/schedule" element={<PageTransition><CoachSchedule /></PageTransition>} />
          <Route path="/coach/chat" element={<PageTransition><ChatPage userRole="COACH" /></PageTransition>} />

          {/* Parent Routes */}
          <Route path="/parent" element={<PageTransition><ParentDashboard /></PageTransition>} />
          <Route path="/parent/schedule" element={<PageTransition><ParentSchedule /></PageTransition>} />
          <Route path="/parent/assignments" element={<PageTransition><ParentAssignments /></PageTransition>} />
          <Route path="/parent/payments" element={<PageTransition><ParentPayments /></PageTransition>} />
          <Route path="/parent/settings" element={<PageTransition><ParentSettings /></PageTransition>} />

          {/* Student Routes */}
          <Route path="/student" element={<PageTransition><StudentDashboard /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

function App() {
  // Initialize Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
