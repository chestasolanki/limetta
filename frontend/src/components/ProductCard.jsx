import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { 
    setRoute, 
    setActiveProductId, 
    addToCart, 
    toggleWishlist, 
    isInWishlist 
  } = useContext(AppContext);

  const favorited = isInWishlist(product.id);

  const handleCardClick = () => {
    setActiveProductId(product.id);
    setRoute('details');
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      {/* Product Image & Hover Action Overlay */}
      <div className="product-img-container" style={{ position: 'relative' }}>
        {product.stock === 0 && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: '#B83B3B',
            color: '#FFFFFF',
            fontSize: '0.65rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            padding: '0.2rem 0.6rem',
            letterSpacing: '0.05em',
            zIndex: 2,
            borderRadius: '2px'
          }}>
            Out of Stock
          </div>
        )}

        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy"
          style={{ opacity: product.stock === 0 ? 0.6 : 1 }}
        />
        
        {/* Wishlist Button */}
        <button 
          className={`product-wishlist-btn ${favorited ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={favorited ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={16} fill={favorited ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>

        {/* Hover Actions Bar */}
        <div className="product-overlay-actions">
          {product.stock > 0 ? (
            <button 
              className="btn-primary" 
              style={{ 
                padding: '0.6rem 1.2rem', 
                fontSize: '0.7rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                letterSpacing: '0.1em'
              }}
              onClick={handleQuickAdd}
            >
              <ShoppingCart size={12} />
              Quick Add
            </button>
          ) : (
            <button 
              className="btn-secondary" 
              style={{ 
                padding: '0.6rem 1.2rem', 
                fontSize: '0.7rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                letterSpacing: '0.1em',
                cursor: 'not-allowed',
                opacity: 0.6,
                backgroundColor: 'var(--bg-pure)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)'
              }}
              disabled
              onClick={(e) => e.stopPropagation()}
            >
              Sold Out
            </button>
          )}
        </div>
      </div>

      {/* Product Details Info */}
      <div className="product-info">
        <span className="product-info-cat">{product.category}</span>
        <h3 className="product-info-title">{product.name}</h3>
        {product.discount > 0 ? (
          <div style={{ marginTop: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#B83B3B', fontWeight: '600', fontSize: '1rem' }}>-{product.discount}%</span>
              <span className="product-info-price" style={{ margin: 0 }}>₹{product.price.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{product.mrp?.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <span className="product-info-price">₹{product.price.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
