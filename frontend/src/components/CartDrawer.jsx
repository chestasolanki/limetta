import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer = () => {
  const { 
    cartOpen, 
    setCartOpen, 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    setRoute 
  } = useContext(AppContext);

  const subtotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 1), 0);
  const shippingThreshold = 15000;
  const shippingFee = subtotal >= shippingThreshold ? 0 : 450;
  const total = subtotal + shippingFee;

  const handleCheckoutClick = () => {
    setCartOpen(false);
    setRoute('checkout');
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="cart-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer Panel */}
          <motion.div 
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.4 }}
          >
            <div className="cart-drawer-header">
              <h2>My Cart</h2>
              <button className="close-btn" onClick={() => setCartOpen(false)} aria-label="Close Cart">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <div className="cart-items-list">
              {cart.length === 0 ? (
                <div className="empty-cart-message">
                  <ShoppingBag size={48} strokeWidth={1} style={{ color: '#C5A880', marginBottom: '1.5rem' }} />
                  <p>Your shopping cart is empty</p>
                  <button 
                    className="btn-secondary" 
                    onClick={() => { setCartOpen(false); setRoute('catalog'); }}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const prodId = item.product?.id || item.product?._id || 'unknown';
                  const prodName = item.product?.name || 'Curated Object';
                  const prodImage = item.product?.image || '/images/placeholder.png';
                  const prodPrice = item.product?.price || 0;

                  return (
                    <div key={`${prodId}-${item.selectedFinish}`} className="cart-item">
                      <img 
                        src={prodImage} 
                        alt={prodName} 
                        className="cart-item-img" 
                      />
                      <div className="cart-item-info">
                        <div className="cart-item-title">{prodName}</div>
                        {item.selectedFinish && (
                          <div className="cart-item-finish">Finish: {item.selectedFinish}</div>
                        )}
                        <div className="cart-item-price">₹{prodPrice.toLocaleString()}</div>
                        
                        <div className="cart-item-actions">
                          {/* Quantity Counter */}
                          <div className="qty-actions" style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                            <button 
                              className="qty-btn"
                              onClick={() => updateCartQuantity(prodId, item.selectedFinish, item.quantity - 1)}
                              aria-label="Decrease Quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="qty-val">{item.quantity}</span>
                            <button 
                              className="qty-btn"
                              onClick={() => updateCartQuantity(prodId, item.selectedFinish, item.quantity + 1)}
                              aria-label="Increase Quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Trash button */}
                          <button 
                            onClick={() => removeFromCart(prodId, item.selectedFinish)}
                            style={{ color: '#888' }}
                            aria-label="Remove Item"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? "Complimentary" : `₹${shippingFee}`}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '1rem', fontStyle: 'italic' }}>
                  {subtotal >= shippingThreshold 
                    ? "Your order qualifies for complimentary premium white-glove shipping." 
                    : `Add ₹${(shippingThreshold - subtotal).toLocaleString()} more to unlock free white-glove shipping.`}
                </p>

                <button className="btn-primary cart-checkout-btn" onClick={handleCheckoutClick}>
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
