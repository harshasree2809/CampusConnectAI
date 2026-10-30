import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

async function start() {
  console.log('[DB] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // 10 s timeout
  });
  console.log('[DB] Connected to MongoDB:', MONGODB_URI.replace(/:\/\/.+@/, '://***@')); // hide password in logs

  const { app } = createApp();
  const port    = Number(process.env.PORT || 3001);
  const host    = process.env.HOST || '127.0.0.1';

  app.listen(port, host, () =>
    console.log(`Campus Connect API (MongoDB) listening on http://${host}:${port}`),
  );
}

start().catch(err => {
  console.error('[DB] Failed to connect to MongoDB:', err.message);
  console.error('     Make sure MONGODB_URI is set in .env and MongoDB is running.');
  process.exit(1);
});
