import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Use global to cache connection
const cached: MongooseCache =
  (global as typeof globalThis & { mongoose?: MongooseCache }).mongoose || {
    conn: null,
    promise: null,
  };

// Assign to global if not already set
if (!(global as typeof globalThis & { mongoose?: MongooseCache }).mongoose) {
  (global as typeof globalThis & { mongoose: MongooseCache }).mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('Using cached database connection.');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('New database connection established.');
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
