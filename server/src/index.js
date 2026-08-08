import { createApp } from './app.js';
import { connectDb } from './db.js';
import { envInt, envStr } from './services/env.js';

const app = createApp();
const port = envInt('PORT', 3000);

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
