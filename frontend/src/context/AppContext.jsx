import React, { createContext, useState, useEffect } from 'react';
import { products } from '../data/products'; // fallback initial data
import { apiFetch } from '../utils/api';

export const AppContext = createContext();

// Helper to dynamically load the Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const AppProvider = ({ children }) => {
  // Routing state: 'home' | 'catalog' | 'details' | 'wishlist' | 'profile' | 'checkout' | 'success' | 'about' | 'auth' | 'admin'
  const [route, setRouteState] = useState('home');
  const [activeProductId, setActiveProductId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  
  // Category state for routing pre-filters
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Dynamic Category State
  const [categoriesList, setCategoriesList] = useState([]);

  // Dynamic Catalog State (Populated strictly from database)
  const [productsList, setProductsList] = useState([]);

  // Cart: Array of { _id (cart item ID), product, quantity, selectedFinish }
  const [cart, setCart] = useState([]);
  // Wishlist: Array of products
  const [wishlist, setWishlist] = useState([]);
  
  // User Session: null means guest/not logged in, object means logged in
  const [user, setUser] = useState(null);

  // Orders History State
  const [orders, setOrders] = useState([]);

  // Client Correspondence/Inquiries State
  const [inquiries, setInquiries] = useState([]);

  // Store Settings State (Delivery charge defaults to 0 / Free Delivery)
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Map product schema fields for UI compatibility
  const mapProduct = (p) => {
    if (!p) {
      return {
        id: 'deleted',
        name: 'Curated Object',
        image: '/images/placeholder.png',
        shortDescription: 'Product details unavailable',
        price: 0
      };
    }
    return {
      ...p,
      id: p._id || p.id || 'unknown',
      name: p.title || p.name || 'Curated Object',
      image: p.images?.[0] || p.image || '/images/placeholder.png',
      shortDescription: p.shortDescription || p.description || '',
      price: typeof p.price === 'number' ? p.price : 0
    };
  };

  // Hydration helpers
  const fetchProducts = async () => {
    try {
      const data = await apiFetch('/products');
      if (data && data.length > 0) {
        const mapped = data.map(mapProduct);
        setProductsList(mapped);
        
        // Select first product by default
        setActiveProductId(prev => {
          if (!prev || !mapped.some(p => p.id === prev)) {
            return mapped[0].id;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching products:', err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiFetch('/categories');
      setCategoriesList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err.message);
      setCategoriesList([]);
    }
  };

  const fetchCart = async () => {
    try {
      const data = await apiFetch('/cart');
      if (data && data.products) {
        const validProducts = data.products.filter(item => item.product && item.product._id);
        const mapped = validProducts.map(item => ({
          _id: item._id,
          product: mapProduct(item.product),
          quantity: item.quantity,
          selectedFinish: item.selectedFinish
        }));
        setCart(mapped);
      }
    } catch (err) {
      console.error('Error fetching cart:', err.message);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await apiFetch('/wishlist');
      if (data) {
        const mapped = data.map(mapProduct);
        setWishlist(mapped);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      if (data) {
        const mapped = data.map(ord => ({
          ...ord,
          id: ord._id,
          total: ord.totalPrice || ord.totalAmount || 0,
          date: new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          status: ord.orderStatus || 'Pending',
          paymentStatus: ord.paymentStatus || 'Pending',
          paymentMethod: ord.paymentMethod || 'Razorpay',
          shippingAddress: typeof ord.shippingAddress === 'string' 
            ? ord.shippingAddress 
            : [ord.shippingAddress?.street, ord.shippingAddress?.city, ord.shippingAddress?.state, ord.shippingAddress?.postalCode].filter(Boolean).join(', ') || [ord.address?.street, ord.address?.city].filter(Boolean).join(', ') || 'Address specified',
          items: (ord.products || ord.items || []).map(item => ({
            product: mapProduct(item.product),
            quantity: item.quantity,
            selectedFinish: item.selectedFinish || ''
          }))
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    }
  };

  const checkSession = async () => {
    try {
      const data = await apiFetch('/auth/me');
      if (data) {
        const street = data.address?.street || '';
        const city = data.address?.city || '';
        const state = data.address?.state || '';
        const postalCode = data.address?.postalCode || '';
        const country = data.address?.country || '';
        const formattedAddress = [street, city, state, postalCode, country].filter(Boolean).join(', ');
        
        setUser({
          ...data,
          address: formattedAddress
        });
        await fetchCart();
        await fetchWishlist();
        await fetchOrders();
      }
    } catch (err) {
      setUser(null);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await apiFetch('/settings');
      if (data && data.deliveryCharge !== undefined) {
        setDeliveryCharge(Number(data.deliveryCharge));
      }
    } catch (err) {
      console.error('Error fetching settings:', err.message);
    }
  };

  const updateDeliveryCharge = async (newCharge) => {
    try {
      const data = await apiFetch('/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryCharge: Number(newCharge) })
      });
      if (data && data.deliveryCharge !== undefined) {
        setDeliveryCharge(Number(data.deliveryCharge));
      }
      return data;
    } catch (err) {
      console.error('Error updating delivery charge:', err.message);
      alert(err.message || 'Failed to update delivery charge.');
      throw err;
    }
  };

  const updateProduct = async (productId, updatedProduct) => {
    try {
      const data = await apiFetch(`/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedProduct.name || updatedProduct.title,
          description: updatedProduct.description,
          shortDescription: updatedProduct.shortDescription,
          materials: updatedProduct.materials,
          dimensions: updatedProduct.dimensions,
          features: updatedProduct.features,
          price: updatedProduct.price,
          mrp: updatedProduct.mrp,
          discount: updatedProduct.discount,
          category: updatedProduct.category,
          images: updatedProduct.images && updatedProduct.images.length > 0 ? updatedProduct.images : [updatedProduct.image],
          stock: updatedProduct.stock,
          finishes: updatedProduct.finishes
        })
      });
      await fetchProducts();
      return data;
    } catch (err) {
      console.error('Error updating product:', err.message);
      alert(err.message || 'Failed to update product.');
      throw err;
    }
  };

  // Initial Load & Real-Time Polling for Order Status Synchronization across Client and Admin
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSettings();
    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      const interval = setInterval(() => {
        fetchOrders();
      }, 3000); // Polling every 3 seconds for instant real-time status updates on client side
      return () => clearInterval(interval);
    }
  }, [user]);

  const setRoute = (newRoute) => {
    setRouteState(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (user) {
      fetchOrders();
    }
  };

  // User Profile persistence wrapper
  const handleSetUser = async (val) => {
    if (val && val.email && user) {
      try {
        const addressParts = val.address.split(',');
        const street = addressParts[0]?.trim() || '';
        const city = addressParts[1]?.trim() || '';
        const country = addressParts[addressParts.length - 1]?.trim() || '';
        
        const data = await apiFetch('/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: val.name,
            email: val.email,
            phone: val.phone,
            address: {
              street,
              city,
              country,
              state: 'N/A',
              postalCode: '000000'
            }
          })
        });

        setUser({
          ...data,
          address: val.address
        });
      } catch (err) {
        console.error('Error saving user profile:', err.message);
      }
    } else {
      setUser(val);
    }
  };

  // Admin Catalog Add
  const addProduct = async (newProduct) => {
    try {
      const data = await apiFetch('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProduct.name,
          description: newProduct.description,
          shortDescription: newProduct.shortDescription,
          materials: newProduct.materials,
          dimensions: newProduct.dimensions,
          features: newProduct.features,
          price: newProduct.price,
          mrp: newProduct.mrp,
          discount: newProduct.discount,
          category: newProduct.category,
          images: newProduct.images && newProduct.images.length > 0 ? newProduct.images : [newProduct.image],
          stock: newProduct.stock,
          rating: 4.8,
          finishes: newProduct.finishes
        })
      });
      await fetchProducts();
      return data;
    } catch (err) {
      console.error('Error adding product:', err.message);
      alert(`Failed to add product: ${err.message}`);
      throw err;
    }
  };

  // Admin Catalog Delete
  const deleteProduct = async (productId) => {
    try {
      await apiFetch(`/products/${productId}`, {
        method: 'DELETE'
      });
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err.message);
    }
  };

  const addCategory = async (name, image = '') => {
    try {
      const data = await apiFetch('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image: image || '/images/modern_wooden_lamp.png' })
      });
      await fetchCategories();
      return data;
    } catch (err) {
      alert(err.message || 'Failed to create category');
      throw err;
    }
  };

  // Admin Order Status Update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err.message);
    }
  };

  // Local Inquiry Resolution (No Database Required for Inquiries)
  const resolveInquiry = (inquiryId) => {
    setInquiries((prevInqs) => prevInqs.filter((inq) => inq.id !== inquiryId));
  };

  const addInquiry = (newInq) => {
    const inquiryRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      resolved: false,
      ...newInq
    };
    setInquiries((prevInqs) => [inquiryRecord, ...prevInqs]);
  };

  // Add to Cart (Requires logged in account)
  const addToCart = async (product, quantity = 1, finish = '') => {
    if (!user) {
      setRoute('auth');
      return;
    }
    
    try {
      const selectedFinish = finish || (product.finishes ? product.finishes[0] : '');
      await apiFetch('/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id || product.id,
          quantity,
          selectedFinish
        })
      });
      await fetchCart();
      setCartOpen(true);
    } catch (err) {
      console.error('Error adding to cart:', err.message);
    }
  };

  // Remove from Cart
  const removeFromCart = async (productId, finish) => {
    const item = cart.find(
      (i) => i.product.id === productId && i.selectedFinish === finish
    );
    if (!item) return;

    try {
      await apiFetch(`/cart/${item._id}`, {
        method: 'DELETE'
      });
      await fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err.message);
    }
  };

  // Update Cart Quantity
  const updateCartQuantity = async (productId, finish, quantity) => {
    const item = cart.find(
      (i) => i.product.id === productId && i.selectedFinish === finish
    );
    if (!item) return;

    if (quantity <= 0) {
      await removeFromCart(productId, finish);
      return;
    }

    try {
      await apiFetch(`/cart/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      await fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err.message);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // Toggle Wishlist
  const toggleWishlist = async (product) => {
    if (!user) {
      setRoute('auth');
      return;
    }
    
    try {
      await apiFetch('/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id || product.id })
      });
      await fetchWishlist();
    } catch (err) {
      console.error('Error toggling wishlist:', err.message);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Authentication controllers
  const login = async (email, password) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (data) {
        const street = data.address?.street || '';
        const city = data.address?.city || '';
        const state = data.address?.state || '';
        const postalCode = data.address?.postalCode || '';
        const country = data.address?.country || '';
        const formattedAddress = [street, city, state, postalCode, country].filter(Boolean).join(', ');
        
        setUser({
          ...data,
          address: formattedAddress
        });
        await fetchCart();
        await fetchWishlist();
        await fetchOrders();
        if (data.role === 'admin') {
          setRoute('admin');
        } else {
          setRoute('profile');
        }
      }
    } catch (err) {
      alert(err.message || 'Login failed');
      throw err;
    }
  };

  const sendOTP = async (email, phone) => {
    try {
      const data = await apiFetch('/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });
      return data;
    } catch (err) {
      alert(err.message || 'Failed to send OTP');
      throw err;
    }
  };

  const forgotPasswordSendOTP = async (email) => {
    try {
      const data = await apiFetch('/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return data;
    } catch (err) {
      alert(err.message || 'Failed to send verification OTP');
      throw err;
    }
  };

  const forgotPasswordReset = async (email, otp, newPassword) => {
    try {
      const data = await apiFetch('/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      return data;
    } catch (err) {
      alert(err.message || 'Failed to reset password');
      throw err;
    }
  };

  const signup = async (name, email, password, phone, otp) => {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, otp })
      });
      
      if (data) {
        setUser({
          ...data,
          address: ''
        });
        setCart([]);
        setWishlist([]);
        setOrders([]);
      }
    } catch (err) {
      alert(err.message || 'Registration failed');
      throw err;
    }
  };

  const updateUserAddress = async (addressObj) => {
    try {
      const data = await apiFetch('/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: addressObj
        })
      });
      
      if (data) {
        const street = data.address?.street || '';
        const city = data.address?.city || '';
        const state = data.address?.state || '';
        const postalCode = data.address?.postalCode || '';
        const country = data.address?.country || '';
        const formattedAddress = [street, city, state, postalCode, country].filter(Boolean).join(', ');
        
        setUser({
          ...data,
          address: formattedAddress
        });
      }
      return data;
    } catch (err) {
      alert(err.message || 'Failed to update address');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
      setUser(null);
      setCart([]);
      setWishlist([]);
      setOrders([]);
      setRoute('auth');
    } catch (err) {
      console.error('Error logging out:', err.message);
    }
  };

  // Create Order in DB (Step 1: Order Creation with Status = Pending)
  const createPendingOrder = async (shippingInfo) => {
    const subtotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 1), 0);
    const shipping = Number(deliveryCharge || 0);
    const total = subtotal + shipping;

    const formattedProducts = cart.map(item => ({
      product: item.product?.id || item.product?._id,
      quantity: item.quantity,
      selectedFinish: item.selectedFinish || '',
      price: item.product?.price || 0
    }));

    const formattedAddress = {
      street: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state || 'N/A',
      postalCode: shippingInfo.postalCode,
      country: shippingInfo.country || 'India'
    };

    try {
      const dbOrder = await apiFetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: formattedProducts,
          address: formattedAddress,
          totalPrice: total,
          razorpayOrderId: 'ORD-PENDING-' + Date.now(),
          razorpayPaymentId: 'PAY-PENDING-' + Date.now(),
          paymentStatus: 'Pending'
        })
      });

      await fetchOrders();
      return dbOrder;
    } catch (err) {
      console.error('Error creating pending order:', err.message);
      alert(err.message || 'Failed to create order.');
      throw err;
    }
  };

  // Pay Pending Order (Direct UPI / COD Execution without Razorpay)
  const payPendingOrder = async (orderId, paymentMethod = 'upi', passAmount = 0) => {
    try {
      const isCod = paymentMethod === 'cod';
      await apiFetch(`/orders/${orderId}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: isCod ? 'Pending' : 'Paid',
          paymentMethod: isCod ? 'COD' : 'UPI',
          razorpayPaymentId: `${isCod ? 'COD' : 'UPI'}-${Date.now()}`
        })
      });
      await apiFetch('/cart', { method: 'DELETE' }).catch(() => {});
      setCart([]);
      await fetchOrders();
      setRoute('success');
      return true;
    } catch (err) {
      console.error('Error completing payment:', err.message);
      alert(err.message || 'Failed to complete order payment.');
      throw err;
    }
  };

  // Place Order Legacy Direct Wrapper
  const placeOrder = async (shippingInfo, paymentMethod = 'razorpay') => {
    const createdOrder = await createPendingOrder(shippingInfo);
    const orderId = createdOrder._id || createdOrder.id;
    if (paymentMethod === 'cod') {
      setRoute('success');
      return orderId;
    }
    await payPendingOrder(orderId, paymentMethod);
    return orderId;
  };

  // Cancel Order Method (Valid prior to shipment)
  const cancelUserOrder = async (orderId) => {
    try {
      await apiFetch(`/orders/${orderId}/cancel`, {
        method: 'PUT'
      });
      await fetchOrders();
      return true;
    } catch (err) {
      console.error('Error cancelling order:', err.message);
      alert(err.message || 'Failed to cancel order.');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        route,
        setRoute,
        activeProductId,
        setActiveProductId,
        searchOpen,
        setSearchOpen,
        cartOpen,
        setCartOpen,
        activeCategory,
        setActiveCategory,
        categoriesList,
        addCategory,
        productsList,
        addProduct,
        updateProduct,
        deleteProduct,
        deliveryCharge,
        updateDeliveryCharge,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        user,
        setUser: handleSetUser,
        orders,
        fetchOrders,
        updateOrderStatus,
        cancelUserOrder,
        inquiries,
        addInquiry,
        resolveInquiry,
        login,
        signup,
        sendOTP,
        forgotPasswordSendOTP,
        forgotPasswordReset,
        updateUserAddress,
        logout,
        createPendingOrder,
        payPendingOrder,
        placeOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
