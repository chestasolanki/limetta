import rateLimit from 'express-rate-limit';

// npm i express-rate-limit

// Limits how often OTPs can be requested for a given IP — prevents SMS
// spam/cost abuse and phone-number enumeration.
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many OTP requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Limits login attempts per IP — slows down password brute-forcing.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Limits registration attempts per IP (each one also consumes an OTP
// verification attempt, so this backs up the per-OTP attempt counter).
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});