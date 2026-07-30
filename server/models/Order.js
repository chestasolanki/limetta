import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  selectedFinish: { type: String, default: '' },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    products: [orderItemSchema], // Compatible field alias
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String }
    },
    paymentMethod: { type: String, default: 'razorpay' },
    paymentStatus: { 
      type: String, 
      required: true, 
      default: 'Pending'
    },
    orderStatus: { 
      type: String, 
      required: true, 
      default: 'Pending', 
      enum: [
        'Pending', 
        'Confirmed', 
        'Processing', 
        'Packed', 
        'Shipped', 
        'Out for Delivery', 
        'Delivered', 
        'Cancelled', 
        'Returned'
      ] 
    },
    totalAmount: { type: Number, required: true },
    totalPrice: { type: Number }, // Compatible field alias
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
