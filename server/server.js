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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// CORS: in production allow the configured client URL plus any authorized frontends;
// in development allow the request origin for localhost testing.
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://client-90aqg8sfc-amishra2831-dels-projects.vercel.app',
  'https://client-theta-amber-33.vercel.app',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // Allow server-to-server requests or tools without origin header.
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'production') {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow origin ${origin}`));
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Session needed for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  }),
);

// Error handler for invalid JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON payload received:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
    });
  }
  next(err);
});

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