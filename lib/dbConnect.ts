// lib/dbConnect.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// More precise type for global object for Mongoose caching
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Use a global variable to store the Mongoose connection to prevent multiple connections in development
// Assign it directly to a non-nullable type after the check
let cached: MongooseCache = (global as typeof globalThis & { mongoose?: MongooseCache }).mongoose || { conn: null, promise: null };

// Ensure cached.mongoose is assigned to the global object if it wasn't already
if (!(global as typeof globalThis & { mongoose?: MongooseCache }).mongoose) {
  (global as typeof globalThis & { mongoose: MongooseCache }).mongoose = cached;
}

/**
 * Connects to the MongoDB database.
 * Uses a cached connection if available to optimize performance in Next.js development.
 * @returns {Promise<typeof mongoose>} The Mongoose connection instance.
 */
async function dbConnect() {
  // Now, cached.conn is guaranteed to be non-null after the initial assignment
  if (cached.conn) {
    console.log('Using cached database connection.');
    return cached.conn;
  }

  // Now, cached.promise is guaranteed to be non-null after the initial assignment
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose's buffering of commands
    };

    // Connect to MongoDB using the URI
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('New database connection established.');
      return mongooseInstance;
    });
  }

  // Await the connection promise and store the connection instance
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
