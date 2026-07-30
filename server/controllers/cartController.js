import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('products.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, products: [] });
    } else {
      // Auto-clean orphaned references from deleted products
      const initialCount = cart.products.length;
      cart.products = cart.products.filter(item => item.product !== null && item.product !== undefined);
      if (cart.products.length !== initialCount) {
        await cart.save();
      }
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add or update item in cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  const { productId, quantity, selectedFinish } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, products: [] });
    }

    const finishVal = selectedFinish || (product.finishes ? product.finishes[0] : '');

    // Check if item already exists in cart with same product and finish
    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId && item.selectedFinish === finishVal
    );

    if (itemIndex > -1) {
      cart.products[itemIndex].quantity += Number(quantity || 1);
    } else {
      cart.products.push({
        product: productId,
        quantity: Number(quantity || 1),
        selectedFinish: finishVal
      });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('products.product');
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.products.id(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (Number(quantity) <= 0) {
      cart.products = cart.products.filter((p) => p._id.toString() !== req.params.id);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('products.product');
    res.json(populatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.products = cart.products.filter((p) => p._id.toString() !== req.params.id);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('products.product');
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.products = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
