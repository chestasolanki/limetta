import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, updateOrderPayment, cancelOrder, deleteOrder } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById)
  .delete(deleteOrder);

router.route('/:id/status')
  .put(admin, updateOrderStatus);

router.route('/:id/pay')
  .put(updateOrderPayment);

router.route('/:id/cancel')
  .put(cancelOrder);

export default router;
