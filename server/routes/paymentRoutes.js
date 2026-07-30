import express from 'express';
import { createPaymentOrder, verifyPaymentSignature } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/order', createPaymentOrder);
router.post('/verify', verifyPaymentSignature);

export default router;
