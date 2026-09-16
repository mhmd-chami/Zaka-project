import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derive = promisify(scrypt);
export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const tokenHash = (value) => createHash('sha256').update(value).digest('hex');
export const newToken = () => randomBytes(32).toString('base64url');
export function safeEqual(a, b) {
  const left = Buffer.from(a || ''), right = Buffer.from(b || '');
  return left.length === right.length && timingSafeEqual(left, right);
}
export function text(value, label, min = 1, max = 150) {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max) throw new ApiError(400, `Enter a valid ${label}.`);
  return value.trim();
}
export function phone(value) {
  const normalized = text(value, 'phone number', 8, 30).replace(/[\s()-]/g, '');
  if (!/^\+?[1-9]\d{7,14}$/.test(normalized)) throw new ApiError(400, 'Enter a phone number with country code.');
  return normalized.startsWith('+') ? normalized : `+${normalized}`;
}
export function password(value) {
  if (typeof value !== 'string' || value.length < 10 || value.length > 128) throw new ApiError(400, 'Use a password with 10 to 128 characters.');
  return value;
}
export async function hashPassword(value) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(value, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}
export async function checkPassword(value, encoded) {
  const [salt, expected] = (encoded || '').split(':');
  if (!salt || !expected || typeof value !== 'string' || value.length > 128) return false;
  const hash = await derive(value, salt, 64);
  return safeEqual(hash.toString('hex'), expected);
}
export function rateLimiter() {
  const entries = new Map();
  return (key, limit, windowMs) => {
    const now = Date.now();
    if (entries.size > 10000) for (const [id, entry] of entries) if (entry.until < now) entries.delete(id);
    const entry = entries.get(key);
    if (!entry || entry.until < now) { entries.set(key, { count: 1, until: now + windowMs }); return; }
    if (++entry.count > limit) throw new ApiError(429, 'Too many attempts. Please try again later.');
  };
}
