import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global._mongooseCache ?? (global._mongooseCache = { conn: null, promise: null });

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in your environment");
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }
  return cached.conn;
}
