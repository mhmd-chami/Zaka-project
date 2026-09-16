import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDatabase } from './database.mjs';
import { googleVerifier } from './google.mjs';
import { veriffProvider } from './veriff.mjs';
import { ApiError, checkPassword, hashPassword, newToken, password, phone, rateLimiter, text, tokenHash } from './security.mjs';

const SESSION_AGE = 7 * 24 * 60 * 60 * 1000;
const JSON_BODY_LIMIT = 256 * 1024;
const DOCUMENT_BODY_LIMIT = 6 * 1024 * 1024;
const BRANCH_IDS = new Set(['loc-1', 'loc-2', 'loc-3', 'loc-4']);

function verificationPhotoDir(config) {
  if (config.verificationPhotoDir) return config.verificationPhotoDir;
  if (config.databasePath === ':memory:') return join(tmpdir(), 'zaka-verification-photos');
  return join(dirname(config.databasePath), 'verification-photos');
}

export async function createApp(config, { fetcher = fetch } = {}) {
  const db = openDatabase(config.databasePath);
  const photoDir = verificationPhotoDir(config);
  mkdirSync(photoDir, { recursive: true });
  const verifyGoogle = googleVerifier(config.googleClientIds || [], fetcher);
  const provider = veriffProvider(config.veriff, fetcher);
  const limit = rateLimiter();
  const creating = new Map();
  const dummyHash = await hashPassword(newToken());
  const byId = (id) => db.prepare('SELECT * FROM users WHERE id=?').get(id);
  const verificationRow = (user) => user.current_verification_id ? db.prepare('SELECT * FROM verifications WHERE id=?').get(user.current_verification_id) : null;
  function verificationView(row) {
    if (!row) return undefined;
    const provider = row.submission_method === 'document_questions' ? 'document' : 'veriff';
    return {
      id: row.id, provider, status: row.status, providerStatus: row.provider_status,
      submittedAt: row.created_at, reviewedAt: row.decision_at ? new Date(row.decision_at).toISOString() : undefined,
      environment: row.environment, documentType: row.document_type || undefined,
      documentNumber: row.document_number || undefined, fullName: row.full_name || undefined,
      dateOfBirth: row.date_of_birth || undefined, nationality: row.nationality || undefined,
      expiryDate: row.expiry_date || undefined, locationId: row.location_id || undefined,
    };
  }
  function branchVerificationView(row) {
    const applicant = byId(row.user_id);
    return {
      id: row.id, userId: row.user_id, userName: applicant?.name || 'Customer',
      userPhone: applicant?.phone || '', status: row.status, providerStatus: row.provider_status,
      submittedAt: row.created_at, documentType: row.document_type || undefined,
      documentNumber: row.document_number || undefined, fullName: row.full_name || undefined,
      dateOfBirth: row.date_of_birth || undefined, nationality: row.nationality || undefined,
      expiryDate: row.expiry_date || undefined, locationId: row.location_id || undefined,
      hasDocumentPhoto: Boolean(row.document_photo_path),
    };
  }
  function parseDocumentPhoto(data) {
    const raw = typeof data.documentPhotoBase64 === 'string' ? data.documentPhotoBase64.trim() : '';
    if (!raw) throw new ApiError(400, 'Document photo is required.');
    const cleaned = raw.replace(/^data:image\/\w+;base64,/, '');
    if (cleaned.length > 5 * 1024 * 1024) throw new ApiError(413, 'Document photo is too large.');
    let buffer;
    try { buffer = Buffer.from(cleaned, 'base64'); } catch { throw new ApiError(400, 'Invalid document photo.'); }
    if (buffer.length < 1000) throw new ApiError(400, 'Capture a clear photo of your document first.');
    return buffer;
  }
  function saveVerificationPhoto(verificationId, buffer) {
    const filename = `${verificationId}.jpg`;
    writeFileSync(join(photoDir, filename), buffer);
    return filename;
  }
  function submitDocumentVerification(user, data) {
    const current = verificationRow(byId(user.id));
    const sameEnvironment = current?.environment === config.veriff.environment;
    if (sameEnvironment && current?.status === 'approved') return { verification: verificationView(current) };
    if (sameEnvironment && current?.provider_status === 'review') return { verification: verificationView(current) };
    const documentType = ['lebanese_id', 'passport'].includes(data.documentType) ? data.documentType : null;
    if (!documentType) throw new ApiError(400, 'Choose Lebanese ID or passport.');
    if (data.documentCaptured !== true) throw new ApiError(400, 'Capture a clear photo of your document first.');
    const fullName = text(data.fullName, 'full name');
    const documentNumber = text(data.documentNumber, 'document number');
    const dateOfBirth = text(data.dateOfBirth, 'date of birth');
    const nationality = text(data.nationality, 'nationality');
    const expiryDate = text(data.expiryDate, 'expiry date');
    const locationId = typeof data.locationId === 'string' ? data.locationId.trim() : '';
    if (!BRANCH_IDS.has(locationId)) throw new ApiError(400, 'Choose a branch for verification.');
    const photoBuffer = parseDocumentPhoto(data);
    limit(`verify:${user.id}`, 5, 3600000);
    const id = randomUUID();
    const providerId = `document-${id}`;
    const status = 'pending';
    const providerStatus = 'review';
    db.exec('BEGIN IMMEDIATE');
    try {
      const photoPath = saveVerificationPhoto(id, photoBuffer);
      db.prepare(`INSERT INTO verifications (
        id,user_id,provider_id,url,status,provider_status,environment,created_at,decision_at,
        document_type,full_name,date_of_birth,document_number,nationality,expiry_date,submission_method,location_id,document_photo_path
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        id, user.id, providerId, '', status, providerStatus, config.veriff.environment,
        new Date().toISOString(), 0, documentType, fullName, dateOfBirth,
        documentNumber, nationality, expiryDate, 'document_questions', locationId, photoPath,
      );
      db.prepare('UPDATE users SET current_verification_id=? WHERE id=?').run(id, user.id);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    return { verification: verificationView(verificationRow(byId(user.id))) };
  }
  function listBranchVerifications(admin) {
    if (admin.role !== 'admin' || !admin.location_id) throw new ApiError(403, 'This action requires a branch administrator.');
    const rows = db.prepare(`
      SELECT * FROM verifications
      WHERE location_id=? AND submission_method='document_questions' AND status='pending' AND provider_status='review'
      ORDER BY created_at DESC
    `).all(admin.location_id);
    return { requests: rows.map(branchVerificationView) };
  }
  function decideBranchVerification(admin, verificationId, decision) {
    if (admin.role !== 'admin' || !admin.location_id) throw new ApiError(403, 'This action requires a branch administrator.');
    if (!['approve', 'reject'].includes(decision)) throw new ApiError(400, 'Decision must be approve or reject.');
    const row = db.prepare('SELECT * FROM verifications WHERE id=?').get(verificationId);
    if (!row || row.submission_method !== 'document_questions') throw new ApiError(404, 'Verification request not found.');
    if (row.location_id !== admin.location_id) throw new ApiError(403, 'This verification is for another branch.');
    if (row.status !== 'pending' || row.provider_status !== 'review') throw new ApiError(400, 'This verification was already decided.');
    const status = decision === 'approve' ? 'approved' : 'rejected';
    const providerStatus = decision === 'approve' ? 'approved' : 'declined';
    const now = Date.now();
    db.prepare('UPDATE verifications SET status=?,provider_status=?,decision_at=? WHERE id=?').run(status, providerStatus, now, row.id);
    const updated = db.prepare('SELECT * FROM verifications WHERE id=?').get(row.id);
    return { verification: verificationView(updated), applicantUserId: row.user_id };
  }
  function readBranchVerificationPhoto(admin, verificationId) {
    if (admin.role !== 'admin' || !admin.location_id) throw new ApiError(403, 'This action requires a branch administrator.');
    const row = db.prepare('SELECT * FROM verifications WHERE id=?').get(verificationId);
    if (!row || row.submission_method !== 'document_questions') throw new ApiError(404, 'Verification request not found.');
    if (row.location_id !== admin.location_id) throw new ApiError(403, 'This verification is for another branch.');
    if (!row.document_photo_path) throw new ApiError(404, 'Document photo not found.');
    return readFileSync(join(photoDir, row.document_photo_path));
  }
  function account(user, includeVerification = true) {
    return { id: user.id, name: user.name, phone: user.phone, role: user.role, locationId: user.location_id || undefined,
      authProvider: user.google_id ? 'google' : 'password', email: user.email || undefined, createdAt: user.created_at,
      identityVerification: includeVerification ? verificationView(verificationRow(user)) : undefined };
  }
  function sessionView(user) {
    const { id, identityVerification, createdAt, ...rest } = account(user, false);
    return { userId: id, ...rest };
  }
  async function createUser({ name, phone: number, password: secret, google, role = 'user', locationId }) {
    const id = randomUUID();
    const hash = secret ? await hashPassword(secret) : null;
    try {
      db.prepare('INSERT INTO users (id,name,phone,password_hash,role,location_id,google_id,email,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
        .run(id, name, number, hash, role, locationId || null, google?.id || null, google?.email || null, new Date().toISOString());
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) throw new ApiError(409, 'This phone number or Google account is already registered.');
      throw error;
    }
    return byId(id);
  }
  if (config.owner?.phone && config.owner?.password && !db.prepare('SELECT id FROM users WHERE phone=?').get(phone(config.owner.phone))) {
    await createUser({ name: config.owner.name || 'Zaka Owner', phone: phone(config.owner.phone), password: password(config.owner.password), role: 'owner' });
  }
  if (config.seedDemo) {
    if (config.production) throw new Error('Demo accounts are disabled in production.');
    const demos = [
      ['Zaka Owner', '+96170000001', 'owner123', 'owner', null],
      ['Hamra Admin', '+96170000002', 'admin123', 'admin', 'loc-1'],
      ['Verdun Admin', '+96170000003', 'admin123', 'admin', 'loc-2'],
      ['Tripoli Admin', '+96170000004', 'admin123', 'admin', 'loc-3'],
      ['Saida Admin', '+96170000005', 'admin123', 'admin', 'loc-4'],
    ];
    for (const [name, number, secret, role, locationId] of demos) {
      if (!db.prepare('SELECT id FROM users WHERE phone=?').get(number)) await createUser({ name, phone: number, password: secret, role, locationId });
    }
  }
  function tokenFrom(req) {
    const bearer = req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
    return bearer || req.headers.cookie?.split(';').map((item) => item.trim()).find((item) => item.startsWith('zaka_session='))?.slice(13) || '';
  }
  function authenticate(req) {
    const user = db.prepare('SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?').get(tokenHash(tokenFrom(req)), Date.now());
    if (!user) throw new ApiError(401, 'Please sign in again.');
    return user;
  }
  function cookie(token, clear = false) {
    return `zaka_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${clear ? 0 : SESSION_AGE / 1000}${config.production ? '; Secure' : ''}`;
  }
  function issueSession(req, res, user) {
    const token = newToken();
    db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(Date.now());
    // Rotate this client's previous session when signing in.
    db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(tokenFrom(req)));
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(tokenHash(token), user.id, Date.now() + SESSION_AGE);
    if (req.headers['x-zaka-client'] === 'web') res.setHeader('Set-Cookie', cookie(token));
    return { ok: true, session: sessionView(user), ...(req.headers['x-zaka-client'] === 'native' ? { accessToken: token } : {}) };
  }
  function staff(user) { if (!['admin', 'owner'].includes(user.role)) throw new ApiError(403, 'This action requires an administrator.'); }
  async function body(req, maxBytes = JSON_BODY_LIMIT) {
    if (!req.headers['content-type']?.startsWith('application/json')) throw new ApiError(415, 'Use application/json.');
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > maxBytes) throw new ApiError(413, 'Request is too large.');
      chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks);
    let data;
    try { data = JSON.parse(raw.toString('utf8')); } catch { throw new ApiError(400, 'Invalid JSON request.'); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError(400, 'Invalid request.');
    return { raw, data };
  }
  async function startVerification(user) {
    if (creating.has(user.id)) return creating.get(user.id);
    const pending = (async () => {
      const current = verificationRow(byId(user.id));
      const sameEnvironment = current?.environment === config.veriff.environment;
      if (sameEnvironment && (current?.status === 'approved' || current?.provider_status === 'review')) return { verification: verificationView(current) };
      if (sameEnvironment && current && ['pending', 'resubmission_requested'].includes(current.status) && Date.now() - Date.parse(current.created_at) < SESSION_AGE) {
        return { verification: verificationView(current), url: current.url };
      }
      limit(`verify:${user.id}`, 5, 3600000);
      const remote = await provider.create(user.id);
      const id = randomUUID();
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('INSERT INTO verifications (id,user_id,provider_id,url,status,provider_status,environment,created_at) VALUES (?,?,?,?,?,?,?,?)')
          .run(id, user.id, remote.id, remote.url, 'pending', 'created', config.veriff.environment, new Date().toISOString());
        db.prepare('UPDATE users SET current_verification_id=? WHERE id=?').run(id, user.id);
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
      return { verification: verificationView(verificationRow(byId(user.id))), url: remote.url };
    })();
    creating.set(user.id, pending);
    try { return await pending; } finally { creating.delete(user.id); }
  }
  function applyDecision(raw, payload) {
    const eventHash = tokenHash(raw);
    if (db.prepare('SELECT hash FROM webhook_events WHERE hash=?').get(eventHash)) return;
    const decision = payload.verification;
    if (payload.status !== 'success' || !decision?.id) throw new ApiError(400, 'Invalid decision event.');
    const row = db.prepare('SELECT * FROM verifications WHERE provider_id=?').get(decision.id);
    if (!row) throw new ApiError(404, 'Unknown verification session.');
    if ((decision.vendorData && decision.vendorData !== row.user_id) || (decision.endUserId && decision.endUserId !== row.user_id)) throw new ApiError(400, 'Verification user mismatch.');
    const states = { approved: ['approved', 9001], declined: ['rejected', 9102], resubmission_requested: ['resubmission_requested', 9103], review: ['pending', 9121], expired: ['expired', 9104], abandoned: ['expired', 9104] };
    const state = states[decision.status];
    if (!state || decision.code !== state[1]) throw new ApiError(400, 'Unsupported verification decision.');
    const decisionAt = Date.parse(decision.decisionTime || decision.acceptanceTime || '');
    if (!Number.isFinite(decisionAt) || decisionAt > Date.now() + 300000) throw new ApiError(400, 'Invalid decision timestamp.');
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare('INSERT INTO webhook_events VALUES (?,?,?,?)').run(eventHash, row.id, state[0], new Date().toISOString());
      // Old/repeated provider messages cannot overwrite a newer result.
      if (decisionAt > row.decision_at) {
        db.prepare('UPDATE verifications SET status=?,provider_status=?,decision_at=? WHERE id=?').run(state[0], decision.status, decisionAt, row.id);
      }
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  const server = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    const reply = (status, data) => { res.writeHead(status); res.end(JSON.stringify(data)); };
    try {
      const origin = req.headers.origin;
      if (origin && !config.origins.includes(origin)) throw new ApiError(403, 'Origin is not allowed.');
      if (origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Access-Control-Allow-Credentials', 'true'); res.setHeader('Vary', 'Origin'); }
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Zaka-Client');
        res.writeHead(204); res.end(); return;
      }
      const path = new URL(req.url, 'http://api.local').pathname;
      const method = req.method;
      if (path === '/health' && method === 'GET') return reply(200, { ok: true, verificationConfigured: provider.configured, verificationEnvironment: config.veriff.environment, googleConfigured: Boolean(config.googleClientIds?.length) });
      if (path === '/v1/webhooks/veriff' && method === 'POST') {
        const { raw, data } = await body(req);
        provider.authenticate(raw, req.headers);
        applyDecision(raw, data);
        return reply(200, { ok: true });
      }
      if (['POST', 'PATCH'].includes(method) && !['web', 'native'].includes(req.headers['x-zaka-client'])) throw new ApiError(403, 'Missing client header.');
      if (path.startsWith('/v1/auth/') && method === 'POST') limit(`auth:${req.socket.remoteAddress}`, 30, 60000);
      if (path === '/v1/auth/signup' && method === 'POST') {
        const { data } = await body(req);
        const user = await createUser({ name: text(data.name, 'name'), phone: phone(data.phone), password: password(data.password) });
        return reply(201, issueSession(req, res, user));
      }
      if (path === '/v1/auth/login' && method === 'POST') {
        const { data } = await body(req);
        const number = phone(data.phone);
        limit(`login:${number}`, 10, 600000);
        const user = db.prepare('SELECT * FROM users WHERE phone=?').get(number);
        const valid = await checkPassword(data.password, user?.password_hash || dummyHash);
        if (!valid || !user?.password_hash) throw new ApiError(401, 'Wrong phone number or password.');
        return reply(200, issueSession(req, res, user));
      }
      if (path === '/v1/auth/google' && method === 'POST') {
        const { data } = await body(req);
        const identity = await verifyGoogle(data.idToken);
        let user = db.prepare('SELECT * FROM users WHERE google_id=?').get(identity.id);
        if (!user && !data.phone) return reply(200, { needsPhone: true, identity });
        if (!user) user = await createUser({ name: identity.name, phone: phone(data.phone), google: identity });
        return reply(200, { ...issueSession(req, res, user), needsPhone: false });
      }
      if (path === '/v1/auth/logout' && method === 'POST') {
        db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(tokenFrom(req)));
        res.setHeader('Set-Cookie', cookie('', true));
        return reply(200, { ok: true });
      }
      const user = authenticate(req);
      if (path === '/v1/auth/session' && method === 'GET') return reply(200, { session: sessionView(user), user: account(user) });
      if (path === '/v1/users' && method === 'GET') {
        const users = user.role === 'user' ? [user] : db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT 1000').all();
        return reply(200, { users: users.map((item) => account(item)) });
      }
      if (path === '/v1/users/lookup' && method === 'POST') {
        limit(`lookup:${user.id}`, 30, 60000);
        const { data } = await body(req);
        const found = db.prepare('SELECT * FROM users WHERE phone=?').get(phone(data.phone));
        return reply(200, { user: found ? { id: found.id, name: found.name, phone: found.phone, role: found.role } : null });
      }
      const targetMatch = path.match(/^\/v1\/users\/([a-f0-9-]+)$/);
      if (targetMatch && method === 'GET') {
        if (targetMatch[1] !== user.id) staff(user);
        const target = byId(targetMatch[1]);
        if (!target) throw new ApiError(404, 'User not found.');
        return reply(200, { user: account(target) });
      }
      if (path === '/v1/me' && method === 'PATCH') {
        const { data } = await body(req);
        db.prepare('UPDATE users SET name=? WHERE id=?').run(text(data.name, 'name'), user.id);
        return reply(200, { ok: true, session: sessionView(byId(user.id)) });
      }
      if (path === '/v1/me/password' && method === 'POST') {
        const { data } = await body(req);
        limit(`password:${user.id}`, 5, 600000);
        if (!user.password_hash || !await checkPassword(data.currentPassword, user.password_hash)) throw new ApiError(400, 'Current password is incorrect.');
        const hash = await hashPassword(password(data.newPassword));
        db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, user.id);
        db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);
        return reply(200, issueSession(req, res, user));
      }
      const roleMatch = path.match(/^\/v1\/users\/([a-f0-9-]+)\/role$/);
      if (roleMatch && method === 'PATCH') {
        if (user.role !== 'owner') throw new ApiError(403, 'Only the owner can change roles.');
        const { data } = await body(req);
        const target = byId(roleMatch[1]);
        if (!target || target.role === 'owner' || !['user', 'admin'].includes(data.role)) throw new ApiError(400, 'Invalid role change.');
        db.prepare('UPDATE users SET role=? WHERE id=?').run(data.role, target.id);
        return reply(200, { ok: true });
      }
      if (path === '/v1/verification' && method === 'GET') return reply(200, { configured: provider.configured, environment: config.veriff.environment, verification: verificationView(verificationRow(user)) || null });
      if (path === '/v1/verification/session' && method === 'POST') {
        const { data } = await body(req);
        if (data.consent !== true) throw new ApiError(400, 'Please consent to verification before continuing.');
        return reply(200, await startVerification(user));
      }
      if (path === '/v1/verification/document' && method === 'POST') {
        const { data } = await body(req, DOCUMENT_BODY_LIMIT);
        if (data.consent !== true) throw new ApiError(400, 'Please consent to verification before continuing.');
        return reply(200, submitDocumentVerification(user, data));
      }
      if (path === '/v1/verification/branch' && method === 'GET') return reply(200, listBranchVerifications(user));
      const photoMatch = path.match(/^\/v1\/verification\/([a-f0-9-]+)\/photo$/);
      if (photoMatch && method === 'GET') {
        const photo = readBranchVerificationPhoto(user, photoMatch[1]);
        res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, no-store' });
        res.end(photo);
        return;
      }
      const decisionMatch = path.match(/^\/v1\/verification\/([a-f0-9-]+)\/decision$/);
      if (decisionMatch && method === 'POST') {
        const { data } = await body(req);
        return reply(200, decideBranchVerification(user, decisionMatch[1], data.decision));
      }
      throw new ApiError(404, 'Endpoint not found.');
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      // Do not log tokens, document data, provider responses or request bodies.
      if (status === 500) console.error('API request failed:', error.code || error.name);
      if (!res.headersSent) reply(status, { ok: false, error: status === 500 ? 'Something went wrong. Please try again.' : error.message });
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  return { server, db };
}
