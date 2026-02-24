import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import AccountsPage from './pages/admin/AccountsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import LiveAnalytics from './pages/admin/LiveAnalytics';
import AdminCoachApplications from './pages/admin/AdminCoachApplications';
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
import ParentNavbar from './components/layout/ParentNavbar';
import { AuthProvider } from './context/AuthContext';

// Layout Wrappers
const ParentLayout = () => {
  return (
    <div className="layout-parent">
      <ParentNavbar />
      <main className="main-content" style={{ padding: 0, marginTop: 0 }}>
        <Outlet />
      </main>
    </div>
  );
};

const StaffLayout = ({ role }) => (
  <div className="layout-staff" style={{ display: 'flex' }}>
    <Sidebar role={role} />
    <main className="main-content-staff" style={{ flex: 1, marginLeft: '260px', padding: '24px', width: 'calc(100% - 260px)' }}>
      <Outlet />
    </main>
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
          <Routes>
            {/* Onboarding Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/demo-confirmation" element={<PlaceholderPage title="Demo Request Submitted!" message="Thank you! Our team will contact you within 24 hours to schedule your free demo class." />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/select-role" element={<RoleSelectionPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/registration-success" element={<RegistrationSuccessPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/demo-booking" element={<DemoBooking />} />
            <Route path="/book-demo" element={<PlaceholderPage title="Book a Free Demo" />} />

            {/* Payment Routes */}
            <Route path="/pricing" element={<PlanSelection />} />
            <Route path="/payment/checkout" element={<PaymentCheckout />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />

            {/* Parent Routes */}
            <Route element={<ParentLayout />}>
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
            <Route element={<StaffLayout role="coach" />}>
              <Route path="/coach" element={<CoachPage />} />
              <Route path="/coach/students" element={<CoachStudents />} />
              <Route path="/coach/batches" element={<CoachBatches />} />
              <Route path="/coach/schedule" element={<CoachSchedule />} />
              <Route path="/coach/chat" element={<ChatPage userRole="COACH" />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<StaffLayout role="admin" />}>
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
              <Route path="/admin/accounts" element={<AccountsPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/live-analytics" element={<LiveAnalytics />} />
              <Route path="/admin/applications" element={<AdminCoachApplications />} />
            </Route>

          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
};

export default App;
