import mongoose from 'mongoose';

const globalCache = globalThis;

if (!globalCache.__cvBuilderMongo) {
  globalCache.__cvBuilderMongo = { conn: null, promise: null };
}

export async function connectDb(uri) {
  const cache = globalCache.__cvBuilderMongo;

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    mongoose.set('strictQuery', true);
    cache.promise = mongoose.connect(uri).then((mongooseInstance) => {
      console.log('MongoDB connected');
      return mongooseInstance;
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
