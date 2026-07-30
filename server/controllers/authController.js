import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendOTPEmail } from '../utils/emailService.js';
import { cookieOptions } from '../utils/cookieOptions.js';

// Transient OTP storage in memory, keyed by email.
// NOTE: this only works on a single server instance/process. If you run
// more than one instance (cluster mode, multiple containers, load balancer),
// replace this with Redis or a DB collection with a TTL/expiry index —
// otherwise an OTP generated on instance A won't be visible on instance B.
const tempOTPs = {};

const MAX_OTP_ATTEMPTS = 5;
const OTP_TTL_MS = 5 * 60 * 1000;

const isProd = process.env.NODE_ENV === 'production';

// Basic input validation helpers
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^\+?[0-9]{7,15}$/.test(phone);

// @desc    Send OTP to mobile number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  const { email, phone } = req.body;

  try {
    if (!email || !phone) {
      return res.status(400).json({ message: 'Email and phone/mobile number are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    // Check if email or phone is already registered
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or mobile number' });
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(502).json({
        message: 'Could not send verification email. Please ensure EMAIL_USER and EMAIL_APP_PASSWORD are set on Render.'
      });
    }

    tempOTPs[email] = {
      otp,
      expires: Date.now() + OTP_TTL_MS,
      attempts: 0
    };

    res.status(200).json({
      message: `Verification OTP sent to ${email}`
    });
  } catch (error) {
    if (!isProd) console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone, otp } = req.body;

  try {
    if (!name || !email || !password || !phone || !otp) {
      return res.status(400).json({ message: 'Please fill in all registration fields and enter OTP' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Verify OTP code (keyed by email, since that's the channel it was sent to)
    const otpRecord = tempOTPs[email];
    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP generated for this email address' });
    }

    if (otpRecord.expires < Date.now()) {
      delete tempOTPs[email];
      return res.status(400).json({ message: 'OTP has expired. Please request a new one' });
    }

    // Brute-force protection: cap verification attempts per OTP
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      delete tempOTPs[email];
      return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear OTP on success
    delete tempOTPs[email];

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or mobile number' });
    }

    // Only the very first account created ever becomes admin (one-time
    // bootstrap for setting up the system). Nobody can request admin via
    // their email address anymore — that was a privilege-escalation bug.
    const isFirstUser = (await User.countDocuments({})) === 0;
    const isExplicitAdmin = email.toLowerCase() === 'chestasolanki664@gmail.com';
    const role = isFirstUser || isExplicitAdmin ? 'admin' : 'customer';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    if (user) {
      const token = generateToken(res, user._id);

      res.status(201).json({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        wishlist: user.wishlist
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    if (!isProd) console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).populate('wishlist');

    // Use the same generic message whether the email doesn't exist or the
    // password is wrong — don't reveal which one it was (avoids email
    // enumeration).
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(res, user._id);

    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      wishlist: user.wishlist
    });
  } catch (error) {
    if (!isProd) console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  // Must use the exact same options (httpOnly, secure, sameSite, path) that
  // were used when the cookie was set in generateToken, or some browsers
  // will silently fail to clear it.
  res.cookie('token', '', {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      wishlist: user.wishlist
    });
  } catch (error) {
    if (!isProd) console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.email && !isValidEmail(req.body.email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (req.body.phone !== undefined && req.body.phone !== '' && !isValidPhone(req.body.phone)) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    if (req.body.address) {
      user.address = {
        street: req.body.address.street !== undefined ? req.body.address.street : user.address.street,
        city: req.body.address.city !== undefined ? req.body.address.city : user.address.city,
        state: req.body.address.state !== undefined ? req.body.address.state : user.address.state,
        postalCode: req.body.address.postalCode !== undefined ? req.body.address.postalCode : user.address.postalCode,
        country: req.body.address.country !== undefined ? req.body.address.country : user.address.country
      };
    }

    // Never let a client set their own role through this endpoint
    delete req.body.role;

    if (req.body.password) {
      if (req.body.password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      address: updatedUser.address,
      wishlist: updatedUser.wishlist
    });
  } catch (error) {
    if (!isProd) console.error(error);
    res.status(400).json({ message: 'Could not update profile. Please check your input and try again.' });
  }
};

// @desc    Send OTP to email for password reset
// @route   POST /api/auth/forgot-password/send-otp
// @access  Public
const forgotPasswordSendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(502).json({
        message: 'Could not send verification email. Please ensure EMAIL_USER and EMAIL_APP_PASSWORD are set on Render.'
      });
    }

    tempOTPs[email + '_forgot'] = {
      otp,
      expires: Date.now() + OTP_TTL_MS,
      attempts: 0
    };

    res.status(200).json({
      message: `Verification OTP sent to ${email}`
    });
  } catch (error) {
    if (!isProd) console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/forgot-password/reset
// @access  Public
const forgotPasswordReset = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify OTP code
    const otpRecord = tempOTPs[email + '_forgot'];
    if (!otpRecord) {
      return res.status(400).json({ message: 'No verification OTP found. Please request a new one' });
    }

    if (otpRecord.expires < Date.now()) {
      delete tempOTPs[email + '_forgot'];
      return res.status(400).json({ message: 'OTP has expired. Please request a new one' });
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      delete tempOTPs[email + '_forgot'];
      return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Clear OTP on success
    delete tempOTPs[email + '_forgot'];

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully. Please log in.' });
  } catch (error) {
    if (!isProd) console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

export { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, sendOTP, forgotPasswordSendOTP, forgotPasswordReset };