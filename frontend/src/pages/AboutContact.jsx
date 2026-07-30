import React, { useState, useContext } from 'react';
import { Mail, Send, User, MessageSquare } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

const AboutContact = () => {
  const { addInquiry } = useContext(AppContext);
  
  // Feedback & Question Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Ask a Question'); // Ask a Question | Submit Feedback
  const [message, setMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    // Add to global admin queue
    addInquiry({ 
      name, 
      email, 
      phone: 'Not provided', 
      subject: inquiryType, 
      message 
    });
    
    setFormSubmitted(true);
    setName('');
    setEmail('');
    setInquiryType('Ask a Question');
    setMessage('');
    
    setTimeout(() => setFormSubmitted(false), 6000);
  };

  // Curated FAQ Registry
  const faqs = [
    {
      id: 1,
      q: "How do I place an order?",
      a: "Select your desired object, choose custom finish options if available, add to cart, and follow our secured checkout. For customized showroom layouts or custom sizing, request a consultation."
    },
    {
      id: 2,
      q: "Do your products come with a warranty?",
      a: "Yes. All our custom woodwork and interior objects are backed by a comprehensive 5-year structural warranty against manufacturing defects."
    },
    {
      id: 3,
      q: "Do you deliver across India?",
      a: "Yes. We coordinate insured shipping and delivery across all major cities in India, ensuring secure wooden-crate transit and safe installation."
    },
    {
      id: 4,
      q: "Do you offer custom furniture or decor?",
      a: "Yes. We specialize in bespoke space planning, built-in cabinetry, and modular sizing. Contact our design studio to request details."
    },
    {
      id: 5,
      q: "Can I choose custom colors, fabrics, or finishes?",
      a: "Absolutely. We offer a curated selection of premium bouclé and velvet fabrics, marble surfaces, and wood veneer finishes to suit your space."
    },
    {
      id: 6,
      q: "Is it safe to make payments on your website?",
      a: "Yes. We use industry-standard 256-bit SSL encryption to ensure your transactions and payment details remain completely secure."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Brand Manifesto Hero */}
      <section className="about-hero-section">
        <div className="container">
          <div className="about-manifesto-box">
            <span className="uppercase-label">The Studio Narrative</span>
            <h1>Sincerity in Material.<br />Grace in Form.</h1>
            <p>
              Limetta Interiors is a design-driven interior and contracting firm crafting refined, functional and timeless spaces across India and Dubai.
            </p>
            <div className="about-manifesto-line" />
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="container" style={{ paddingBottom: '6rem' }}>
        
        {/* Title elements aligned with the screenshot design */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', fontWeight: '400', color: 'var(--text-heading)', lineHeight: '1.2' }}>
            Let's Begin Your <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent-gold-dark)', fontWeight: '450' }}>Interior Journey</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: '#666666', marginTop: '0.8rem', fontWeight: '400' }}>
            Ask us a question or submit your feedback &mdash; our team will get in touch shortly.
          </p>
        </div>

        <div className="luxury-contact-grid" style={{ display: 'flex', justifyContent: 'center' }}>
          
          {/* Centered Column: White Form Card */}
          <div className="luxury-form-card" style={{ maxWidth: '600px', width: '100%' }}>
            {formSubmitted ? (
              <div className="auth-success-alert" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <h4 style={{ color: 'var(--accent-gold-dark)', marginBottom: '0.8rem', fontFamily: 'var(--font-sans)', fontSize: '1.1rem', fontWeight: '600' }}>
                  Inquiry Submitted
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
                  Thank you for your submission. Our studio specialists will review and address your inquiries shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit}>
                
                {/* Row 1: Name and Email */}
                <div className="luxury-form-row">
                  <div className="form-group">
                    <label>YOUR NAME *</label>
                    <input 
                      type="text" 
                      className="form-control luxury-input" 
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>EMAIL ADDRESS *</label>
                    <input 
                      type="email" 
                      className="form-control luxury-input" 
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Select Type */}
                <div className="form-group">
                  <label>INQUIRY TYPE</label>
                  <select 
                    className="form-control luxury-input"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                  >
                    <option value="Ask a Question">Ask a Question</option>
                    <option value="Submit Feedback">Submit Feedback</option>
                  </select>
                </div>

                {/* Row 3: Message Textarea */}
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label>YOUR COMMENT / QUESTION *</label>
                  <textarea 
                    className="form-control luxury-textarea" 
                    placeholder="Type your question or feedback details here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                {/* Submit button */}
                <button type="submit" className="btn-primary luxury-submit-btn">
                  <span>SUBMIT REQUEST</span>
                  <span style={{ fontSize: '1.1rem', marginLeft: '0.4rem', position: 'relative', top: '1px' }}>&rarr;</span>
                </button>

                {/* Email Display at the bottom of the card */}
                <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    For direct correspondence: <a href="mailto:cs@limettainteriors.com" style={{ color: 'var(--accent-gold-dark)', textDecoration: 'underline' }}>cs@limettainteriors.com</a>
                  </p>
                </div>

              </form>
            )}
          </div>
        </div>
      </section>

      {/* Dedicated FAQ Section styled as per screenshot */}
      <section style={{ backgroundColor: '#FAF7F0', padding: '6rem 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container faq-section-grid">
          {/* Left Column: Heading and Small Font description */}
          <div style={{ position: 'sticky', top: '120px' }}>
            <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', lineHeight: '1.4', marginBottom: '1.2rem', fontWeight: '400', color: 'var(--text-heading)' }}>
              Frequently Answered Inquiries
            </h3>
            <p style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '0.85rem', 
              fontWeight: '400', 
              lineHeight: '1.6', 
              color: '#666666',
              maxWidth: '300px'
            }}>
              Everything you need to know before you begin your interior journey with Limetta.
            </p>
          </div>
          
          {/* Right Column: FAQ Card Accordions */}
          <div className="faq-accordion-list">
            {faqs.map(faq => (
              <div key={faq.id} className="faq-card-item">
                <button 
                  className="faq-card-trigger"
                  onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                >
                  <span>{faq.q}</span>
                  <span className="faq-plus-icon">{activeFaq === faq.id ? '—' : '+'}</span>
                </button>
                {activeFaq === faq.id && (
                  <div className="faq-card-content">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll to Top Floating Action Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="scroll-top-float"
        aria-label="Scroll to top"
        style={{ right: '30px' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="19" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
      </button>

    </motion.div>
  );
};

export default AboutContact;
