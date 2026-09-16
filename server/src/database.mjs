import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openDatabase(filename) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT UNIQUE NOT NULL,
      password_hash TEXT, role TEXT NOT NULL DEFAULT 'user', location_id TEXT,
      google_id TEXT UNIQUE, email TEXT, created_at TEXT NOT NULL,
      current_verification_id TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), provider_id TEXT UNIQUE NOT NULL,
      url TEXT NOT NULL, status TEXT NOT NULL, provider_status TEXT NOT NULL,
      environment TEXT NOT NULL, created_at TEXT NOT NULL, decision_at INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS webhook_events (
      hash TEXT PRIMARY KEY, verification_id TEXT NOT NULL, status TEXT NOT NULL, received_at TEXT NOT NULL
    );
  `);
  return db;
}
