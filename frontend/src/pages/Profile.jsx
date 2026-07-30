import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { LogOut, User, MapPin, Package, Heart, Edit2, Check, Shield, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, setUser, orders, fetchOrders, logout, setRoute, payPendingOrder, cancelUserOrder } = useContext(AppContext);

  // Statuses where order cancellation is allowed prior to shipment
  const cancellableStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed'];

  // Profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync edits with user context and fetch fresh orders from MongoDB on mount
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setAddress(user.address || '');
      fetchOrders();
    }
  }, [user]);

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center', minHeight: '75vh' }}>
        <User size={48} strokeWidth={1} style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Account Portal</h2>
        <p style={{ color: 'var(--text-body)', marginBottom: '2.5rem' }}>
          Please sign in to view your orders and manage your saved details.
        </p>
        <button className="btn-primary" onClick={() => setRoute('auth')}>
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleProfileSave = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      name,
      email,
      phone,
      address
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleLogout = async () => {
    await logout();
    setRoute('auth');
  };

  return (
    <motion.div 
      className="container profile-layout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '80vh' }}
    >
      {/* Left Sidebar Info Card */}
      <aside className="profile-card">
        <div className="profile-avatar-initial">
          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
        </div>
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-email">{user.email}</p>

        {user.role === 'admin' && (
          <div style={{ margin: '1rem 0', padding: '0.8rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--accent-gold)', borderRadius: '2px', textAlign: 'center' }}>
            <span className="uppercase-label" style={{ fontSize: '0.6rem', color: 'var(--accent-gold-dark)', display: 'block', marginBottom: '0.4rem' }}>Curator Status</span>
            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              onClick={() => setRoute('admin')}
            >
              <Shield size={14} />
              Showroom Control
            </button>
          </div>
        )}

        <ul className="profile-nav-list">
          <li>
            <button className="profile-nav-btn active">
              <Package size={16} />
              <span>Orders & Details</span>
            </button>
          </li>
          <li>
            <button className="profile-nav-btn" onClick={() => setRoute('wishlist')}>
              <Heart size={16} />
              <span>Wishlist Registry</span>
            </button>
          </li>
          <li>
            <button className="profile-nav-btn" onClick={handleLogout} style={{ color: '#B83B3B' }}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </li>
        </ul>
      </aside>

      {/* Right Content Area */}
      <div className="profile-content-area">
        {/* Personal Details Form */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.6rem', borderBottom: 'none', paddingBottom: 0, margin: 0 }}>Client Account Profile</h3>
            {!isEditing && (
              <button 
                className="btn-secondary" 
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={12} />
                Edit Profile
              </button>
            )}
          </div>

          {savedSuccess && (
            <div className="auth-success-alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Check size={16} />
              <span>Your profile edits have been safely recorded.</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleProfileSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label htmlFor="prof-name">Full Name</label>
                  <input 
                    type="text" 
                    id="prof-name"
                    className="form-control" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prof-email">Email Address</label>
                  <input 
                    type="email" 
                    id="prof-email"
                    className="form-control" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="prof-phone">Phone Number</label>
                <input 
                  type="text" 
                  id="prof-phone"
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="prof-addr">Primary Delivery Address</label>
                <textarea 
                  id="prof-addr"
                  className="form-control" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ padding: '0.7rem 1.8rem', fontSize: '0.75rem' }}>
                  Save Edits
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ padding: '0.7rem 1.8rem', fontSize: '0.75rem' }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', backgroundColor: 'var(--bg-color)', padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div>
                <p className="uppercase-label" style={{ fontSize: '0.65rem', marginBottom: '0.4rem' }}>Registry Name</p>
                <p style={{ fontWeight: '500', color: 'var(--text-heading)' }}>{user.name}</p>
                
                <p className="uppercase-label" style={{ fontSize: '0.65rem', marginTop: '1.2rem', marginBottom: '0.4rem' }}>Email Address</p>
                <p style={{ color: 'var(--text-body)' }}>{user.email}</p>

                <p className="uppercase-label" style={{ fontSize: '0.65rem', marginTop: '1.2rem', marginBottom: '0.4rem' }}>Phone</p>
                <p style={{ color: 'var(--text-body)' }}>{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="uppercase-label" style={{ fontSize: '0.65rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={12} /> Primary Delivery Address
                </p>
                <p style={{ color: 'var(--text-body)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {user.address || 'No primary delivery address specified.'}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Order History */}
        <section>
          <h3 className="profile-section-title">Order History</h3>
          {orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
              You have not placed any orders yet.
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  {/* Order header */}
                  <div className="order-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <div className="order-meta-item">
                      ID: <span>{order.id}</span>
                    </div>
                    <div className="order-meta-item">
                      Placed on: <span>{order.date}</span>
                    </div>
                    <div className="order-meta-item">
                      Total: <span>₹{order.total.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span className={`order-status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>

                      {/* Pay Now Button for Pending Payment */}
                      {order.paymentStatus === 'Pending' && order.status !== 'Cancelled' && (
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.7rem' }}
                          onClick={() => payPendingOrder(order.id || order._id, order.paymentMethod || 'razorpay', order.total)}
                        >
                          Pay Now
                        </button>
                      )}

                      {/* Cancel Order Button (Allowed prior to shipment) */}
                      {cancellableStatuses.includes(order.status) ? (
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.7rem', color: '#C53030', borderColor: '#FEB2B2' }}
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to cancel Order #${order.id}?`)) {
                              await cancelUserOrder(order.id || order._id);
                            }
                          }}
                        >
                          Cancel Order
                        </button>
                      ) : (
                        order.status !== 'Cancelled' && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Cancellation closed (Shipped)
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Order products list */}
                  <div className="order-card-body">
                    {order.items.map((item, idx) => {
                      const prodName = item.product?.name || 'Curated Object';
                      const prodImage = item.product?.image || '/images/placeholder.png';
                      const prodPrice = item.product?.price || 0;

                      return (
                        <div key={idx} className="order-item-row">
                          <div className="order-item-details">
                            <img 
                              src={prodImage} 
                              alt={prodName} 
                              className="order-item-img"
                            />
                            <div>
                              <h4 className="order-item-name">{prodName}</h4>
                              {item.selectedFinish && (
                                <span className="order-item-meta">Finish: {item.selectedFinish}</span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                            <div>Qty: {item.quantity}</div>
                            <div style={{ fontWeight: '500', color: 'var(--text-heading)', marginTop: '0.2rem' }}>
                              ₹{(prodPrice * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Visual Delivery Tracking Stepper */}
                    {(() => {
                      const statusMap = {
                        'Pending': 1,
                        'Confirmed': 1,
                        'Processing': 2,
                        'Packed': 3,
                        'Shipped': 4,
                        'Out for Delivery': 4,
                        'In Transit': 4,
                        'Delivered': 5,
                        'Cancelled': -1,
                        'Returned': -2
                      };
                      const stepIdx = statusMap[order.status] || 1;

                      if (stepIdx < 0) {
                        return (
                          <div style={{ margin: '1.2rem 0', padding: '1rem 1.2rem', backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '3px', color: '#C53030', fontSize: '0.85rem' }}>
                            <strong>Order Status Alert:</strong> This order has been {order.status.toLowerCase()}. Please contact Limetta Support if you have questions.
                          </div>
                        );
                      }

                      return (
                        <div style={{ margin: '1.2rem 0', padding: '1.2rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Truck size={16} style={{ color: 'var(--accent-gold-dark)' }} />
                              <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipment Timeline: {order.status}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold-dark)', fontWeight: '500' }}>
                              Waybill AWB: AWB-LMT-{String(order.id).slice(-8)}
                            </span>
                          </div>

                          {/* 5-Step Stepper bar */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem', position: 'relative', textAlign: 'center' }}>
                            {/* Step 1: Pending / Confirmed */}
                            <div style={{ opacity: stepIdx >= 1 ? 1 : 0.35 }}>
                              <div style={{ height: '4px', backgroundColor: stepIdx >= 1 ? 'var(--accent-gold)' : 'var(--border-color)', marginBottom: '0.5rem', borderRadius: '2px' }} />
                              <span style={{ fontSize: '0.7rem', fontWeight: '600', display: 'block', color: 'var(--text-heading)' }}>Pending</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Confirmed</span>
                            </div>

                            {/* Step 2: Processing */}
                            <div style={{ opacity: stepIdx >= 2 ? 1 : 0.35 }}>
                              <div style={{ height: '4px', backgroundColor: stepIdx >= 2 ? 'var(--accent-gold)' : 'var(--border-color)', marginBottom: '0.5rem', borderRadius: '2px' }} />
                              <span style={{ fontSize: '0.7rem', fontWeight: '600', display: 'block', color: 'var(--text-heading)' }}>Processing</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Woodwork</span>
                            </div>

                            {/* Step 3: Packed */}
                            <div style={{ opacity: stepIdx >= 3 ? 1 : 0.35 }}>
                              <div style={{ height: '4px', backgroundColor: stepIdx >= 3 ? 'var(--accent-gold)' : 'var(--border-color)', marginBottom: '0.5rem', borderRadius: '2px' }} />
                              <span style={{ fontSize: '0.7rem', fontWeight: '600', display: 'block', color: 'var(--text-heading)' }}>Packed</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Wooden Crate</span>
                            </div>

                            {/* Step 4: Shipped / Out for Delivery */}
                            <div style={{ opacity: stepIdx >= 4 ? 1 : 0.35 }}>
                              <div style={{ height: '4px', backgroundColor: stepIdx >= 4 ? 'var(--accent-gold)' : 'var(--border-color)', marginBottom: '0.5rem', borderRadius: '2px' }} />
                              <span style={{ fontSize: '0.7rem', fontWeight: '600', display: 'block', color: 'var(--text-heading)' }}>Shipped</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Out for Delivery</span>
                            </div>

                            {/* Step 5: Delivered */}
                            <div style={{ opacity: stepIdx >= 5 ? 1 : 0.35 }}>
                              <div style={{ height: '4px', backgroundColor: stepIdx >= 5 ? 'var(--accent-gold)' : 'var(--border-color)', marginBottom: '0.5rem', borderRadius: '2px' }} />
                              <span style={{ fontSize: '0.7rem', fontWeight: '600', display: 'block', color: 'var(--text-heading)' }}>Delivered</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Destination</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    
                    <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>Delivery Destination:</strong> {order.shippingAddress}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default Profile;
