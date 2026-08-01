import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Trash2, Plus, Check, MapPin, Package, MessageSquare, 
  DollarSign, BarChart2, Eye, Award, Inbox, CheckCircle, LogOut,
  User, Edit2, Shield, UploadCloud, Upload, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';

const Admin = () => {
  const { 
    productsList, 
    addProduct, 
    deleteProduct, 
    orders, 
    updateOrderStatus, 
    inquiries, 
    resolveInquiry,
    user,
    setUser,
    setRoute,
    logout,
    categoriesList,
    addCategory,
    updateProduct,
    deliveryCharge,
    updateDeliveryCharge
  } = useContext(AppContext);

  // Active admin section state: 'overview' | 'catalog' | 'orders' | 'mail' | 'profile'
  const [activeTab, setActiveTab] = useState('overview');

  // Delivery Charge Setting State
  const [deliveryChargeInput, setDeliveryChargeInput] = useState(deliveryCharge || 0);
  const [deliveryChargeSaved, setDeliveryChargeSaved] = useState(false);

  useEffect(() => {
    setDeliveryChargeInput(deliveryCharge || 0);
  }, [deliveryCharge]);

  const handleSaveDeliveryCharge = async (e) => {
    e?.preventDefault();
    setDeliveryChargeSaved(false);
    await updateDeliveryCharge(deliveryChargeInput);
    setDeliveryChargeSaved(true);
    setTimeout(() => setDeliveryChargeSaved(false), 3000);
  };

  // Product Price Edit Modal States
  const [editingProduct, setEditingProduct] = useState(null);
  const [editMrp, setEditMrp] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editSuccess, setEditSuccess] = useState(false);

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setEditMrp(prod.mrp || prod.price || 0);
    setEditDiscount(prod.discount || 0);
    setEditPrice(prod.price || 0);
    setEditSuccess(false);
  };

  const handleMrpDiscountChange = (newMrp, newDisc) => {
    const m = Number(newMrp || 0);
    const d = Number(newDisc || 0);
    setEditMrp(m);
    setEditDiscount(d);
    if (d > 0 && m > 0) {
      setEditPrice(m - Math.round((m * d) / 100));
    } else {
      setEditPrice(m);
    }
  };

  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    await updateProduct(editingProduct.id, {
      name: editingProduct.name || editingProduct.title,
      stock: editingProduct.stock,
      mrp: Number(editMrp),
      discount: Number(editDiscount),
      price: Number(editPrice),
      category: editingProduct.category,
      shortDescription: editingProduct.shortDescription,
      description: editingProduct.fullDesc || editingProduct.description
    });

    setEditSuccess(true);
    setTimeout(() => {
      setEditSuccess(false);
      setEditingProduct(null);
    }, 1200);
  };

  // Admin Profile Edit states
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profAddress, setProfAddress] = useState('');
  const [profSuccess, setProfSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setProfName(user.name || '');
      setProfEmail(user.email || '');
      setProfPhone(user.phone || '');
      setProfAddress(user.address || '');
    }
  }, [user]);

  const handleAdminProfSave = async (e) => {
    e.preventDefault();
    if (setUser) {
      await setUser({
        ...user,
        name: profName,
        email: profEmail,
        phone: profPhone,
        address: profAddress
      });
    }
    setIsEditingProf(false);
    setProfSuccess(true);
    setTimeout(() => setProfSuccess(false), 4000);
  };

  // Form states for adding a new product
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Lighting');
  const [mrp, setMrp] = useState('');
  const [discount, setDiscount] = useState('0');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('/images/modern_wooden_lamp.png');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [materials, setMaterials] = useState('');
  const [finishesStr, setFinishesStr] = useState('Natural Finish, Matte Black');
  const [featuresStr, setFeaturesStr] = useState('Handcrafted base, Warm light');
  
  const [formSuccess, setFormSuccess] = useState(false);

  // Category creation states
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('/images/modern_wooden_lamp.png');
  const [categorySuccess, setCategorySuccess] = useState(false);
  const [isCatUploading, setIsCatUploading] = useState(false);

  // Dynamic multiple images states & ImageKit Cloud Upload state
  const [curatedImages, setCuratedImages] = useState([]);
  const [inputUrl, setInputUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');

  useEffect(() => {
    if (Array.isArray(categoriesList) && categoriesList.length > 0) {
      const match = categoriesList.some(c => c && c.name === category);
      if (!match && categoriesList[0] && categoriesList[0].name) {
        setCategory(categoriesList[0].name);
      }
    }
  }, [categoriesList, category]);

  const isAuthorized = user && user.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="container" style={{ padding: '8rem 0', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--bg-pure)', border: '1px solid var(--border-color)', padding: '3rem', borderRadius: '4px', boxShadow: 'var(--shadow-medium)', textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="uppercase-label" style={{ fontSize: '0.65rem', marginBottom: '0.5rem', display: 'block' }}>Showroom Control</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400', margin: 0 }}>Access Denied</h2>
          </div>

          <p style={{ color: 'var(--text-body)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            {user 
              ? `Your active profile (${user.email}) does not have curator access permissions.`
              : 'This administrative board is restricted to showroom curators. Please sign in.'
            }
          </p>

          {user ? (
            <button 
              type="button" 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.8rem' }}
              onClick={logout}
            >
              Sign Out of Client Profile
            </button>
          ) : (
            <button 
              type="button" 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.8rem' }}
              onClick={() => setRoute('auth')}
            >
              Sign In to Account
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleAddUrlImage = (e) => {
    e.preventDefault();
    if (!inputUrl) return;
    setCuratedImages([...curatedImages, inputUrl]);
    setInputUrl('');
  };

  // Upload image files directly to ImageKit cloud server
  const handleImageFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setUploadStatusMsg(`Uploading ${files.length} file(s) to ImageKit cloud storage...`);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const data = await apiFetch('/upload/multiple', {
        method: 'POST',
        body: formData
      });

      if (data && data.urls) {
        setCuratedImages((prev) => [...prev, ...data.urls]);
        setUploadStatusMsg(`Successfully uploaded ${data.urls.length} image(s) to ImageKit cloud!`);
      } else {
        alert('Image upload to ImageKit failed');
      }
    } catch (err) {
      console.error('ImageKit upload error:', err);
      alert('Error uploading images: ' + err.message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatusMsg(''), 4500);
    }
  };

  // Upload category image file to ImageKit
  const handleCatImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCatUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const data = await apiFetch('/upload/single', {
        method: 'POST',
        body: formData
      });

      if (data && data.url) {
        setNewCatImage(data.url);
      } else {
        alert('Category image upload failed');
      }
    } catch (err) {
      console.error('Category upload error:', err);
      alert('Error uploading category image: ' + err.message);
    } finally {
      setIsCatUploading(false);
    }
  };

  const handleRemoveCuratedImage = (index) => {
    setCuratedImages(curatedImages.filter((_, idx) => idx !== index));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await addCategory(newCatName, newCatImage);
      setNewCatName('');
      setCategorySuccess(true);
      setTimeout(() => {
        setCategorySuccess(false);
        setShowAddCategoryForm(false);
      }, 2000);
    } catch (err) {
      // Alert already handled in context
    }
  };

  // Dashboard metric calculations (Strictly computed from MongoDB real orders)
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || ord.totalPrice || 0), 0);
  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Handle adding new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !mrp || !shortDesc) return;

    // Parse comma separated strings into array
    const finishes = finishesStr.split(',').map(f => f.trim()).filter(Boolean);
    const features = featuresStr.split(',').map(f => f.trim()).filter(Boolean);

    const calculatedPrice = mrp ? Math.round(Number(mrp) * (1 - (Number(discount) || 0) / 100)) : 0;

    const newProduct = {
      name,
      mrp: Number(mrp),
      discount: Number(discount),
      price: calculatedPrice,
      stock: Number(stock) || 0,
      image: curatedImages[0] || '/images/modern_wooden_lamp.png',
      images: curatedImages.length ? curatedImages : ['/images/modern_wooden_lamp.png'],
      category: category || 'Decor',
      shortDescription: shortDesc,
      description: fullDesc || shortDesc,
      materials: materials || 'Premium materials',
      dimensions: dimensions || 'Standard dimensions',
      rating: 5.0,
      finishes: finishes.length ? finishes : ['Natural'],
      features: features.length ? features : ['Handcrafted detailing']
    };

    try {
      await addProduct(newProduct);

      // Reset Form
      setName('');
      setMrp('');
      setDiscount('0');
      setStock('10');
      setShortDesc('');
      setFullDesc('');
      setDimensions('');
      setMaterials('');
      setCuratedImages([]);
      setFormSuccess(true);

      setTimeout(() => {
        setFormSuccess(false);
        setShowAddForm(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', minHeight: '85vh' }}>
      
      {/* Editorial Header */}
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '3rem' }}>
        <p>Administrative Board</p>
        <h2 style={{ fontSize: '3rem' }}>Limetta Admin Console</h2>
      </div>

      <div className="profile-layout" style={{ gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
        
        {/* Left: Administrative Navigation Sidebar */}
        <aside className="profile-card" style={{ padding: '2rem 1.5rem' }}>
          <h3 className="uppercase-label" style={{ marginBottom: '1.5rem', fontSize: '0.7rem', display: 'block', textAlign: 'left' }}>
            Curator Settings
          </h3>
          
          <ul className="profile-nav-list" style={{ borderTop: 'none', paddingTop: 0 }}>
            <li>
              <button 
                className={`profile-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <BarChart2 size={16} />
                <span>Overview</span>
              </button>
            </li>
            <li>
              <button 
                className={`profile-nav-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={() => setActiveTab('catalog')}
              >
                <Package size={16} />
                <span>Catalog Curation</span>
              </button>
            </li>
            <li>
              <button 
                className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Inbox size={16} />
                <span>Order Registry</span>
                {orders.filter(o => o.status === 'Processing').length > 0 && (
                  <span className="badge-count" style={{ position: 'relative', top: 0, right: 0, marginLeft: 'auto' }}>
                    {orders.filter(o => o.status === 'Processing').length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button 
                className={`profile-nav-btn ${activeTab === 'mail' ? 'active' : ''}`}
                onClick={() => setActiveTab('mail')}
              >
                <MessageSquare size={16} />
                <span>Correspondence</span>
                {inquiries.length > 0 && (
                  <span className="badge-count" style={{ position: 'relative', top: 0, right: 0, marginLeft: 'auto' }}>
                    {inquiries.length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button 
                className={`profile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={16} />
                <span>Admin Profile</span>
              </button>
            </li>
            <li style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button 
                className="profile-nav-btn"
                onClick={() => setRoute('profile')}
                style={{ color: 'var(--accent-gold-dark)' }}
              >
                <Shield size={16} />
                <span>View Client Profile</span>
              </button>
            </li>
            <li style={{ marginTop: '0.5rem' }}>
              <button 
                className="profile-nav-btn"
                onClick={async () => {
                  await logout();
                  setRoute('auth');
                }}
                style={{ color: '#B83B3B' }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </aside>

        {/* Right Content Area */}
        <div className="profile-content-area" style={{ padding: '2.5rem' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="profile-section-title">Showroom Overview</h3>
              
              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem', marginBottom: '3rem' }}>
                <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '2px' }}>
                  <span className="uppercase-label" style={{ fontSize: '0.6rem' }}>Total Sales</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: '500', color: 'var(--text-heading)', marginTop: '0.4rem' }}>
                    ₹{totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '2px' }}>
                  <span className="uppercase-label" style={{ fontSize: '0.6rem' }}>Orders Booked</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: '500', color: 'var(--text-heading)', marginTop: '0.4rem' }}>
                    {orders.length}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '2px' }}>
                  <span className="uppercase-label" style={{ fontSize: '0.6rem' }}>Average Order</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: '500', color: 'var(--text-heading)', marginTop: '0.4rem' }}>
                    ₹{averageOrderValue.toLocaleString()}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '2px' }}>
                  <span className="uppercase-label" style={{ fontSize: '0.6rem' }}>Active Queries</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: '500', color: 'var(--text-heading)', marginTop: '0.4rem' }}>
                    {inquiries.length}
                  </div>
                </div>
              </div>

              {/* Dynamic Sales Registry Chart Box */}
              <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '3rem' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '1.5rem' }}>
                  Sales Revenue Registry
                </h4>
                
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No order revenue recorded yet. As clients place orders, your live sales registry will plot real revenue data here.
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '160px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '130px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      {orders.slice(-6).map((ord, idx) => {
                        const maxVal = Math.max(...orders.map(o => o.total || o.totalPrice || 100));
                        const heightPct = Math.max(15, Math.round(((ord.total || ord.totalPrice || 0) / maxVal) * 100));

                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '40px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: '600', color: 'var(--accent-gold-dark)' }}>
                              ₹{(ord.total || ord.totalPrice || 0).toLocaleString()}
                            </span>
                            <div 
                              style={{ 
                                width: '20px', 
                                height: `${heightPct}%`, 
                                backgroundColor: 'var(--accent-gold)', 
                                borderRadius: '2px 2px 0 0',
                                transition: 'height 0.3s ease'
                              }} 
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {orders.slice(-6).map((ord, idx) => (
                        <span key={idx}>Order #{String(ord.id || ord._id).slice(-4)}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Operations Feed */}
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '1.2rem' }}>
                  Recent Operations Feed
                </h4>
                <div style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-pure)' }}>
                  {orders.length === 0 && inquiries.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No recent client operations recorded yet.
                    </div>
                  ) : (
                    <>
                      {orders.slice(0, 3).map((ord) => (
                        <div key={ord.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Order Placed: Order #{ord.id} • Total: ₹{ord.total.toLocaleString()} • Status: {ord.status}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{ord.date}</span>
                        </div>
                      ))}
                      {inquiries.slice(0, 3).map((inq) => (
                        <div key={inq.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Client Query: {inq.name} ({inq.subject})</span>
                          <span style={{ color: 'var(--text-muted)' }}>{inq.date}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: CATALOG CURATION */}
          {activeTab === 'catalog' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              
              {/* Global Delivery Charge Control Card */}
              <div style={{ backgroundColor: 'var(--bg-pure)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
                  Storewide Delivery Fee Control
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Set the global shipping fee added to orders at checkout. Default is <strong>₹0 (Free Delivery)</strong>.
                </p>
                <div style={{ display: 'flex', gap: '0.8rem', maxWidth: '380px', alignItems: 'center' }}>
                  <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="Delivery Charge (₹)" 
                      value={deliveryChargeInput}
                      onChange={(e) => setDeliveryChargeInput(e.target.value)}
                      min="0"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    onClick={handleSaveDeliveryCharge}
                  >
                    Update Delivery Fee
                  </button>
                </div>
                {deliveryChargeSaved && (
                  <p style={{ color: '#2e7d32', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: '500' }}>
                    ✓ Delivery fee updated to ₹{deliveryCharge}. Applied live to all customer checkouts.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 className="profile-section-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                  Curated Catalog Manager
                </h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={() => { setShowAddCategoryForm(!showAddCategoryForm); setShowAddForm(false); }}
                  >
                    <Plus size={14} />
                    <span>{showAddCategoryForm ? "Close Category Form" : "Curate New Category"}</span>
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={() => { setShowAddForm(!showAddForm); setShowAddCategoryForm(false); }}
                  >
                    <Plus size={14} />
                    <span>{showAddForm ? "Close Form" : "Curate New Piece"}</span>
                  </button>
                </div>
              </div>

              {/* Add New Category Form slider */}
              <AnimatePresence>
                {showAddCategoryForm && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', borderBottom: '1px solid var(--border-color)', marginBottom: '2.5rem' }}
                  >
                    <form onSubmit={handleAddCategory} style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>curate new category</h4>
                      
                      {categorySuccess && (
                        <div className="auth-success-alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <CheckCircle size={16} />
                          <span>Category successfully registered in database.</span>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                          <label>Category Name *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="E.g., Seating, Bedroom, Rugs" 
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Category Showcase Image (Upload File)</label>
                          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            <label style={{ flex: 1, padding: '0.6rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'var(--bg-pure)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-gold-dark)' }}>
                              <UploadCloud size={16} />
                              <span>{isCatUploading ? 'Uploading to ImageKit...' : 'Upload Image File'}</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }}
                                onChange={handleCatImageFileUpload}
                                disabled={isCatUploading}
                              />
                            </label>
                            {newCatImage && (
                              <div style={{ width: '42px', height: '42px', border: '1px solid var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                <img src={newCatImage} alt="Category Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                        Register Category
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add New Product Form slider */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', borderBottom: '1px solid var(--border-color)', marginBottom: '2.5rem' }}
                  >
                    <form onSubmit={handleAddProduct} style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>curate new physical object</h4>
                      
                      {formSuccess && (
                        <div className="auth-success-alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <CheckCircle size={16} />
                          <span>Object successfully added to dynamic showroom.</span>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem' }}>
                        <div className="form-group">
                          <label>Category</label>
                          <select 
                            className="form-control" 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            {Array.isArray(categoriesList) && categoriesList.map(cat => cat && cat.name && (
                              <option key={cat.id || cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Object Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="E.g., Travertine Pillar Plinth" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1.5fr', gap: '1.5rem' }}>
                        <div className="form-group">
                          <label>Pieces (Stock)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            placeholder="Pieces" 
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            min="0"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>M.R.P. (Original Price - ₹)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            placeholder="M.R.P." 
                            value={mrp}
                            onChange={(e) => setMrp(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Discount (%)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            placeholder="Discount %" 
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="form-group">
                          <label>Calculated Price (₹)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={mrp ? `₹${Math.round(Number(mrp) * (1 - (Number(discount) || 0) / 100)).toLocaleString()}` : '₹0'} 
                            disabled 
                            style={{ backgroundColor: 'var(--bg-pure)', color: 'var(--accent-gold-dark)', fontWeight: '600' }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ border: '1px solid var(--border-color)', padding: '1.5rem', backgroundColor: 'var(--bg-pure)', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <label style={{ fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                            Product Media Gallery (ImageKit Cloud Upload)
                          </label>
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Cloud-backed by AWS S3 & ImageKit CDN
                          </span>
                        </div>
                        
                        {/* File Upload Drag & Drop zone */}
                        <div style={{ marginBottom: '1.2rem' }}>
                          <label style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem 1.5rem', 
                            border: '2px dashed var(--accent-gold)', 
                            textAlign: 'center', 
                            cursor: isUploading ? 'wait' : 'pointer', 
                            backgroundColor: 'var(--bg-color)', 
                            transition: 'all 0.2s ease', 
                            borderRadius: '4px',
                            opacity: isUploading ? 0.7 : 1
                          }}>
                            <UploadCloud size={32} style={{ color: 'var(--accent-gold-dark)', marginBottom: '0.6rem' }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-heading)', display: 'block', marginBottom: '0.3rem' }}>
                              {isUploading ? 'Uploading Image Files to ImageKit...' : 'Click or Drag & Drop Product Image Files'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Supports JPG, PNG, WebP (Uploaded directly to ImageKit cloud server)
                            </span>
                            <input 
                              type="file" 
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              multiple
                              disabled={isUploading}
                              style={{ display: 'none' }}
                              onChange={handleImageFileUpload}
                            />
                          </label>
                        </div>

                        {uploadStatusMsg && (
                          <div style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--accent-gold)', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--accent-gold-dark)', textAlign: 'center' }}>
                            {uploadStatusMsg}
                          </div>
                        )}

                        {/* Optional URL upload fallback */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Optional: Or paste external image link URL..."
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            style={{ marginBottom: 0, fontSize: '0.8rem' }}
                          />
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            style={{ padding: '0.6rem 1rem', whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                            onClick={handleAddUrlImage}
                          >
                            Add URL
                          </button>
                        </div>

                        {/* Preview grid */}
                        {curatedImages.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                              Uploaded Gallery Images ({curatedImages.length}):
                            </span>
                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                              {curatedImages.map((img, idx) => (
                                <div key={idx} style={{ position: 'relative', width: '90px', height: '70px', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--bg-color)' }}>
                                  <img src={img} alt={`angle preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveCuratedImage(idx)}
                                    title="Remove Image"
                                    style={{ 
                                      position: 'absolute', 
                                      top: 2, 
                                      right: 2, 
                                      backgroundColor: 'rgba(184, 59, 59, 0.9)', 
                                      color: '#FFF', 
                                      border: 'none', 
                                      cursor: 'pointer', 
                                      fontSize: '0.65rem', 
                                      fontWeight: 'bold',
                                      padding: '0.2rem 0.4rem', 
                                      borderRadius: '2px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Brief Description</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Short tagline (appears on catalog grid card)..." 
                          value={shortDesc}
                          onChange={(e) => setShortDesc(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Editorial Description</label>
                        <textarea 
                          className="form-control" 
                          placeholder="Detailed design, artisan process, and wabi-sabi storytelling..." 
                          value={fullDesc}
                          onChange={(e) => setFullDesc(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                          <label>Physical Dimensions</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="E.g., Width: 12 in | Height: 24 in" 
                            value={dimensions}
                            onChange={(e) => setDimensions(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Primary Composition Materials</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="E.g., Natural Italian Travertine stone" 
                            value={materials}
                            onChange={(e) => setMaterials(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                          <label>Finishes (Comma separated)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="E.g., Honed Ivory, Raw Beige" 
                            value={finishesStr}
                            onChange={(e) => setFinishesStr(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Object Features (Comma separated)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="E.g., Solid stone base, Non-slip backing" 
                            value={featuresStr}
                            onChange={(e) => setFeaturesStr(e.target.value)}
                          />
                        </div>
                      </div>

                      <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                        Curation Registry Complete
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Edit Existing Product Form slider */}
              <AnimatePresence>
                {editingProduct && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', borderBottom: '1px solid var(--border-color)', marginBottom: '2.5rem' }}
                  >
                    <form onSubmit={handleSaveEditProduct} style={{ backgroundColor: 'var(--bg-pure)', padding: '2rem', border: '2px solid var(--accent-gold)', marginBottom: '1.5rem', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, color: 'var(--text-heading)' }}>
                          Update Price: {editingProduct.name}
                        </h4>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}
                          onClick={() => setEditingProduct(null)}
                        >
                          Cancel
                        </button>
                      </div>

                      {editSuccess && (
                        <div className="auth-success-alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <CheckCircle size={16} />
                          <span>Product price updated successfully.</span>
                        </div>
                      )}

                      {/* Pricing & Discount Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>M.R.P. (Original Price - ₹)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            placeholder="e.g. 5000"
                            value={editMrp}
                            onChange={(e) => handleMrpDiscountChange(e.target.value, editDiscount)}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Discount (%)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            placeholder="e.g. 20"
                            value={editDiscount}
                            onChange={(e) => handleMrpDiscountChange(editMrp, e.target.value)}
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Selling Price (Auto-Calculated - ₹)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            required
                            style={{ backgroundColor: 'var(--bg-color)', fontWeight: 'bold' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                          Save Price Update
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setEditingProduct(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Catalog Table List */}
              <div style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-pure)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                      <th style={{ padding: '1rem' }}>Object Image</th>
                      <th style={{ padding: '1rem' }}>Name</th>
                      <th style={{ padding: '1rem' }}>Category</th>
                      <th style={{ padding: '1rem' }}>Stock</th>
                      <th style={{ padding: '1rem' }}>Pricing Details</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.map((product) => (
                      <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-heading)' }}>
                          {product.name}
                        </td>
                        <td style={{ padding: '1rem' }}>{product.category}</td>
                        <td style={{ padding: '1rem' }}>
                          {product.stock > 0 ? (
                            <span style={{ color: 'var(--text-body)' }}>{product.stock} pcs</span>
                          ) : (
                            <span style={{ color: '#B83B3B', fontWeight: '600' }}>Out of Stock</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {product.discount > 0 ? (
                            <div>
                              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '0.4rem', fontSize: '0.75rem' }}>
                                ₹{product.mrp?.toLocaleString()}
                              </span>
                              <span style={{ color: '#B83B3B', fontWeight: '500', marginRight: '0.4rem', fontSize: '0.75rem' }}>
                                -{product.discount}%
                              </span>
                              <strong style={{ display: 'block', color: 'var(--text-heading)' }}>
                                ₹{product.price.toLocaleString()}
                              </strong>
                            </div>
                          ) : (
                            <strong>₹{product.price.toLocaleString()}</strong>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button 
                            style={{ color: 'var(--accent-gold-dark)', padding: '0.4rem 0.8rem', marginRight: '0.5rem', background: 'none', border: '1px solid var(--border-color)', borderRadius: '2px', cursor: 'pointer' }}
                            onClick={() => openEditModal(product)}
                            title="Update Price"
                          >
                            <Edit2 size={15} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Edit Price</span>
                          </button>
                          <button 
                            style={{ color: '#B83B3B', padding: '0.4rem 0.6rem', background: 'none', border: '1px solid var(--border-color)', borderRadius: '2px', cursor: 'pointer' }}
                            onClick={() => deleteProduct(product.id)}
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 size={15} style={{ verticalAlign: 'middle' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </motion.div>
          )}

          {/* TAB 3: ORDER REGISTRY */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="profile-section-title">Order Registry & Tracking Management</h3>
              
              <div className="orders-list">
                {orders.map((order) => {
                  const orderId = order.id || order._id;
                  
                  return (
                    <OrderAdminCard 
                      key={orderId} 
                      order={order} 
                      updateOrderStatus={updateOrderStatus} 
                    />
                  );
                })}
              </div>

            </motion.div>
          )}

          {/* TAB 4: CORRESPONDENCE */}
          {activeTab === 'mail' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="profile-section-title">Client Correspondence Queue</h3>
              
              {inquiries.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                  All client correspondences have been successfully resolved.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {inquiries.map((inq) => (
                    <div 
                      key={inq.id} 
                      className="review-item"
                      style={{ 
                        border: '1px solid var(--border-color)', 
                        backgroundColor: 'var(--bg-pure)', 
                        padding: '1.8rem',
                        position: 'relative'
                      }}
                    >
                      <div className="review-header" style={{ marginBottom: '1rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-heading)', fontSize: '1rem' }}>{inq.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            <a href={`mailto:${inq.email}`} style={{ color: 'var(--accent-gold-dark)' }}>{inq.email}</a>
                          </span>
                        </div>
                        <span className="review-date">{inq.date}</span>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <span className="uppercase-label" style={{ fontSize: '0.55rem', display: 'block', marginBottom: '0.3rem' }}>Subject</span>
                        <div style={{ fontWeight: '500', color: 'var(--text-heading)' }}>{inq.subject}</div>
                      </div>

                      <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-body)', whiteSpace: 'pre-line' }}>
                        {inq.message}
                      </p>

                      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem 1.2rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          onClick={() => resolveInquiry(inq.id)}
                        >
                          <Check size={12} />
                          <span>Resolve Request</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 className="profile-section-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                  System Curator Profile
                </h3>
                {!isEditingProf && (
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={() => setIsEditingProf(true)}
                  >
                    <Edit2 size={12} />
                    Edit Admin Details
                  </button>
                )}
              </div>

              {profSuccess && (
                <div className="auth-success-alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Check size={16} />
                  <span>Curator profile edits have been safely recorded in database.</span>
                </div>
              )}

              {isEditingProf ? (
                <form onSubmit={handleAdminProfSave} style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label htmlFor="adm-prof-name">Full Name</label>
                      <input 
                        type="text" 
                        id="adm-prof-name"
                        className="form-control" 
                        value={profName} 
                        onChange={(e) => setProfName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="adm-prof-email">Email Address</label>
                      <input 
                        type="email" 
                        id="adm-prof-email"
                        className="form-control" 
                        value={profEmail} 
                        onChange={(e) => setProfEmail(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="adm-prof-phone">Contact Phone Number</label>
                    <input 
                      type="text" 
                      id="adm-prof-phone"
                      className="form-control" 
                      value={profPhone} 
                      onChange={(e) => setProfPhone(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="adm-prof-addr">Primary Delivery / Headquarters Address</label>
                    <textarea 
                      id="adm-prof-addr"
                      className="form-control" 
                      value={profAddress} 
                      onChange={(e) => setProfAddress(e.target.value)} 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '0.7rem 1.8rem', fontSize: '0.75rem' }}>
                      Save Edits
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ padding: '0.7rem 1.8rem', fontSize: '0.75rem' }}
                      onClick={() => setIsEditingProf(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', backgroundColor: 'var(--bg-pure)', padding: '2rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                  <div>
                    <p className="uppercase-label" style={{ fontSize: '0.65rem', marginBottom: '0.4rem' }}>Curator Name</p>
                    <p style={{ fontWeight: '500', color: 'var(--text-heading)' }}>{user?.name || profName}</p>
                    
                    <p className="uppercase-label" style={{ fontSize: '0.65rem', marginTop: '1.2rem', marginBottom: '0.4rem' }}>Email Address</p>
                    <p style={{ color: 'var(--text-body)' }}>{user?.email || profEmail}</p>

                    <p className="uppercase-label" style={{ fontSize: '0.65rem', marginTop: '1.2rem', marginBottom: '0.4rem' }}>Phone</p>
                    <p style={{ color: 'var(--text-body)' }}>{user?.phone || profPhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="uppercase-label" style={{ fontSize: '0.65rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Shield size={12} /> System Access Level
                    </p>
                    <p style={{ color: 'var(--accent-gold-dark)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                      Administrator / Showroom Curator
                    </p>

                    <p className="uppercase-label" style={{ fontSize: '0.65rem', marginTop: '1.2rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} /> Head Office / Delivery Address
                    </p>
                    <p style={{ color: 'var(--text-body)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {user?.address || profAddress || 'No address specified.'}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>Client Account Profile View</h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Switch to standard client profile view to access your personal wishlist, cart, and orders.
                  </p>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  onClick={() => setRoute('profile')}
                >
                  Open Client Profile Page
                </button>
              </div>
            </motion.div>
          )}

        </div>

      </div>

    </div>
  );
};

// Sub-component for managing individual Order status updates in Admin
const OrderAdminCard = ({ order, updateOrderStatus }) => {
  const orderId = order.id || order._id;
  const [selectedStatus, setSelectedStatus] = useState(order.status || 'Pending');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (order.status) {
      setSelectedStatus(order.status);
    }
  }, [order.status]);

  const handleSaveStatus = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await updateOrderStatus(orderId, selectedStatus);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="order-card" style={{ border: '1px solid var(--border-color)', marginBottom: '1.5rem', backgroundColor: 'var(--bg-pure)' }}>
      {/* Header */}
      <div className="order-card-header" style={{ padding: '1.2rem', backgroundColor: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Confirmation</span>
          <strong style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: 'var(--text-heading)' }}>Order #{orderId}</strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.8rem' }}>Placed: {order.date}</span>
        </div>
        
        {/* Dropdown status update & Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Status:</span>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ 
              padding: '0.4rem 0.8rem', 
              border: '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-pure)', 
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              borderRadius: '2px'
            }}
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>

          <button 
            type="button" 
            className="btn-primary"
            style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
            onClick={handleSaveStatus}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Status"}
          </button>

          {savedSuccess && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold-dark)', fontWeight: '600' }}>
              ✓ Saved to MongoDB
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="order-card-body" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Left: Customer & Products */}
          <div>
            {/* Customer Details */}
            <div style={{ marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Customer Details</span>
              <div style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                {order.user?.name || order.userName || 'Valued Client'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-body)' }}>
                {order.user?.email || order.userEmail || 'Client Email'}
              </div>
            </div>

            {/* Products List */}
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>Products Ordered</span>
            {order.items.map((item, idx) => {
              const prodName = item.product?.name || 'Curated Object';
              const prodImage = item.product?.image || '/images/placeholder.png';
              const prodPrice = item.product?.price || 0;

              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <img src={prodImage} alt={prodName} style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                    <div>
                      <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.85rem', color: 'var(--text-heading)', margin: 0 }}>{prodName}</h5>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} {item.selectedFinish && `• Finish: ${item.selectedFinish}`}</span>
                    </div>
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-heading)' }}>
                    ₹{(prodPrice * item.quantity).toLocaleString()}
                  </strong>
                </div>
              );
            })}
          </div>

          {/* Right: Payment & Destination */}
          <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.2rem', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Payment Status</span>
            <div style={{ marginBottom: '1.2rem' }}>
              <span className={`order-status ${order.paymentStatus === 'Paid' ? 'delivered' : 'processing'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                Payment: {order.paymentStatus || 'Pending'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                Method: {order.paymentMethod || 'Razorpay / Online'}
              </span>
            </div>

            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Delivery Address</span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: '1.5', marginBottom: '1.2rem' }}>
              {order.shippingAddress}
            </div>

            <div style={{ paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Invoice Total</span>
              <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold-dark)' }}>
                ₹{order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
