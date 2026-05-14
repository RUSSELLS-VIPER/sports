import mongoose from "mongoose";

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const cache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cache;

export async function connectDB() {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("Missing MONGODB_URI in environment");
  }

  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(mongodbUri, {
      dbName: process.env.MONGODB_DB || "sports_registration",
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
