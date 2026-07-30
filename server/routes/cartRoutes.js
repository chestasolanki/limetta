import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all cart routes

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:id')
  .put(updateCartItem)
  .delete(removeCartItem);

export default router;
