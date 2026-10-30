import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

async function start() {
  console.log('[DB] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log('[DB] Connected to MongoDB:', MONGODB_URI.replace(/:\/\/.+@/, '://***@'));

  const { app } = createApp();
  // IMPORTANT: Must bind to 0.0.0.0 on Render (not 127.0.0.1)
  // PORT is injected by Render automatically (usually 10000)
  const port = Number(process.env.PORT) || 10000;
  const host = '0.0.0.0';

  app.listen(port, host, () =>
    console.log(`Campus Connect API (MongoDB) listening on http://${host}:${port}`),
  );
}

start().catch(err => {
  console.error('[DB] Failed to connect to MongoDB:', err.message);
  console.error('     Make sure MONGODB_URI is set in .env and MongoDB is running.');
  process.exit(1);
});
