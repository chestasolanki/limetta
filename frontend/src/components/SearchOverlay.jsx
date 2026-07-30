import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchOverlay = () => {
  const { searchOpen, setSearchOpen, setRoute, setActiveProductId, productsList } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  // Perform search on query change
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const filtered = productsList.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, productsList]);

  const handleResultClick = (productId) => {
    setActiveProductId(productId);
    setSearchOpen(false);
    setRoute('details');
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div 
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Close button */}
          <div className="search-header-bar">
            <button className="close-btn" onClick={() => setSearchOpen(false)} aria-label="Close Search">
              <X size={30} strokeWidth={1} />
            </button>
          </div>

          {/* Input field wrapper */}
          <div className="search-input-wrapper">
            <input 
              ref={inputRef}
              type="text" 
              className="search-input-field" 
              placeholder="Search by product, category, style..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Results List */}
          <div className="search-results-container">
            {results.length > 0 ? (
              <div className="search-results-list">
                <p className="uppercase-label" style={{ marginBottom: '1rem' }}>Matching Results ({results.length})</p>
                {results.map((product) => (
                  <div 
                    key={product.id} 
                    className="search-result-item"
                    onClick={() => handleResultClick(product.id)}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="search-result-img"
                    />
                    <div className="search-result-info">
                      <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-heading)' }}>{product.name}</h4>
                      <span className="search-result-price">{product.category} &bull; ₹{(product.price).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.trim() !== '' ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                <p>No products match your search query: "{query}"</p>
              </div>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                <p className="uppercase-label" style={{ marginBottom: '1.5rem' }}>Trending Collections</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {['Lighting', 'Seating', 'Decor', 'Modern'].map((tag) => (
                    <button 
                      key={tag}
                      className="btn-secondary"
                      style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem' }}
                      onClick={() => setQuery(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
