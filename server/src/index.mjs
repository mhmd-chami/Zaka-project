import { resolve } from 'node:path';
import { createApp } from './app.mjs';

const production = process.env.NODE_ENV === 'production';
const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8081,http://127.0.0.1:8081').split(',').map((value) => value.trim()).filter(Boolean);
const veriffBase = new URL(process.env.VERIFF_BASE_URL || 'https://stationapi.veriff.com');
if (veriffBase.protocol !== 'https:' || !veriffBase.hostname.endsWith('.veriff.com')) throw new Error('VERIFF_BASE_URL must be an HTTPS Veriff API endpoint.');
const callbackUrl = process.env.VERIFF_CALLBACK_URL || 'http://localhost:8081/verification';
if (production && (new URL(callbackUrl).protocol !== 'https:' || origins.some((origin) => new URL(origin).protocol !== 'https:'))) throw new Error('Production callback and allowed origins must use HTTPS.');
const environment = process.env.VERIFF_ENVIRONMENT || 'test';
if (!['test', 'live'].includes(environment)) throw new Error('VERIFF_ENVIRONMENT must be test or live.');
const { server, db } = await createApp({
  production, origins, databasePath: resolve(process.env.DATABASE_PATH || './data/zaka.sqlite'),
  seedDemo: !production && process.env.SEED_DEMO_ACCOUNTS !== 'false',
  owner: { name: process.env.OWNER_NAME, phone: process.env.OWNER_PHONE, password: process.env.OWNER_PASSWORD },
  googleClientIds: (process.env.GOOGLE_CLIENT_IDS || '').split(',').map((value) => value.trim()).filter(Boolean),
  veriff: { baseUrl: veriffBase.href.replace(/\/$/, ''), apiKey: process.env.VERIFF_API_KEY, secret: process.env.VERIFF_SHARED_SECRET, callbackUrl, environment },
});
server.listen(Number(process.env.PORT || 3001), process.env.HOST || '0.0.0.0', () => console.log(`ZakaPay API listening on port ${process.env.PORT || 3001}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
