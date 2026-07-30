import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ShieldCheck } from 'lucide-react';

const Footer = () => {
  const { setRoute } = useContext(AppContext);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <h2 className="logo-link" style={{ fontSize: '1.5rem', color: '#FFF' }}>
              L I M E T T A<span className="logo-accent">.</span>
            </h2>
            <p>
              Crafting environments of silent luxury. We curate timeless interior accents that merge architectural form with daily functionality, embodying an elegant, minimal, and sophisticated approach to modern living.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4>Collection</h4>
            <ul className="footer-links">
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setRoute('home'); }}>Home</a></li>
              <li><a href="#shop" onClick={(e) => { e.preventDefault(); setRoute('catalog'); }}>Shop All</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); setRoute('about'); }}>Our Philosophy</a></li>
              <li><a href="#profile" onClick={(e) => { e.preventDefault(); setRoute('profile'); }}>My Account</a></li>
            </ul>
          </div>

          {/* Care / FAQs */}
          <div>
            <h4>Client Services</h4>
            <ul className="footer-links">
              <li><a href="#about" onClick={(e) => { e.preventDefault(); setRoute('about'); }}>FAQs</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); setRoute('about'); }}>Shipping & Delivery</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); setRoute('about'); }}>Care Instructions</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); setRoute('about'); }}>Returns & Exchanges</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Limetta. All rights reserved. Created with absolute craftsmanship.
          </div>
          <div className="social-links">
            <a href="https://www.instagram.com/limettainteriors/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
