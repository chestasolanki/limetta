import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Heart, Star, Plus, Minus, ArrowLeft, Check, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductDetails = () => {
  const { 
    activeProductId, 
    setRoute, 
    addToCart, 
    toggleWishlist, 
    isInWishlist,
    productsList
  } = useContext(AppContext);

  // Retrieve current product
  const initialProduct = productsList.find(p => p.id === activeProductId) || productsList[0];
  const [product, setProduct] = useState(initialProduct);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Update product if activeProductId changes
  useEffect(() => {
    const updated = productsList.find(p => p.id === activeProductId);
    if (updated) {
      setProduct(updated);
      setSelectedFinish(updated.finishes ? updated.finishes[0] : '');
      setQuantity(1);
      setActiveImgIndex(0);
      // Reset review form
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeProductId, productsList]);

  // Product configurations
  const [selectedFinish, setSelectedFinish] = useState(product.finishes ? product.finishes[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('dimensions'); // dimensions | materials | care

  // Review states
  const [reviewsList, setReviewsList] = useState(product.reviews || []);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Keep reviews in sync when product changes
  useEffect(() => {
    setReviewsList(product.reviews || []);
    setReviewSubmitted(false);
  }, [product]);

  // Handle Review Submit
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    const newReview = {
      id: Date.now(),
      user: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    setReviewsList([newReview, ...reviewsList]);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    setReviewSubmitted(true);

    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  // Product image gallery list
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || '/images/placeholder.png'];
  const activeImage = productImages[activeImgIndex] || product.image || '/images/placeholder.png';

  // Similar products / recommendations: same category, fallback to others
  let recommendations = productsList.filter(
    (p) => p.category === product.category && p.id !== product.id
  );
  if (recommendations.length < 3) {
    const additional = productsList.filter(
      (p) => p.category !== product.category && p.id !== product.id
    );
    recommendations = [...recommendations, ...additional];
  }
  recommendations = recommendations.slice(0, 3);

  const favorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedFinish);
  };

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingBottom: '6rem' }}
    >
      {/* Back button */}
      <button 
        onClick={() => setRoute('catalog')}
        style={{ 
          marginTop: '2.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          fontSize: '0.8rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em',
          color: 'var(--text-muted)'
        }}
      >
        <ArrowLeft size={16} />
        Back to Catalog
      </button>

      {/* Main product columns */}
      <div className="detail-layout">
        {/* Left: Gallery Column */}
        <div className="detail-gallery">
          <div className="detail-img-main">
            <motion.img 
              key={`${product.id}-${activeImgIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={activeImage} 
              alt={product.name} 
            />
          </div>
          
          {/* Small thumbnail list */}
          {productImages.length > 1 && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {productImages.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  style={{ 
                    width: '80px',
                    height: '60px',
                    backgroundImage: `url(${img})`, 
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: idx === activeImgIndex ? 1 : 0.5,
                    border: idx === activeImgIndex ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Column */}
        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          
          {/* Rating */}
          <div className="detail-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.round(product.rating) ? "currentColor" : "none"} 
                  strokeWidth={1.5} 
                />
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ({reviewsList.length} client reviews)
            </span>
          </div>

          {product.discount > 0 ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ color: '#B83B3B', fontWeight: '600', fontSize: '1.6rem' }}>-{product.discount}%</span>
                <span className="detail-price" style={{ margin: 0, fontSize: '2rem' }}>₹{product.price.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{product.mrp?.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="detail-price" style={{ marginBottom: '1.5rem' }}>₹{product.price.toLocaleString()}</div>
          )}

          {/* Stock Display */}
          <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {product.stock > 0 ? (
              <span style={{ color: 'var(--text-body)' }}>Availability: <strong>{product.stock} pieces remaining</strong></span>
            ) : (
              <span style={{ color: '#B83B3B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Out of Stock</span>
            )}
          </div>
          
          <p className="detail-description">{product.description}</p>

          <div className="detail-options">
            {/* Finishes Picker */}
            {product.finishes && (
              <div className="option-group">
                <label>Select Finish</label>
                <div className="finishes-picker">
                  {product.finishes.map(finish => (
                    <button 
                      key={finish} 
                      className={`finish-chip ${selectedFinish === finish ? 'active' : ''}`}
                      onClick={() => setSelectedFinish(finish)}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selection */}
            <div className="option-group">
              <label>Quantity</label>
              <div className="qty-actions" style={{ opacity: product.stock === 0 ? 0.5 : 1, pointerEvents: product.stock === 0 ? 'none' : 'auto' }}>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  disabled={product.stock === 0}
                >
                  <Minus size={16} />
                </button>
                <span className="qty-val">{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.min(product.stock || 1, q + 1))}
                  aria-label="Increase quantity"
                  disabled={product.stock === 0}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions: Cart & Wishlist */}
            <div className="detail-actions-row">
              {product.stock > 0 ? (
                <button className="btn-primary" onClick={handleAddToCart}>
                  Add to Cart
                </button>
              ) : (
                <button 
                  className="btn-secondary" 
                  style={{ 
                    cursor: 'not-allowed', 
                    opacity: 0.6,
                    backgroundColor: 'var(--bg-pure)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)'
                  }} 
                  disabled
                >
                  Out of Stock
                </button>
              )}
              <button 
                className="btn-secondary" 
                style={{ 
                  flexGrow: 0, 
                  width: '55px', 
                  padding: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderColor: favorited ? '#B83B3B' : 'var(--border-color)',
                  color: favorited ? '#B83B3B' : 'var(--text-heading)'
                }}
                onClick={() => toggleWishlist(product)}
                aria-label="Toggle Wishlist"
              >
                <Heart size={20} fill={favorited ? "currentColor" : "none"} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Accordion Specification sheets */}
          <div className="detail-spec-accordion">
            <div className="accordion-item">
              <button 
                className="accordion-trigger" 
                onClick={() => setActiveTab(activeTab === 'dimensions' ? '' : 'dimensions')}
              >
                <span>Dimensions</span>
                <span>{activeTab === 'dimensions' ? '—' : '+'}</span>
              </button>
              {activeTab === 'dimensions' && (
                <div className="accordion-content">
                  <p>{product.dimensions}</p>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <button 
                className="accordion-trigger" 
                onClick={() => setActiveTab(activeTab === 'materials' ? '' : 'materials')}
              >
                <span>Materials & Specs</span>
                <span>{activeTab === 'materials' ? '—' : '+'}</span>
              </button>
              {activeTab === 'materials' && (
                <div className="accordion-content">
                  <p>{product.materials}</p>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.8rem' }}>
                    {product.features?.map((f, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{f}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <button 
                className="accordion-trigger" 
                onClick={() => setActiveTab(activeTab === 'care' ? '' : 'care')}
              >
                <span>Care Instructions & Shipping</span>
                <span>{activeTab === 'care' ? '—' : '+'}</span>
              </button>
              {activeTab === 'care' && (
                <div className="accordion-content">
                  <p>Dust dry with a clean microfiber cloth. Keep away from direct excessive moisture and heat to preserve wood grains and finish quality. Free white-glove curbside delivery on orders exceeding ₹15,000.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>Client Experiences</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: reviewsList.length > 0 ? '1.5fr 1fr' : '1fr', gap: '4rem' }}>
          {/* List of reviews */}
          {reviewsList.length > 0 && (
            <div className="reviews-grid">
              {reviewsList.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-user">{review.user}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="stars" style={{ marginBottom: '0.8rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        fill={i < review.rating ? "currentColor" : "none"} 
                        strokeWidth={1.5} 
                      />
                    ))}
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add a review form */}
          <div className="contact-form-pane" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Write an Appraisal</h3>
            {reviewSubmitted ? (
              <div className="auth-success-alert">
                Your review has been successfully registered. Thank you for your review.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label htmlFor="review-name">Your Name</label>
                  <input 
                    type="text" 
                    id="review-name"
                    className="form-control" 
                    placeholder="E.g., Charlotte Vance"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="review-rating">Rating</label>
                  <select 
                    id="review-rating"
                    className="form-control"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                  >
                    <option value={5}>5 Stars - Exquisite</option>
                    <option value={4}>4 Stars - Very Pleased</option>
                    <option value={3}>3 Stars - Satisfactory</option>
                    <option value={2}>2 Stars - Subpar</option>
                    <option value={1}>1 Star - Dissatisfied</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="review-comment">Review Commentary</label>
                  <textarea 
                    id="review-comment"
                    className="form-control" 
                    placeholder="Share your experience with the craftsmanship and utility..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Submit Appraisal
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Cross sells Section */}
      <section style={{ marginTop: '6rem', borderTop: '1px solid var(--border-color)', paddingTop: '5rem' }}>
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '3rem' }}>
          <p>Complete The Set</p>
          <h2 style={{ fontSize: '2.2rem' }}>Recommended Companions</h2>
        </div>
        <div className="products-grid">
          {recommendations.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default ProductDetails;
