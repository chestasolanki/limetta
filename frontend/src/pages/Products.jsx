import React, { useState, useEffect, useContext } from 'react';
import ProductCard from '../components/ProductCard';
import { AppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

const Products = () => {
  const { activeCategory, setActiveCategory, productsList, categoriesList } = useContext(AppContext);
  
  // Filters state
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortOption, setSortOption] = useState('featured');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Categories list
  const categories = ['All', ...categoriesList.map(c => c.name)];

  // Apply filters and sorting
  useEffect(() => {
    let result = productsList;

    // 1. Filter by Category
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // 2. Filter by Price
    result = result.filter(p => p.price <= maxPrice);

    // 3. Sort products
    if (sortOption === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortOption === 'alpha-az') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);
  }, [activeCategory, maxPrice, sortOption, productsList]);

  const resetFilters = () => {
    setActiveCategory('All');
    setMaxPrice(50000);
    setSortOption('featured');
  };

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '80vh' }}
    >
      <div className="section-header" style={{ marginTop: '5rem', marginBottom: '1rem', textAlign: 'left' }}>
        <p>Studio Collection</p>
        <h2 style={{ fontSize: '3rem' }}>The Full Catalog</h2>
      </div>

      {/* Mobile Horizontal Pill Scrollbar & Filter Toggle (Visible on Mobile only) */}
      <div className="mobile-catalog-controls">
        <div className="mobile-categories-scroll">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`mobile-cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <button 
          className="mobile-filter-trigger-btn"
          onClick={() => setMobileFilterOpen(true)}
          aria-label="Filter products list"
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
        </button>
      </div>

      <div className="catalog-layout">
        {/* Sidebar Filters (Hidden on Mobile) */}
        <aside className="filter-sidebar">
          {/* Category Filter */}
          <div className="filter-group">
            <h3 className="filter-title">Categories</h3>
            <ul className="filter-list">
              {categories.map(cat => (
                <li 
                  key={cat} 
                  className={activeCategory === cat ? 'active' : ''}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <h3 className="filter-title">Max Price</h3>
            <div className="filter-price-slider">
              <input 
                type="range" 
                min="2000" 
                max="50000" 
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
              <div className="filter-price-inputs">
                <span>₹2,000</span>
                <input 
                  type="text" 
                  value={`₹${maxPrice.toLocaleString()}`} 
                  disabled 
                  aria-label="Current selected max price"
                />
                <span>₹50,000</span>
              </div>
            </div>
          </div>

          {/* Reset Filters button */}
          <button 
            className="btn-secondary" 
            style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.75rem', marginTop: '1rem' }}
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </aside>

        {/* Catalog Grid Area */}
        <div style={{ flexGrow: 1 }}>
          {/* Sorting and Count header */}
          <div className="catalog-header">
            <span className="catalog-count-text">
              Showing {filteredProducts.length} of {productsList.length} architectural pieces
            </span>
            
            <div className="catalog-sort-box">
              <span className="sort-label">Sort by</span>
              <select 
                className="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                aria-label="Sort products list"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="alpha-az">Alphabetical: A-Z</option>
              </select>
            </div>
          </div>

          {/* Grid of Cards */}
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '6rem 0', backgroundColor: 'var(--bg-pure)', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No products match your active filters.</p>
              <button className="btn-primary" onClick={resetFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-Up Drawer Overlay */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="mobile-filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
            />

            {/* Bottom/Side Slide Drawer */}
            <motion.div 
              className="mobile-filter-drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            >
              <div className="mobile-filter-header">
                <h3>Filter & Sort</h3>
                <button 
                  className="mobile-filter-close"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters panel"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <div className="mobile-filter-content">
                {/* Sorting */}
                <div className="mobile-filter-drawer-group">
                  <h4 className="mobile-filter-drawer-title">Sort Products</h4>
                  <select 
                    className="mobile-sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    aria-label="Mobile sort options"
                  >
                    <option value="featured">Featured Pieces</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="alpha-az">Alphabetical: A-Z</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="mobile-filter-drawer-group">
                  <h4 className="mobile-filter-drawer-title">Max Budget</h4>
                  <div className="filter-price-slider">
                    <input 
                      type="range" 
                      min="2000" 
                      max="50000" 
                      step="1000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
                    />
                    <div className="filter-price-inputs">
                      <span>₹2,000</span>
                      <input 
                        type="text" 
                        value={`₹${maxPrice.toLocaleString()}`} 
                        disabled 
                        aria-label="Mobile selected max price"
                      />
                      <span>₹50,000</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mobile-filter-drawer-footer">
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '0.8rem' }}
                    onClick={() => { resetFilters(); setMobileFilterOpen(false); }}
                  >
                    Reset
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1.5, padding: '0.8rem' }}
                    onClick={() => setMobileFilterOpen(false)}
                  >
                    Apply Filters ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Products;
