import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import RegistrationPage from './pages/RegistrationPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import Login from './pages/Login';
import ParentDashboard from './pages/ParentDashboard';
import CoachPage from './pages/CoachPage';
import StudentPage from './pages/StudentPage';
import AdminDashboard from './pages/AdminDashboard';
import PlaceholderPage from './pages/PlaceholderPage';
import StudentDatabase from './pages/admin/StudentDatabase';
import CoachRoster from './pages/admin/CoachRoster';
import FinanceReports from './pages/admin/FinanceReports';
import DemosPage from './pages/admin/DemosPage';
import BroadcastPage from './pages/admin/BroadcastPage';
import DirectChatPage from './pages/admin/DirectChatPage';
import SubscriptionPage from './pages/admin/SubscriptionPage';
import BatchChat from './pages/BatchChat';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Layout Wrappers
const ParentLayout = () => (
  <div className="layout-parent">
    <Header />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);

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
      <ErrorBoundary>
        <Routes>
          {/* Onboarding Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/select-role" element={<RoleSelectionPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/registration-success" element={<RegistrationSuccessPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book-demo" element={<PlaceholderPage title="Book a Free Demo" />} />

          {/* Parent Routes */}
          <Route element={<ParentLayout />}>
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/parent/chat" element={<BatchChat />} />
            <Route path="/parent/schedule" element={<PlaceholderPage title="My Schedule" />} />
            <Route path="/parent/assignments" element={<PlaceholderPage title="Assignments" />} />
            <Route path="/parent/payments" element={<PlaceholderPage title="Payment History" />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<StudentPage />} />

          {/* Coach Routes */}
          <Route element={<StaffLayout role="coach" />}>
            <Route path="/coach" element={<CoachPage />} />
            <Route path="/coach/students" element={<PlaceholderPage title="My Students" />} />
            <Route path="/coach/classes" element={<PlaceholderPage title="Live Classes" />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<StaffLayout role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentDatabase />} />
            <Route path="/admin/coaches" element={<CoachRoster />} />
            <Route path="/admin/demos" element={<DemosPage />} />
            <Route path="/admin/calendar" element={<PlaceholderPage title="Calendar Management" />} />
            <Route path="/admin/finances" element={<FinanceReports />} />
            <Route path="/admin/broadcast" element={<BroadcastPage />} />
            <Route path="/admin/messages" element={<DirectChatPage />} />
            <Route path="/admin/subscriptions" element={<SubscriptionPage />} />
          </Route>

        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
