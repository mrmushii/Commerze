
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}


let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Connects to the MongoDB database.
 * Uses a cached connection if available to optimize performance in Next.js development.
 * @returns {Promise<typeof mongoose>} The Mongoose connection instance.
 */
async function dbConnect() {
  // If a connection is already established, return it
  if (cached.conn) {
    console.log('Using cached database connection.');
    return cached.conn;
  }

  // If no connection promise exists, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose's buffering of commands
      // useNewUrlParser: true, // Deprecated in recent Mongoose versions
      // useUnifiedTopology: true, // Deprecated in recent Mongoose versions
    };

    // Connect to MongoDB using the URI
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('New database connection established.');
      return mongoose;
    });
  }

  // Await the connection promise and store the connection instance
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
