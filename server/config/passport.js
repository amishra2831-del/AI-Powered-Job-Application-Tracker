import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
const googleCallbackURL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:5000/api/auth/google/callback";
if (process.env.NODE_ENV === 'production' && !process.env.GOOGLE_CALLBACK_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    'GOOGLE_CALLBACK_URL is not set in production. Google OAuth callback may fail.',
  );
}
// Initialize Google OAuth strategy only when credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const name = profile.displayName;
          const googleId = profile.id;

          // Check if user already exists
          let user = await User.findOne({ email });

          if (user) {
            // Existing user: update googleId if not set
            if (!user.googleId) {
              user.googleId = googleId;
              await user.save();
            }
            return done(null, user);
          }

          // New user: create account
          user = await User.create({
            name,
            email,
            googleId,
            // Random password for Google users (they'll never use it)
            password: Math.random().toString(36) + Math.random().toString(36),
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      },
    ),
  );
} else {
  // eslint-disable-next-line no-console
  console.warn('Google OAuth not configured: skipping GoogleStrategy registration.');
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;