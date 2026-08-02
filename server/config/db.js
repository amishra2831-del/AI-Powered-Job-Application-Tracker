import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI === 'undefined') {
    // eslint-disable-next-line no-console
    console.warn('MONGO_URI not set — skipping MongoDB connection.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    // eslint-disable-next-line no-console
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`MongoDB connection error: ${error.message}`);
    // Do not exit the process to allow local development without a DB configured
  }
};

export default connectDB;
