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

// Components
import Navbar from './components/layout/Navbar';

// Animated Routes Component
const AnimatedRoutes = () => {
  const location = useLocation();

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = ['/login', '/register', '/select-role'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

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
