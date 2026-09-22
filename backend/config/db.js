import mongoose from 'mongoose';

/**
 * Connects to MongoDB Atlas via Mongoose
 * @returns {Promise<mongoose.Connection>}
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('USERNAME:PASSWORD@CLUSTER')) {
    const errorMsg = '[Database] MONGODB_URI is not configured in environment variables. Please supply a valid MongoDB Atlas connection string.';
    console.error(`\x1b[31m${errorMsg}\x1b[0m`);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`\x1b[32m[MongoDB]\x1b[0m Connected successfully to: ${conn.connection.host} / database: ${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`\x1b[31m[MongoDB Connection Error]\x1b[0m ${error.message}`);
    throw error;
  }
};
