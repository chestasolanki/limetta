import express from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile, 
  updateUserProfile, 
  sendOTP,
  forgotPasswordSendOTP,
  forgotPasswordReset
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { otpLimiter, loginLimiter, registerLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

router.post('/register', registerLimiter, registerUser);
router.post('/send-otp', otpLimiter, sendOTP);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/forgot-password/send-otp', otpLimiter, forgotPasswordSendOTP);
router.post('/forgot-password/reset', forgotPasswordReset);

export default router;