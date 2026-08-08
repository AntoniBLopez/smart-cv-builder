import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/db.js';
import { envStr } from '../server/src/services/env.js';

const app = createApp();

let dbReady;

async function ensureDb() {
  if (!dbReady) {
    const uri = envStr('MONGODB_URI');
    const jwtSecret = envStr('JWT_SECRET');
    if (!uri) {
      throw new Error('Missing MONGODB_URI');
    }
    if (!jwtSecret) {
      throw new Error('Missing JWT_SECRET');
    }
    dbReady = connectDb(uri);
  }
  await dbReady;
}

export default async function handler(req, res) {
  try {
    await ensureDb();
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'API is not configured' }));
    return;
  }

  return app(req, res);
}
