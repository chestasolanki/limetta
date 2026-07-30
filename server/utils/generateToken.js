import jwt from 'jsonwebtoken';
import { cookieOptions } from './cookieOptions.js';

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  // Set HTTP-Only Cookie — options now come from the shared cookieOptions.js
  // so login (here) and logout (authController.js) can never drift apart.
  res.cookie('token', token, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return token;
};

export default generateToken;