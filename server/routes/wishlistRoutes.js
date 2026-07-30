import express from 'express';
import { getWishlist, toggleWishlistItem, removeWishlistItem } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(toggleWishlistItem);

router.route('/:id')
  .delete(removeWishlistItem);

export default router;
