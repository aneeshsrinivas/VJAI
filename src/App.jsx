import React, { useEffect, useRef } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ParentNavbar from './components/layout/ParentNavbar';

// Page imports
import LandingPage from './pages/LandingPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import RegistrationPage from './pages/RegistrationPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import Login from './pages/Login';
import ParentDashboard from './pages/ParentDashboard';
import ParentSchedule from './pages/parent/ParentSchedule';
import ParentAssignments from './pages/parent/ParentAssignments';
import ParentPayments from './pages/parent/ParentPayments';
import ParentSettings from './pages/parent/ParentSettings';
import CoachPage from './pages/CoachPage';
import CoachBatches from './pages/coach/CoachBatches';
import CoachSchedule from './pages/coach/CoachSchedule';
import CoachStudents from './pages/coach/CoachStudents';
import StudentPage from './pages/StudentPage';
import AdminDashboard from './pages/AdminDashboard';
import PlaceholderPage from './pages/PlaceholderPage';
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
import ChatPage from './pages/common/ChatPage';
import PlanSelection from './pages/PlanSelection';
import PaymentCheckout from './pages/PaymentCheckout';
import PaymentSuccess from './pages/PaymentSuccess';
import DemoBooking from './pages/DemoBooking';
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Component imports
import Sidebar from './components/layout/Sidebar';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import PageTransition from './components/animations/PageTransition';

// Layout Components
const ParentLayout = () => {
  const { isDark } = useTheme();
  return (
    <div className={`layout-parent${isDark ? ' pd-dark' : ''}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ParentNavbar />
      <main className="main-content-parent" style={{ flex: 1, width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
};

const StaffLayout = ({ role }) => {
  const { isDark } = useTheme();
  return (
    <div className={`layout-staff${isDark ? ' staff-dark' : ''}`} style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar role={role} />
      <main className="main-content-staff" style={{ flex: 1, marginLeft: '260px', padding: '24px', width: 'calc(100% - 260px)' }}>
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  const location = useLocation();
  const lenisRef = useRef(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      syncTouch: false
    });
    lenisRef.current = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = ['/login', '/register', '/select-role', '/demo-booking'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname) &&
    !location.pathname.startsWith('/admin') &&
    !location.pathname.startsWith('/coach') &&
    !location.pathname.startsWith('/parent') &&
    !location.pathname.startsWith('/chat');

  return (
    <ErrorBoundary>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactUs /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsAndConditions /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/select-role" element={<PageTransition><RoleSelectionPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegistrationPage /></PageTransition>} />
          <Route path="/registration-success" element={<PageTransition><RegistrationSuccessPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/demo-booking" element={<PageTransition><DemoBooking /></PageTransition>} />
          <Route path="/demo-confirmation" element={<PageTransition><PlaceholderPage title="Demo Request Submitted!" message="Thank you! Our team will contact you within 24 hours to schedule your free demo class." /></PageTransition>} />
          <Route path="/book-demo" element={<PageTransition><PlaceholderPage title="Book a Free Demo" /></PageTransition>} />

          {/* Payment Routes */}
          <Route path="/pricing" element={<PageTransition><PlanSelection /></PageTransition>} />
          <Route path="/payment/checkout" element={<PageTransition><PaymentCheckout /></PageTransition>} />
          <Route path="/payment/success" element={<PageTransition><PaymentSuccess /></PageTransition>} />

          {/* Parent Routes */}
          <Route element={<ThemeProvider><ParentLayout /></ThemeProvider>}>
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/parent/chat" element={<ChatPage userRole="CUSTOMER" />} />
            <Route path="/parent/schedule" element={<ParentSchedule />} />
            <Route path="/parent/assignments" element={<ParentAssignments />} />
            <Route path="/parent/payments" element={<ParentPayments />} />
            <Route path="/parent/settings" element={<ParentSettings />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<StudentPage />} />

          {/* Coach Routes */}
          <Route element={<ThemeProvider><StaffLayout role="coach" /></ThemeProvider>}>
            <Route path="/coach" element={<CoachPage />} />
            <Route path="/coach/students" element={<CoachStudents />} />
            <Route path="/coach/batches" element={<CoachBatches />} />
            <Route path="/coach/schedule" element={<CoachSchedule />} />
            <Route path="/coach/chat" element={<ChatPage userRole="COACH" />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ThemeProvider><StaffLayout role="admin" /></ThemeProvider>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/chat" element={<ChatPage userRole="ADMIN" />} />
            <Route path="/admin/students" element={<StudentDatabase />} />
            <Route path="/admin/coaches" element={<CoachRoster />} />
            <Route path="/admin/demos" element={<DemosPage />} />
            <Route path="/admin/calendar" element={<PlaceholderPage title="Calendar Management" />} />
            <Route path="/admin/finances" element={<FinanceReports />} />
            <Route path="/admin/broadcast" element={<BroadcastPage />} />
            <Route path="/admin/messages" element={<ChatPage userRole="ADMIN" />} />
            <Route path="/admin/subscriptions" element={<SubscriptionPage />} />
            <Route path="/admin/subscription-plans" element={<SubscriptionPlansManager />} />
            <Route path="/admin/accounts" element={<AccountsPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/live-analytics" element={<LiveAnalytics />} />
            <Route path="/admin/applications" element={<AdminCoachApplications />} />
            <Route path="/admin/skillsets" element={<SkillSetsPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
