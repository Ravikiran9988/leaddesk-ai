import mongoose from 'mongoose';

const connectDB = async (retries = 5) => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-leaddesk-mini';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (retries > 0) {
      console.warn(`MongoDB connection failed. Retrying in 5 seconds... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }

    console.error(`MongoDB connection error: ${error.message}`);
    return null;
  }
};

export default connectDB;
