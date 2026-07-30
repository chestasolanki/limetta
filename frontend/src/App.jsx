import React, { useContext, useEffect, useState } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchOverlay from './components/SearchOverlay';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AboutContact from './pages/AboutContact';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import './App.css';

// The inner app shell that has access to AppContext
function AppContent() {
  const { route, cartOpen, searchOpen } = useContext(AppContext);
  const [toast, setToast] = useState('');

  // Listen to cart additions for brief visual feedback toast
  // Since we open the drawer, a toast might be redundant, but it's a premium touch.
  // We can let components trigger custom alerts if desired, or keep general notifications.

  // Render helper for routing
  const renderPage = () => {
    switch (route) {
      case 'home':
        return <Home key="home" />;
      case 'catalog':
        return <Products key="catalog" />;
      case 'details':
        return <ProductDetails key="details" />;
      case 'wishlist':
        return <Wishlist key="wishlist" />;
      case 'profile':
        return <Profile key="profile" />;
      case 'checkout':
        return <Checkout key="checkout" />;
      case 'success':
        return <OrderSuccess key="success" />;
      case 'about':
        return <AboutContact key="about" />;
      case 'auth':
        return <Auth key="auth" />;
      case 'admin':
        return <Admin key="admin" />;
      default:
        return <Home key="home" />;
    }
  };

  return (
    <div 
      className="app-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-color)'
      }}
    >
      {/* Sticky Header */}
      <Header />

      {/* Global Interactive Elements */}
      <CartDrawer />
      <SearchOverlay />

      {/* Main Pages Container */}
      <main style={{ flexGrow: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={route}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Timeless Footer */}
      <Footer />

      {/* Toast Alert Simulation */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            className="toast-msg"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <Check size={16} style={{ color: 'var(--accent-gold)' }} />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Global App wrapper housing the provider context
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
