import mongoose from "mongoose";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Send token as httpOnly cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
};

// Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  // Fail fast if DB is not connected to avoid mongoose buffering timeouts
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        "Database not connected. Set MONGO_URI in server/.env and restart the server.",
    });
  }
  try {
    const { name, email, password } = req.body;

    // Manual users must provide a password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const user = await User.create({ name, email, password });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        "Database not connected. Set MONGO_URI in server/.env and restart the server.",
    });
  }
  try {
    const { email, password } = req.body;

    // Check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // Check if this is a Google account (pending logic rn)
    if (user.googleId && !user.password) {
      return res.status(400).json({
        success: false,
        message:
          'This email is linked to Google. Please use "Continue with Google" to sign in.',
      });
    }
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  res.cookie("token", "none", {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 1000),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Get current logged in user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message:
          "Database not connected. Set MONGO_URI in server/.env and restart the server.",
      });
    }

    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, username, bio, location, avatarColor } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update only provided fields
    if (name) user.name = name;
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (avatarColor !== undefined) user.avatarColor = avatarColor;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        location: user.location,
        email: user.email,
        googleId: user.googleId,
        resumeUploadedAt: user.resumeUploadedAt,
        createdAt: user.createdAt,
        avatarColor: user.avatarColor,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};