import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import cvRoutes from './routes/cvs.js';
import aiRoutes from './routes/ai.js';
import { envStr } from './services/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

function parseOrigins(value) {
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();
  const origins = parseOrigins(envStr('CLIENT_ORIGIN', 'http://localhost:4200'));

  app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origins.includes('*') || origins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
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

  return app;
}
