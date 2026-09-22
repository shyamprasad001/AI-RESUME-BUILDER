// ============================================
// auth.service.js - Authentication Service
// ============================================
// Business logic for registration, login,
// Google OAuth, and user profile retrieval.
// ============================================

import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import { verifyGoogleToken } from '../config/google.config.js';
import { generateToken } from '../utils/jwt.utils.js';
import Otp from '../models/Otp.model.js';
import sendEmail from '../utils/email.js';

export const sendOtp = async (email) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered.');
    error.statusCode = 409;
    throw error;
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP in database (overwrites existing unexpired OTP for this email)
  await Otp.findOneAndUpdate(
    { email },
    { otp: otpCode, createdAt: Date.now() },
    { upsert: true, new: true }
  );

  // Send Email
  await sendEmail({
    email,
    subject: 'Your AI Resume Builder Verification Code',
    message: `Your verification code is: ${otpCode}\nThis code will expire in 10 minutes.`,
  });

  return { message: 'OTP sent successfully' };
};

export const register = async (name, email, password, otp) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered.');
    error.statusCode = 409;
    throw error;
  }

  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord || otpRecord.otp !== otp) {
    const error = new Error('Invalid or expired OTP.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10); // bcrypt password hashing (Express.js: Authentication)
  const user = await User.create({ name, email, password: hashedPassword });
  
  // Delete OTP after successful registration
  await Otp.deleteOne({ email });

  const token = generateToken(user); // JWT token generation (Express.js: Authentication)

  return {
    token,
    user: { id: user._id, email: user.email, name: user.name, picture: user.picture },
  };
};

export const emailLogin = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !user.password) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password); // bcrypt password comparison (Express.js: Authentication)
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  user.lastLogin = new Date();
  await user.save();
  const token = generateToken(user);

  return {
    token,
    user: { id: user._id, email: user.email, name: user.name, picture: user.picture },
  };
};

export const googleLogin = async (credential) => {
  const googleUser = await verifyGoogleToken(credential);

  // Check if user exists by googleId or email (to link accounts if they registered via email first)
  let user = await User.findOne({
    $or: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
  });

  if (user) {
    // Update existing user with latest Google info
    user.googleId = googleUser.googleId;
    user.name = googleUser.name;
    user.picture = googleUser.picture;
    user.lastLogin = new Date();
    await user.save();
  } else {
    // Create new user if neither googleId nor email exists
    user = await User.create({
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      lastLogin: new Date(),
    });
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-__v -googleId');

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
};
