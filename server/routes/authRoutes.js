import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Standard Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

// Check if email is associated with a Google account
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    // console.log("EMAIL RECEIVED:", email);
    const user = await User.findOne({ email }).select("googleId");
    // console.log("USER FOUND:", user);

    if (user && user.googleId) {
      return res.json({ isGoogleAccount: true });
    }
    res.json({ isGoogleAccount: false });
  } catch (err) {
    // console.log("ERROR:", err);
    res.json({ isGoogleAccount: false });
  }
});

router.post("/set-cookie", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "No token provided" });
    }

    // Verify token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        googleId: user.googleId,
      },
    });
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    // Generate JWT and set cookie
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      secure: true,
      sameSite: "none",
    });
    // Pass token via URL parameter so frontend can set the cookie
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  },
);

export default router;