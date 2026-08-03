import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[Database] Connection Error:', error);
    process.exit(1);
  }
};
