import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, UserPlus, Phone, KeyRound, MapPin } from 'lucide-react';

const Auth = () => {
  const { login, signup, sendOTP, updateUserAddress, setRoute, forgotPasswordSendOTP, forgotPasswordReset } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('login'); // login | signup | forgot

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Address Onboarding inputs
  const [addressStep, setAddressStep] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  // OTP step state
  const [otpStep, setOtpStep] = useState(false);
  const [sentOtp, setSentOtp] = useState('');

  // Forgot password flow states
  const [forgotStep, setForgotStep] = useState(1); // 1: send otp, 2: verify & reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotSentOtp, setForgotSentOtp] = useState('');

  // validation state
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (forgotStep === 1) {
      if (!forgotEmail) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      setIsSuccess(true);
      try {
        const data = await forgotPasswordSendOTP(forgotEmail);
        setForgotSentOtp(data.otp || '');
        setForgotStep(2);
      } catch (err) {
        setErrorMsg(err.message || 'Failed to send verification OTP.');
      } finally {
        setIsSuccess(false);
      }
    } else {
      if (!forgotOtp || !newPassword || !confirmNewPassword) {
        setErrorMsg('Please fill in all password reset fields.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMsg('Confirmation password does not match.');
        return;
      }
      if (newPassword.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }
      setIsSuccess(true);
      try {
        const data = await forgotPasswordReset(forgotEmail, forgotOtp, newPassword);
        setIsSuccess(false);
        alert(data?.message || 'Password reset successfully. Please log in.');
        handleTabChange('login');
      } catch (err) {
        setErrorMsg(err.message || 'Failed to reset password.');
        setIsSuccess(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'forgot') {
      await handleForgotPasswordSubmit(e);
      return;
    }

    if (activeTab === 'login') {
      if (!email || !password) {
        setErrorMsg('Please enter both your email and password.');
        return;
      }

      setIsSuccess(true);
      try {
        await login(email, password);
      } catch (err) {
        setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
        setIsSuccess(false);
      }

    } else {
      if (!otpStep) {
        // Step 1: Send OTP
        if (!name || !email || !phone || !password || !confirmPassword) {
          setErrorMsg('Please fill in all registration fields.');
          return;
        }
        if (phone.trim().length < 10) {
          setErrorMsg('Please enter a valid mobile number (minimum 10 digits).');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Confirmation password does not match original password.');
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Security code must be at least 6 characters.');
          return;
        }

        setIsSuccess(true);
        try {
          const data = await sendOTP(email, phone);
          setSentOtp(data.otp || '');
          setOtpStep(true);
        } catch (err) {
          setErrorMsg(err.message || 'Failed to send verification OTP.');
        } finally {
          setIsSuccess(false);
        }
      } else {
        // Step 2: Verify OTP
        if (!otp) {
          setErrorMsg('Please enter the 6-digit OTP code.');
          return;
        }

        setIsSuccess(true);
        try {
          await signup(name, email, password, phone, otp);
          setIsSuccess(false);
          setOtpStep(false);
          setAddressStep(true); // Move to address onboarding
        } catch (err) {
          setErrorMsg(err.message || 'OTP verification or registration failed.');
          setIsSuccess(false);
        }
      }
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSuccess(true);

    try {
      await updateUserAddress({
        street,
        city,
        state: stateVal,
        postalCode,
        country
      });
      setRoute('profile');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record address credentials.');
      setIsSuccess(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setOtpStep(false);
    setAddressStep(false);
    setSentOtp('');
    setOtp('');
    setForgotStep(1);
    setForgotEmail('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotSentOtp('');
  };

  return (
    <motion.div 
      className="auth-layout"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Toggle between Sign in & Create account (hide when onboarding address or in forgot mode) */}
      {!addressStep && activeTab !== 'forgot' && (
        <div className="auth-header-toggle">
          <button 
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => handleTabChange('signup')}
          >
            Create Account
          </button>
        </div>
      )}

      {isSuccess ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <ShieldCheck size={48} strokeWidth={1} style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-heading)' }}>
            {activeTab === 'login' 
              ? 'Authenticating registry credentials...' 
              : addressStep
                ? 'Recording address credentials...'
                : otpStep 
                  ? 'Verifying OTP & creating account...' 
                  : 'Requesting verification OTP...'}
          </p>
        </div>
      ) : (
        <form onSubmit={addressStep ? handleAddressSubmit : handleSubmit}>
          
          {activeTab === 'forgot' ? (
            /* Forgot Password Flow */
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <KeyRound size={32} strokeWidth={1.5} style={{ color: 'var(--accent-gold)', marginBottom: '0.8rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  {forgotStep === 1 ? 'Forgot Password' : 'Reset Your Password'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {forgotStep === 1 
                    ? 'Enter your registered email address to receive a verification OTP.' 
                    : `Please enter the OTP sent to ${forgotEmail} and set your new password.`}
                </p>
              </div>

              {forgotStep === 1 ? (
                <>
                  <div className="form-group">
                    <label htmlFor="forgot-email">Registered Email Address</label>
                    <input 
                      type="email" 
                      id="forgot-email"
                      className="form-control" 
                      placeholder="your@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  {errorMsg && (
                    <p style={{ color: '#B83B3B', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{errorMsg}</p>
                  )}
                  <button type="submit" className="btn-primary auth-submit-btn" style={{ width: '100%', marginBottom: '1rem' }}>
                    Send Verification OTP
                  </button>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="forgot-otp">6-Digit Verification OTP</label>
                    <input 
                      type="text" 
                      id="forgot-otp"
                      className="form-control" 
                      placeholder="Enter OTP"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      required
                    />
                  </div>

                  {forgotSentOtp && (
                    <div style={{ 
                      marginTop: '-0.5rem', 
                      marginBottom: '1.5rem', 
                      padding: '0.8rem 1rem', 
                      backgroundColor: 'var(--accent-gold-light)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem', 
                      color: 'var(--accent-gold-dark)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>[Sandbox Fallback] Email credentials not set. Use code:</span>
                      <strong style={{ fontSize: '1rem', letterSpacing: '2px' }}>{forgotSentOtp}</strong>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="forgot-new-pass">New Security Code (Password)</label>
                    <input 
                      type="password" 
                      id="forgot-new-pass"
                      className="form-control" 
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgot-conf-pass">Confirm New Security Code</label>
                    <input 
                      type="password" 
                      id="forgot-conf-pass"
                      className="form-control" 
                      placeholder="Verify new password code"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  {errorMsg && (
                    <p style={{ color: '#B83B3B', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{errorMsg}</p>
                  )}

                  <button type="submit" className="btn-primary auth-submit-btn" style={{ width: '100%', marginBottom: '1rem' }}>
                    Reset Password & Sign In
                  </button>
                </>
              )}

              <button 
                type="button" 
                className="btn-secondary" 
                style={{ width: '100%', fontSize: '0.75rem', padding: '0.6rem' }} 
                onClick={() => handleTabChange('login')}
              >
                Back to Sign In
              </button>
            </div>
          ) : activeTab === 'signup' && addressStep ? (
            /* Address Onboarding UI */
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <MapPin size={32} strokeWidth={1.5} style={{ color: 'var(--accent-gold)', marginBottom: '0.8rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '0.5rem' }}>Delivery Address</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Please enter your delivery destination details to finalize your profile setup.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="auth-street">Street Address</label>
                <input 
                  type="text" 
                  id="auth-street"
                  className="form-control" 
                  placeholder="Suite, apartment, street address"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="auth-city">City</label>
                  <input 
                    type="text" 
                    id="auth-city"
                    className="form-control" 
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="auth-state">State / Province</label>
                  <input 
                    type="text" 
                    id="auth-state"
                    className="form-control" 
                    placeholder="State"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="auth-zip">Postal / ZIP Code</label>
                  <input 
                    type="text" 
                    id="auth-zip"
                    className="form-control" 
                    placeholder="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="auth-country">Country</label>
                  <input 
                    type="text" 
                    id="auth-country"
                    className="form-control" 
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <p style={{ color: '#B83B3B', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{errorMsg}</p>
              )}

              <button type="submit" className="btn-primary auth-submit-btn" style={{ width: '100%', marginBottom: '1.2rem' }}>
                Save & Complete Setup
              </button>

              <div style={{ textAlign: 'center' }}>
                <button 
                  type="button" 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => setRoute('profile')}
                >
                  Skip for Now
                </button>
              </div>
            </div>
          ) : activeTab === 'signup' && otpStep ? (
            /* OTP Verification UI */
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <KeyRound size={32} strokeWidth={1.5} style={{ color: 'var(--accent-gold)', marginBottom: '0.8rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '0.5rem' }}>Verify Email Address</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  A verification code has been sent to <strong>{email}</strong>.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="auth-otp">6-Digit Verification OTP</label>
                <input 
                  type="text" 
                  id="auth-otp"
                  className="form-control" 
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  required
                />
              </div>

              {sentOtp && (
                <div style={{ 
                  marginTop: '-0.5rem', 
                  marginBottom: '1.5rem', 
                  padding: '0.8rem 1rem', 
                  backgroundColor: 'var(--accent-gold-light)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem', 
                  color: 'var(--accent-gold-dark)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>[Sandbox Fallback] Email verification code:</span>
                  <strong style={{ fontSize: '1rem', letterSpacing: '2px' }}>{sentOtp}</strong>
                </div>
              )}

              {errorMsg && (
                <p style={{ color: '#B83B3B', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{errorMsg}</p>
              )}

              <button type="submit" className="btn-primary auth-submit-btn" style={{ width: '100%', marginBottom: '1rem' }}>
                Verify & Register
              </button>

              <button 
                type="button" 
                className="btn-secondary" 
                style={{ width: '100%', fontSize: '0.75rem', padding: '0.6rem' }} 
                onClick={() => { setOtpStep(false); setErrorMsg(''); }}
              >
                Go Back / Edit Details
              </button>
            </div>
          ) : (
            /* Regular Login or Signup Fields */
            <>
              {/* Sign Up Name Field */}
              {activeTab === 'signup' && (
                <div className="form-group">
                  <label htmlFor="auth-name">Your Full Name</label>
                  <input 
                    type="text" 
                    id="auth-name"
                    className="form-control" 
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <input 
                  type="email" 
                  id="auth-email"
                  className="form-control" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Sign Up Mobile Field */}
              {activeTab === 'signup' && (
                <div className="form-group">
                  <label htmlFor="auth-phone">Mobile Number</label>
                  <input 
                    type="tel" 
                    id="auth-phone"
                    className="form-control" 
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label htmlFor="auth-pass" style={{ margin: 0 }}>Security Code (Password)</label>
                  {activeTab === 'login' && (
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', color: 'var(--accent-gold-dark)', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                      onClick={() => handleTabChange('forgot')}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input 
                  type="password" 
                  id="auth-pass"
                  className="form-control" 
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {activeTab === 'signup' && (
                <div className="form-group">
                  <label htmlFor="auth-conf-pass">Confirm Security Code</label>
                  <input 
                    type="password" 
                    id="auth-conf-pass"
                    className="form-control" 
                    placeholder="Verify password code"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {errorMsg && (
                <p style={{ color: '#B83B3B', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{errorMsg}</p>
              )}

              <button type="submit" className="btn-primary auth-submit-btn">
                {activeTab === 'login' ? 'Enter Studio' : 'Send Verification OTP'}
              </button>
            </>
          )}
        </form>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.5', marginTop: '1.5rem' }}>
        By entering the Limetta Showroom, you consent to our terms of premium service and privacy policy guidelines.
      </p>
    </motion.div>
  );
};

export default Auth;
