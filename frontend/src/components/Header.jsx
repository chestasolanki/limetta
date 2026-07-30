import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../context/AppContext';
import { Search, ShoppingBag, Heart, User, MapPin, ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { 
    setRoute, 
    cart, 
    wishlist, 
    setSearchOpen, 
    setCartOpen,
    setActiveCategory,
    user
  } = useContext(AppContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Mega menu structure matching the requested categories and subcategories
  const megaMenuData = {
    "Furniture": {
      categoryKey: "Seating",
      columns: [
        {
          title: "LIVING ROOM SEATING",
          items: ["Sofas & Sectionals", "Velvet Armchairs", "Sculptural Loungers", "Accent Ottomans", "Daybeds"]
        },
        {
          title: "DINING ROOM & TABLES",
          items: ["Dining Tables", "Studio Chairs", "Sideboard Credenzas", "Serving Side-trays"]
        },
        {
          title: "STORAGE & BENCHES",
          items: ["Mid-Century Sideboards", "Minimalist Oak Benches", "Architectural Cabinets", "Shoe Storage"]
        }
      ]
    },
    "Lighting": {
      categoryKey: "Lighting",
      columns: [
        {
          title: "CEILING & HANGING",
          items: ["Brass Pendant Lights", "Sculptured Chandeliers", "Dome Pendants", "Insured Fittings"]
        },
        {
          title: "LAMPS",
          items: ["Modern Wooden Lamps", "Spanish Alabaster Lamps", "Stone Floor Lamps", "Bedside Glows"]
        },
        {
          title: "ACCENT WALL",
          items: ["Linear Wall Sconces", "Reading Brass Spotlights", "Picture Showcase Lights"]
        }
      ]
    },
    "Wall Mirrors": {
      categoryKey: "Decor",
      columns: [
        {
          title: "ROUND & ARCHED",
          items: ["Travertine Arch Mirrors", "Minimalist Brass Mirrors", "Walnut Round Vanity", "Asymmetrical Mirrors"]
        },
        {
          title: "FULL LENGTH",
          items: ["Solid Oak Dresser Mirrors", "Gilded Metal Wall Mounts", "Bespoke Standing Frames"]
        }
      ]
    },
    "Room Decoration": {
      categoryKey: "Decor",
      columns: [
        {
          title: "WALL PIECES & ART",
          items: ["Linear Metal Wall Art", "Abstract Canvas Paintings", "Curated Clay Panels", "Aesthetic Frames"]
        },
        {
          title: "DECORATIVE OBJECTS",
          items: ["Minimalist Wall Clocks", "Sculptural Candleholders", "Insured Plinths", "Champagne Incense Bowls"]
        }
      ]
    },
    "Decor & Vases": {
      categoryKey: "Decor",
      columns: [
        {
          title: "VESSELS & VASES",
          items: ["Ceramic Vases", "Unglazed Clay Pitchers", "Textured Stone Pots", "Handmade Urns"]
        },
        {
          title: "TABLETOP ACCENTS",
          items: ["Travertine Trays", "Sealed Marble Bowls", "Scented Candleholders", "Book Stands"]
        }
      ]
    }
  };

  const handleSubcategoryClick = (categoryKey) => {
    setActiveCategory(categoryKey);
    setRoute('catalog');
  };

  return (
    <>
      <header className="site-header">
        <div className="container">
          
          {/* --- DESKTOP HEADER VIEW (Hidden on Mobile) --- */}
          <div className="desktop-header-wrapper">
            {/* Row 1: Logo, Search Bar, Actions */}
            <div className="header-top-row">
              {/* Logo */}
              <a href="#home" className="logo-link" onClick={() => setRoute('home')}>
                L I M E T T A<span className="logo-accent">.</span>
              </a>

              {/* Centered Search Bar */}
              <div className="header-search-bar" onClick={() => setSearchOpen(true)}>
                <input 
                  type="text" 
                  placeholder="What are you looking for?" 
                  readOnly 
                  aria-label="Search collections"
                />
                <Search size={18} className="search-bar-icon" />
              </div>

              {/* Right Action Icons */}
              <div className="header-actions">
                <button 
                  className="action-btn" 
                  onClick={() => setRoute('about')}
                  aria-label="Find Showroom"
                >
                  <MapPin size={20} strokeWidth={1.5} />
                </button>

                <button 
                  className="action-btn" 
                  onClick={() => {
                    if (user && user.role === 'admin') {
                      setRoute('admin');
                    } else {
                      setRoute('profile');
                    }
                  }}
                  aria-label="Open Profile"
                >
                  <User size={20} strokeWidth={1.5} />
                </button>

                <button 
                  className="action-btn" 
                  onClick={() => setRoute('wishlist')}
                  aria-label="Open Wishlist"
                >
                  <Heart size={20} strokeWidth={1.5} />
                  {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
                </button>

                <button 
                  className="action-btn" 
                  onClick={() => setCartOpen(true)}
                  aria-label="Open Cart"
                >
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {cartItemCount > 0 && <span className="badge-count">{cartItemCount}</span>}
                </button>
              </div>
            </div>

            {/* Row 2: Categories Navigation offset after logo */}
            <nav className="header-nav-row">
              <ul className="categories-nav-list">
                <li className="nav-item">
                  <a href="#home" onClick={(e) => { e.preventDefault(); setRoute('home'); }}>
                    <span>Home</span>
                  </a>
                </li>
                {Object.keys(megaMenuData).map((catName) => {
                  const menu = megaMenuData[catName];
                  return (
                    <li key={catName} className="nav-item has-mega-menu">
                      <a 
                        href="#shop" 
                        className="nav-link-dropdown"
                        onClick={(e) => { e.preventDefault(); handleSubcategoryClick(menu.categoryKey); }}
                      >
                        <span>{catName}</span>
                        <ChevronDown size={14} className="chevron-icon" />
                      </a>

                      {/* Mega Menu Dropdown Panel */}
                      <div className="mega-menu-panel">
                        <div className="container">
                          <div className="mega-menu-grid">
                            {menu.columns.map((col, idx) => (
                              <div key={idx} className="mega-menu-column">
                                <h4 className="mega-menu-title">{col.title}</h4>
                                <ul className="mega-menu-links">
                                  {col.items.map((item, itemIdx) => (
                                    <li key={itemIdx}>
                                      <a 
                                        href="#shop" 
                                        onClick={(e) => { e.preventDefault(); handleSubcategoryClick(menu.categoryKey); }}
                                      >
                                        {item}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}

                <li className="nav-item">
                  <a href="#shop" onClick={(e) => { e.preventDefault(); handleSubcategoryClick('All'); }}>
                    <span>All Products</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* --- MOBILE HEADER VIEW (Hidden on Desktop) --- */}
          <div className="mobile-header-wrapper">
            {/* Hamburger toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>

            {/* Center brand logo */}
            <a href="#home" className="logo-link mobile-logo" onClick={() => setRoute('home')}>
              L I M E T T A<span className="logo-accent">.</span>
            </a>

            {/* Action icons */}
            <div className="mobile-header-actions">
              <button 
                className="mobile-action-btn" 
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <button 
                className="mobile-action-btn" 
                onClick={() => setCartOpen(true)}
                aria-label="Open Cart"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartItemCount > 0 && <span className="badge-count">{cartItemCount}</span>}
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Render the mobile menu drawer overlay inside document.body using React Portal */}
      {createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                className="mobile-menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Slide Drawer */}
              <motion.div 
                className="mobile-menu-drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              >
                <div className="mobile-menu-header">
                  <span className="mobile-menu-logo">L I M E T T A</span>
                  <button 
                    className="mobile-menu-close"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X size={22} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="mobile-menu-content">
                  <ul className="mobile-nav-links">
                    <li>
                      <a 
                        href="#home" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          setRoute('home'); 
                          setMobileMenuOpen(false);
                        }}
                      >
                        Home
                      </a>
                    </li>
                    {Object.keys(megaMenuData).map((catName) => {
                      const menu = megaMenuData[catName];
                      return (
                        <li key={catName}>
                          <a 
                            href="#shop" 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              handleSubcategoryClick(menu.categoryKey); 
                              setMobileMenuOpen(false);
                            }}
                          >
                            {catName}
                          </a>
                        </li>
                      );
                    })}
                    <li>
                      <a 
                        href="#shop" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          handleSubcategoryClick('All'); 
                          setMobileMenuOpen(false);
                        }}
                      >
                        All Products
                      </a>
                    </li>
                  </ul>

                  <div className="mobile-menu-divider" />

                  <ul className="mobile-secondary-links">
                    <li>
                      <a 
                        href="#about" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          setRoute('about'); 
                          setMobileMenuOpen(false);
                        }}
                      >
                        <MapPin size={16} strokeWidth={1.5} />
                        <span>Store Locator</span>
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#profile" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (user && user.role === 'admin') {
                            setRoute('admin');
                          } else {
                            setRoute('profile');
                          }
                          setMobileMenuOpen(false);
                        }}
                      >
                        <User size={16} strokeWidth={1.5} />
                        <span>My Account</span>
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#wishlist" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          setRoute('wishlist'); 
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Heart size={16} strokeWidth={1.5} />
                        <span>Wishlist Registry ({wishlistCount})</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Header;
