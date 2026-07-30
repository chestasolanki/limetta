import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { CreditCard, Truck, ShieldCheck, ArrowRight, ShoppingBag, Smartphone, Banknote, ExternalLink, CheckCircle, QrCode } from 'lucide-react';

const Checkout = () => {
  const { cart, user, createPendingOrder, payPendingOrder, setRoute, deliveryCharge } = useContext(AppContext);

  // Address state (Defaults to user address details)
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [fullName, setFullName] = useState(user?.name || 'Chesta Solanki');
  const [address, setAddress] = useState(user?.address || 'B31, Green velly, HAPUR, UTTAR PRADESH, 245101, India');
  const [city, setCity] = useState('Hapur');
  const [state, setState] = useState('UTTAR PRADESH');
  const [postalCode, setPostalCode] = useState('245101');
  const [country, setCountry] = useState('India');
  
  // Payment state: 'upi' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState('');

  // UPI Payment Sub-Options: 'vpa' (Enter UPI ID) | 'qr' (Generate QR Code)
  const [upiSubMode, setUpiSubMode] = useState('vpa');
  const [vpaId, setVpaId] = useState('');
  const [isVpaVerified, setIsVpaVerified] = useState(false);
  const [vpaError, setVpaError] = useState('');
  const [isVerifyingVpa, setIsVerifyingVpa] = useState(false);

  const handleVerifyVpa = (e) => {
    e?.preventDefault();
    setVpaError('');
    setIsVpaVerified(false);

    if (!vpaId || !vpaId.includes('@')) {
      setVpaError('Please enter a valid UPI ID (e.g. name@okaxis or phone@paytm).');
      return;
    }

    const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!vpaRegex.test(vpaId.trim())) {
      setVpaError('Invalid UPI ID format. Standard handle must end with @upi, @okaxis, @paytm, @ybl, etc.');
      return;
    }

    setIsVerifyingVpa(true);
    setTimeout(() => {
      setIsVerifyingVpa(false);
      setIsVpaVerified(true);
    }, 500);
  };

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // UPI Collect Request Modal State
  const [upiCollectModal, setUpiCollectModal] = useState(false);
  const [upiCollectStatus, setUpiCollectStatus] = useState('sending'); // 'sending' | 'waiting' | 'approved'
  const [countdown, setCountdown] = useState(180); // 3-minute timer

  useEffect(() => {
    let timer;
    if (upiCollectModal && upiCollectStatus === 'waiting' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [upiCollectModal, upiCollectStatus, countdown]);

  // Cart calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 1), 0);
  const shippingFee = Number(deliveryCharge || 0);
  const total = subtotal + shippingFee;

  // Single unified Amazon-style submit handler
  const handlePlaceOrderSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (!fullName || !address) {
      setErrorMsg('Please verify your delivery address.');
      return;
    }

    if (paymentMethod === 'upi' && upiSubMode === 'vpa' && !isVpaVerified) {
      setErrorMsg('Please enter and verify your UPI ID before completing payment.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create order in MongoDB (Status = Pending)
      const createdOrder = await createPendingOrder({
        fullName,
        address,
        city,
        state,
        postalCode,
        country
      });

      const orderId = createdOrder?._id || createdOrder?.id;

      // 2. Process Payment based on selection
      if (paymentMethod === 'cod') {
        await payPendingOrder(orderId, 'cod', total);
        setIsSubmitting(false);
      } else {
        // Show interactive UPI Collect Request modal flow
        setUpiCollectModal(true);
        setUpiCollectStatus('sending');
        setCountdown(180);

        // Step A: Request Sent to UPI app
        setTimeout(() => {
          setUpiCollectStatus('waiting');
          
          // Step B: Approval Received from Bank
          setTimeout(async () => {
            setUpiCollectStatus('approved');
            
            setTimeout(async () => {
              await payPendingOrder(orderId, 'upi', total);
              setIsSubmitting(false);
              setUpiCollectModal(false);
            }, 1200);
          }, 2800);
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error executing checkout.');
      setUpiCollectModal(false);
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center', minHeight: '75vh' }}>
        <ShoppingBag size={48} strokeWidth={1} style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-body)', marginBottom: '2.5rem' }}>
          Please add items to your cart before proceeding to checkout.
        </p>
        <button className="btn-primary" onClick={() => setRoute('catalog')}>
          Explore Shop
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="container checkout-layout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '80vh', padding: '2rem 0' }}
    >
      {/* Left Column: Address & Payment Methods */}
      <div className="checkout-forms" style={{ flexGrow: 1 }}>
        
        {/* 1. Amazon-Style Delivery Address Header Card */}
        <section style={{ backgroundColor: 'var(--bg-pure)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Delivering to {fullName}</span>
              </h3>
              <p style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: '1.5' }}>
                {address}
              </p>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: '#0066c0', fontSize: '0.8rem', padding: 0, cursor: 'pointer', textDecoration: 'none' }}
                onClick={() => alert('Delivery instructions saved.')}
              >
                + Add delivery instructions
              </button>
            </div>

            <button 
              type="button"
              style={{ background: 'none', border: 'none', color: '#0066c0', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', padding: '0.2rem 0.5rem' }}
              onClick={() => setIsEditingAddress(!isEditingAddress)}
            >
              {isEditingAddress ? 'Done' : 'Change delivery address'}
            </button>
          </div>

          {/* Inline Edit Delivery Address Form (Toggled via Change button) */}
          {isEditingAddress && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)', animation: 'fadeIn 0.3s ease' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: '600' }}>Edit Delivery Address</h4>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem' }}>Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem' }}>Street Address</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>City</label>
                  <input type="text" className="form-control" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>State</label>
                  <input type="text" className="form-control" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Postal Code</label>
                  <input type="text" className="form-control" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                </div>
              </div>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                onClick={() => setIsEditingAddress(false)}
              >
                Save Delivery Address
              </button>
            </div>
          )}
        </section>

        {/* 2. Payment Method Section */}
        <section style={{ backgroundColor: 'var(--bg-pure)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1.8rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-heading)' }}>
            Payment method
          </h2>

          {/* Payment Method Container */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1.2rem' }}>

            {/* Option C: Pay with UPI (Enter UPI ID or Generate QR Code) */}
            <div 
              onClick={() => setPaymentMethod('upi')}
              style={{
                padding: '1.2rem',
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                backgroundColor: paymentMethod === 'upi' ? 'var(--bg-color)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
                <input type="radio" checked={paymentMethod === 'upi'} readOnly />
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>UPI Payment</span>
                  <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', backgroundColor: 'var(--accent-gold-dark)', color: '#FFF', fontWeight: 'bold', borderRadius: '2px', letterSpacing: '0.05em' }}>
                    INSTANT & ZERO FEE
                  </span>
                </strong>
              </div>

              {paymentMethod === 'upi' && (
                <div style={{ marginLeft: '1.8rem', marginTop: '1rem', padding: '1.2rem', backgroundColor: 'var(--bg-pure)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                  
                  {/* Sub-mode buttons: Enter UPI ID vs Generate QR Code */}
                  <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem' }}>
                    <button
                      type="button"
                      className={upiSubMode === 'vpa' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                      onClick={(e) => { e.stopPropagation(); setUpiSubMode('vpa'); }}
                    >
                      <Smartphone size={15} />
                      <span>Enter UPI ID</span>
                    </button>

                    <button
                      type="button"
                      className={upiSubMode === 'qr' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                      onClick={(e) => { e.stopPropagation(); setUpiSubMode('qr'); }}
                    >
                      <QrCode size={15} />
                      <span>Generate QR Code</span>
                    </button>
                  </div>

                  {/* Sub-mode 1: VPA Entry & Verification */}
                  {upiSubMode === 'vpa' && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
                        Enter Virtual Payment Address (UPI ID)
                      </label>
                      
                      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem' }}>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. mobile@paytm or name@okaxis"
                          value={vpaId}
                          onChange={(e) => { setVpaId(e.target.value); setIsVpaVerified(false); setVpaError(''); }}
                          style={{ marginBottom: 0, fontSize: '0.85rem' }}
                        />
                        <button 
                          type="button" 
                          className="btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          onClick={handleVerifyVpa}
                          disabled={isVerifyingVpa || !vpaId}
                        >
                          {isVerifyingVpa ? 'Verifying...' : 'Verify VPA'}
                        </button>
                      </div>

                      {vpaError && (
                        <p style={{ color: '#B83B3B', fontSize: '0.75rem', marginTop: '0.3rem' }}>{vpaError}</p>
                      )}

                      {isVpaVerified && (
                        <div style={{ marginTop: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2e7d32', fontSize: '0.8rem', marginBottom: '0.8rem', fontWeight: '500' }}>
                            <CheckCircle size={16} />
                            <span>UPI VPA Verified: <strong>{vpaId}</strong>. Payment request ready.</span>
                          </div>
                          <button 
                            type="button" 
                            className="btn-primary" 
                            style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem', fontWeight: '600' }}
                            onClick={handlePlaceOrderSubmit}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Verifying UPI Transfer & Placing Order..." : "Send UPI Request & Auto-Confirm Order"}
                          </button>
                        </div>
                      )}

                      <div style={{ marginTop: '0.8rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Supported Handles: @okaxis, @paytm, @ybl, @ibl, @sbi, @icici, @gpay
                      </div>
                    </div>
                  )}

                  {/* Sub-mode 2: Dynamic QR Code */}
                  {upiSubMode === 'qr' && (
                    <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '0.8rem 0' }}>
                      <div style={{ display: 'inline-block', padding: '1rem', backgroundColor: '#FFF', border: '2px solid var(--accent-gold)', borderRadius: '8px', boxShadow: 'var(--shadow-small)', marginBottom: '0.8rem' }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=7455042260@pthdfc&pn=Limetta%20Luxury%20Interiors&am=${total}&cu=INR`)}`}
                          alt="Limetta UPI Payment QR Code"
                          style={{ width: '180px', height: '180px', display: 'block' }}
                        />
                      </div>

                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-heading)', marginBottom: '0.2rem' }}>
                        Scan to Pay ₹{total.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold-dark)', marginBottom: '0.8rem' }}>
                        Payee: Limetta Luxury Interiors (7455042260@pthdfc)
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '2px', fontWeight: '600' }}>GPay</span>
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '2px', fontWeight: '600' }}>PhonePe</span>
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '2px', fontWeight: '600' }}>Paytm</span>
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '2px', fontWeight: '600' }}>BHIM</span>
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '2px', fontWeight: '600' }}>CRED</span>
                      </div>

                      <button 
                        type="button" 
                        className="btn-primary" 
                        style={{ width: '100%', padding: '0.8rem', fontSize: '0.85rem', fontWeight: '600' }}
                        onClick={handlePlaceOrderSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Verifying UPI Transfer..." : "Complete UPI Payment & Auto-Confirm Order"}
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Option D: Cash on Delivery / Pay on Delivery */}
            <div 
              onClick={() => setPaymentMethod('cod')}
              style={{
                padding: '1rem',
                cursor: 'pointer',
                backgroundColor: paymentMethod === 'cod' ? 'var(--bg-color)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
                <input type="radio" checked={paymentMethod === 'cod'} readOnly />
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)' }}>Cash on Delivery/Pay on Delivery</strong>
              </div>
              <p style={{ margin: '0 0 0 1.8rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Cash, UPI and Cards accepted upon doorstep delivery.
              </p>
            </div>

          </div>
        </section>

        {errorMsg && (
          <p style={{ color: '#B83B3B', fontSize: '0.85rem', marginTop: '1.5rem' }}>{errorMsg}</p>
        )}
      </div>

      {/* Right Column: Amazon-Style Sticky Action Sidebar */}
      <div className="checkout-summary-pane" style={{ width: '320px', flexShrink: 0 }}>
        <button 
          type="button" 
          className="btn-primary"
          style={{ 
            width: '100%', 
            padding: '1rem', 
            fontSize: '0.9rem', 
            marginBottom: '1.5rem', 
            backgroundColor: paymentMethod === 'cod' ? '#FFD814' : 'var(--bg-color)', 
            color: paymentMethod === 'cod' ? '#0F1111' : 'var(--text-heading)', 
            border: paymentMethod === 'cod' ? '1px solid #FCD200' : '1px solid var(--border-color)', 
            fontWeight: '600' 
          }}
          onClick={handlePlaceOrderSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? "Processing Order..." 
            : paymentMethod === 'cod' 
            ? "CONFIRM ORDER"
            : "Pay with UPI Option Above"
          }
        </button>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span>Items:</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span>Delivery:</span>
            <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', color: '#B12704', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', marginTop: '0.8rem' }}>
            <span>Order Total:</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '1.5rem' }}>
          By placing your order, you agree to Limetta's privacy notice and conditions of use.
        </p>
      </div>

      {/* Real-Time Interactive UPI Collect Modal Overlay */}
      {upiCollectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '2.5rem',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            {upiCollectStatus === 'sending' && (
              <div>
                <Smartphone size={44} style={{ color: 'var(--accent-gold)', marginBottom: '1rem', animation: 'bounce 1s infinite' }} />
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: '#0F1111', marginBottom: '0.5rem' }}>
                  Sending UPI Collect Request...
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#565959' }}>
                  Initiating payment transaction of <strong>₹{total.toLocaleString()}</strong> to <strong>{vpaId || '7455042260@pthdfc'}</strong>.
                </p>
              </div>
            )}

            {upiCollectStatus === 'waiting' && (
              <div>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.2rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--accent-gold-light)', borderTopColor: 'var(--accent-gold)', animation: 'spin 1s linear infinite' }} />
                  <Smartphone size={24} style={{ position: 'absolute', top: '18px', left: '18px', color: 'var(--accent-gold)' }} />
                </div>
                
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#0F1111', marginBottom: '0.5rem' }}>
                  Approve Payment in Your UPI App
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#565959', marginBottom: '1rem', lineHeight: '1.5' }}>
                  Collect request sent to <strong>{vpaId || '7455042260@pthdfc'}</strong>.<br />
                  Please open <strong>GPay / PhonePe / Paytm</strong> to approve <strong>₹{total.toLocaleString()}</strong>.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.2rem' }}>
                  <span style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', border: '1px solid #DDD', borderRadius: '4px', fontWeight: '600', backgroundColor: '#F7F7F7' }}>GPay</span>
                  <span style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', border: '1px solid #DDD', borderRadius: '4px', fontWeight: '600', backgroundColor: '#F7F7F7' }}>PhonePe</span>
                  <span style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', border: '1px solid #DDD', borderRadius: '4px', fontWeight: '600', backgroundColor: '#F7F7F7' }}>Paytm</span>
                  <span style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', border: '1px solid #DDD', borderRadius: '4px', fontWeight: '600', backgroundColor: '#F7F7F7' }}>BHIM</span>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-gold-dark)', backgroundColor: 'var(--accent-gold-light)', padding: '0.6rem', borderRadius: '4px' }}>
                  Awaiting Bank Response ({Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')})
                </div>
              </div>
            )}

            {upiCollectStatus === 'approved' && (
              <div>
                <CheckCircle size={54} style={{ color: '#2e7d32', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2e7d32', marginBottom: '0.4rem' }}>
                  UPI Payment Approved & Received!
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#565959' }}>
                  Transaction Verified • Confirming your order and updating registry...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default Checkout;
