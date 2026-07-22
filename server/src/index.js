import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDb } from './db.js';
import authRoutes from './routes/auth.js';
import cvRoutes from './routes/cvs.js';
import aiRoutes from './routes/ai.js';
import { envInt, envStr } from './services/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = envInt('PORT', 3000);
const origin = envStr('CLIENT_ORIGIN', 'http://localhost:4200');

app.use(morgan('dev'));
app.use(
  cors({
    origin,
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

async function boot() {
  const uri = envStr('MONGODB_URI');
  if (!uri) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  if (!envStr('JWT_SECRET')) {
    console.error('Missing JWT_SECRET');
    process.exit(1);
  }

  await connectDb(uri);
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

boot().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
