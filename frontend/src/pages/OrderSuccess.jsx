import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, ArrowRight, User } from 'lucide-react';

const OrderSuccess = () => {
  const { orders, setRoute } = useContext(AppContext);

  // Retrieve the latest order
  const latestOrder = orders[0] || {
    id: "LMT-9082",
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    total: 2499,
    shippingAddress: "42 Golden Gate Heights, San Francisco, CA 94122",
    items: []
  };

  // Calculate estimated delivery date (7 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <motion.div 
      className="success-layout"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="success-icon-wrapper">
        <CheckCircle size={36} strokeWidth={1.5} />
      </div>

      <span className="uppercase-label">Transaction Complete</span>
      <h1 style={{ marginTop: '0.8rem' }}>Thank You For Your Patronage</h1>
      <p>
        Your order has been authorized and is now being packaged with absolute care in our local warehouse.
      </p>

      {/* Order Receipt Details */}
      <div className="success-details">
        <div className="success-row">
          <span>Order Confirmation ID</span>
          <span>{latestOrder.id}</span>
        </div>
        <div className="success-row">
          <span>Date Authorized</span>
          <span>{latestOrder.date}</span>
        </div>
        <div className="success-row">
          <span>Delivery Destination</span>
          <span style={{ maxWidth: '60%', textAlign: 'right', fontSize: '0.85rem' }}>
            {latestOrder.shippingAddress}
          </span>
        </div>
        <div className="success-row" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.8rem', marginTop: '0.8rem' }}>
          <span>Estimated Arrival</span>
          <span style={{ color: 'var(--accent-gold-dark)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={14} />
            <strong>{formattedDeliveryDate}</strong>
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          className="btn-primary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          onClick={() => setRoute('catalog')}
        >
          <span>Continue Curating</span>
          <ArrowRight size={16} />
        </button>

        <button 
          className="btn-secondary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          onClick={() => setRoute('profile')}
        >
          <User size={16} />
          <span>View My Account Portal</span>
        </button>
      </div>
    </motion.div>
  );
};

export default OrderSuccess;
