import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { products, items, address, shippingAddress, totalPrice, totalAmount, paymentMethod, razorpayOrderId, razorpayPaymentId, paymentStatus, orderStatus } = req.body;

  const orderItems = items || products;
  const targetAddress = shippingAddress || address;
  const finalPrice = totalAmount || totalPrice;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      products: orderItems,
      shippingAddress: targetAddress,
      address: targetAddress,
      totalAmount: finalPrice,
      totalPrice: finalPrice,
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: paymentStatus || 'Pending',
      orderStatus: orderStatus || 'Pending',
      razorpayOrderId,
      razorpayPaymentId
    });

    // Deduct stock for each product
    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product);
      if (dbProduct) {
        dbProduct.stock = Math.max(0, dbProduct.stock - item.quantity);
        await dbProduct.save();
      }
    }

    // Clear cart after order is successfully recorded
    await Cart.findOneAndUpdate({ user: req.user._id }, { products: [] });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user orders or all orders (if admin)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find({}).populate('user', 'name email').populate('products.product').sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: req.user._id }).populate('products.product').sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('products.product');

    if (order) {
      // Allow only the owner or an admin to view this order
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order payment status
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderPayment = async (req, res) => {
  const { paymentStatus, paymentMethod, razorpayOrderId, razorpayPaymentId } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update payment for this order' });
      }

      order.paymentStatus = paymentStatus || 'Paid';
      order.orderStatus = 'Confirmed';
      if (paymentMethod) order.paymentMethod = paymentMethod;
      if (razorpayOrderId) order.razorpayOrderId = razorpayOrderId;
      if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel order (Valid up to Shipment: Pending, Confirmed, Processing, Packed)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Check if order has already shipped or delivered
    const nonCancellableStatuses = ['Shipped', 'Out for Delivery', 'Delivered', 'Returned'];
    if (nonCancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({ 
        message: `Order cannot be cancelled because it is already ${order.orderStatus}. Cancellation is only allowed prior to shipment.` 
      });
    }

    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();
    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete unpaid/exited pending order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this order' });
    }

    // Restore reserved product stock
    const orderItems = order.items || order.products || [];
    for (const item of orderItems) {
      if (item.product) {
        const productId = item.product._id || item.product;
        const dbProduct = await Product.findById(productId);
        if (dbProduct) {
          dbProduct.stock += (item.quantity || 1);
          await dbProduct.save();
        }
      }
    }

    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: 'Pending order removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createOrder, getOrders, getOrderById, updateOrderStatus, updateOrderPayment, cancelOrder, deleteOrder };
