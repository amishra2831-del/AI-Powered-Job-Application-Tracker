import dotenv from "dotenv";
// Load environment variables
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import session from "express-session";
import passport from "./config/passport.js";

// console.log("MONGO_URI =", process.env.MONGO_URI);
// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
// CORS: in production allow the configured client URL, in development allow the frontend origin dynamically
if (process.env.NODE_ENV === 'production') {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );
} else {
  app.use(
    cors({
      origin: true, // reflect request origin
      credentials: true,
    }),
  );
}

// Session needed for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/ai", aiRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Job Dekho API is running yay 🚀" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});