import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const Wishlist = () => {
  const { wishlist, setRoute, addToCart, toggleWishlist } = useContext(AppContext);

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    toggleWishlist(product); // remove from wishlist after moving to cart
  };

  return (
    <motion.div 
      className="container wishlist-layout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '75vh' }}
    >
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '3rem' }}>
        <p>Your Registry</p>
        <h2 style={{ fontSize: '3rem' }}>Saved Pieces</h2>
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={60} strokeWidth={1} style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem' }} />
          <p style={{ fontSize: '1.1rem', color: 'var(--text-body)', marginBottom: '2rem' }}>
            Your saved wishlist registry is currently empty.
          </p>
          <button className="btn-primary" onClick={() => setRoute('catalog')}>
            Explore Collection
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(product => (
            <div key={product.id} style={{ position: 'relative' }}>
              <ProductCard product={product} />
              
              {/* Move to Cart Quick link overlay under card */}
              <button 
                className="btn-secondary"
                style={{ 
                  width: '100%', 
                  marginTop: '0.8rem', 
                  padding: '0.6rem 1rem', 
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onClick={() => handleMoveToCart(product)}
              >
                <ShoppingCart size={14} />
                Move to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Wishlist;
