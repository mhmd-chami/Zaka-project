import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign, randomUUID } from 'node:crypto';
import { createApp } from '../src/app.mjs';
import { signVeriff } from '../src/veriff.mjs';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', use: 'sig', alg: 'RS256' };
const googleToken = (overrides = {}, header = {}) => {
  const encode = (data) => Buffer.from(JSON.stringify(data)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const input = `${encode({ alg: 'RS256', kid: 'test-key', ...header })}.${encode({ iss: 'https://accounts.google.com', aud: 'test-client', sub: 'google-user-1', email: 'test@example.test', email_verified: true, name: 'Google Test', exp: now + 3600, iat: now, ...overrides })}`;
  return `${input}.${sign('RSA-SHA256', Buffer.from(input), privateKey).toString('base64url')}`;
};

async function fixture(options = {}) {
  const providerCalls = [];
  const config = {
    databasePath: ':memory:', production: false, origins: ['http://localhost:8081'], googleClientIds: ['test-client'],
    veriff: { apiKey: 'test-api-key', secret: 'test-shared-secret', baseUrl: 'https://stationapi.veriff.com', callbackUrl: 'http://localhost:8081/verification', environment: 'test' },
    ...options,
  };
  const app = await createApp(config, { fetcher: async (url, request) => {
    if (url === 'https://www.googleapis.com/oauth2/v3/certs') return new Response(JSON.stringify({ keys: [jwk] }), { headers: { 'cache-control': 'max-age=3600' } });
    assert.equal(url, 'https://stationapi.veriff.com/v1/sessions');
    assert.equal(request.headers['X-HMAC-SIGNATURE'], signVeriff(request.body, config.veriff.secret));
    const input = JSON.parse(request.body);
    assert.ok(!input.verification.person, 'Do not forward unneeded personal data');
    const id = randomUUID();
    providerCalls.push({ id, userId: input.verification.vendorData });
    return new Response(JSON.stringify({ status: 'success', verification: { id, url: `https://magic.veriff.com/v/${id}` } }));
  } });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  async function request(path, { method = 'GET', data, token, headers = {} } = {}) {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', 'X-Zaka-Client': 'native', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, body: data === undefined ? undefined : JSON.stringify(data) });
    return { status: response.status, headers: response.headers, data: await response.json() };
  }
  async function signup(number = '+96171123456') {
    const result = await request('/v1/auth/signup', { method: 'POST', data: { name: 'Customer', phone: number, password: 'a-long-password', role: 'owner', status: 'approved' } });
    assert.equal(result.status, 201);
    return { token: result.data.accessToken, id: result.data.session.userId };
  }
  async function webhook(decision, overrides = {}) {
    const data = { status: 'success', verification: decision };
    return request('/v1/webhooks/veriff', { method: 'POST', data, headers: { 'x-auth-client': config.veriff.apiKey, 'x-hmac-signature': signVeriff(JSON.stringify(data), config.veriff.secret), ...overrides } });
  }
  return { ...app, request, signup, webhook, providerCalls, close: async () => { await new Promise((resolve) => app.server.close(resolve)); app.db.close(); } };
}

await test('accounts, authorization, cookies, session revocation and password hashing', async () => {
  const app = await fixture();
  try {
    const alice = await app.signup();
    const bob = await app.signup('+96171123457');
    const self = await app.request('/v1/auth/session', { token: alice.token });
    assert.equal(self.data.session.role, 'user', 'Signup cannot assign an owner role');
    assert.equal(self.data.user.password, undefined);
    assert.equal(self.data.user.password_hash, undefined);
    const stored = app.db.prepare('SELECT password_hash FROM users WHERE id=?').get(alice.id);
    assert.notEqual(stored.password_hash, 'a-long-password');
    assert.equal((await app.request(`/v1/users/${bob.id}`, { token: alice.token })).status, 403);
    assert.equal((await app.request('/v1/users', { token: alice.token })).data.users.length, 1);
    assert.equal((await app.request(`/v1/users/${bob.id}/role`, { token: alice.token, method: 'PATCH', data: { role: 'admin' } })).status, 403);
    assert.equal((await app.request('/v1/me', { token: alice.token, method: 'PATCH', data: { name: 'New name', role: 'owner', identityVerification: { status: 'approved' } } })).status, 200);
    assert.equal((await app.request('/v1/auth/session', { token: alice.token })).data.session.role, 'user');
    assert.equal((await app.request('/v1/verification', { token: alice.token })).data.verification, null);
    const browser = await app.request('/v1/auth/login', { method: 'POST', data: { phone: '+96171123456', password: 'a-long-password' }, headers: { 'X-Zaka-Client': 'web', Origin: 'http://localhost:8081' } });
    assert.equal(browser.status, 200);
    assert.equal(browser.data.accessToken, undefined);
    assert.match(browser.headers.get('set-cookie'), /HttpOnly/);
    assert.match(browser.headers.get('set-cookie'), /SameSite=Lax/);
    const cookie = browser.headers.get('set-cookie').split(';')[0];
    assert.equal((await app.request('/v1/auth/session', { headers: { Cookie: cookie } })).status, 200);
    assert.equal((await app.request('/v1/auth/logout', { method: 'POST', data: {}, token: alice.token, headers: { Origin: 'https://evil.test' } })).status, 403);
    assert.equal((await app.request('/v1/auth/logout', { method: 'POST', data: {}, token: alice.token, headers: { 'X-Zaka-Client': '' } })).status, 403);
    assert.equal((await app.request('/v1/me/password', { method: 'POST', token: alice.token, data: { currentPassword: 'wrong', newPassword: 'another-long-password' } })).status, 400);
    assert.equal((await app.request('/v1/me/password', { method: 'POST', token: alice.token, data: { currentPassword: 'a-long-password', newPassword: 'another-long-password' } })).status, 200);
    assert.equal((await app.request('/v1/auth/session', { token: alice.token })).status, 401);
    assert.equal((await app.request('/v1/auth/session', { headers: { Cookie: cookie } })).status, 401);
    const login = await app.request('/v1/auth/login', { method: 'POST', data: { phone: '+96171123456', password: 'another-long-password' } });
    assert.equal(login.status, 200);
    await app.request('/v1/auth/logout', { method: 'POST', data: {}, token: login.data.accessToken });
    assert.equal((await app.request('/v1/auth/session', { token: login.data.accessToken })).status, 401);
  } finally { await app.close(); }
});

await test('real Google signature, audience, expiry and subject verification', async () => {
  const app = await fixture();
  try {
    const post = (idToken, phone) => app.request('/v1/auth/google', { method: 'POST', data: { idToken, phone, email: 'forged@example.test', role: 'owner' } });
    for (const token of ['not-a-jwt', googleToken({ aud: 'wrong-client' }), googleToken({ exp: 1 }), googleToken({ iss: 'https://evil.test' }), googleToken({ email_verified: false }), googleToken({}, { alg: 'none' })]) {
      assert.equal((await post(token)).status, 401);
    }
    const valid = googleToken();
    const parts = valid.split('.');
    parts[1] = Buffer.from(JSON.stringify({ sub: 'forged', aud: 'test-client' })).toString('base64url');
    assert.equal((await post(parts.join('.'))).status, 401);
    const first = await post(valid);
    assert.equal(first.data.needsPhone, true);
    assert.equal(first.data.identity.email, 'test@example.test');
    const completed = await post(valid, '+96171123458');
    assert.equal(completed.status, 200);
    assert.equal(completed.data.session.role, 'user');
    const existing = await post(valid);
    assert.equal(existing.data.session.userId, completed.data.session.userId);
    assert.equal(existing.data.needsPhone, false);
  } finally { await app.close(); }
});

await test('verification requires consent, is idempotent, and trusts only signed provider decisions', async () => {
  const app = await fixture();
  try {
    const user = await app.signup();
    assert.equal((await app.request('/v1/verification/session', { method: 'POST', data: { consent: true } })).status, 401);
    assert.equal((await app.request('/v1/verification/session', { method: 'POST', token: user.token, data: { consent: false } })).status, 400);
    const start = () => app.request('/v1/verification/session', { method: 'POST', token: user.token, data: { consent: true, userId: 'forged', status: 'approved' } });
    const [first, repeated] = await Promise.all([start(), start()]);
    assert.equal(first.status, 200);
    assert.equal(first.data.verification.status, 'pending');
    assert.equal(first.data.url, repeated.data.url);
    assert.equal(app.providerCalls.length, 1);
    const remote = app.providerCalls[0];
    assert.equal(remote.userId, user.id);
    const now = Date.now();
    const approved = { id: remote.id, vendorData: user.id, endUserId: user.id, status: 'approved', code: 9001, decisionTime: new Date(now).toISOString(), document: { number: 'DO-NOT-STORE' } };
    assert.equal((await app.webhook(approved, { 'x-hmac-signature': '0'.repeat(64) })).status, 401);
    assert.equal((await app.webhook({ ...approved, vendorData: 'someone-else' })).status, 400);
    assert.equal((await app.webhook({ ...approved, code: 9102 })).status, 400);
    assert.equal((await app.webhook(approved)).status, 200);
    assert.equal((await app.webhook(approved)).status, 200);
    assert.equal(app.db.prepare('SELECT COUNT(*) AS count FROM webhook_events').get().count, 1);
    const verified = (await app.request('/v1/verification', { token: user.token })).data.verification;
    assert.equal(verified.status, 'approved');
    assert.equal(verified.environment, 'test', 'Test results must remain explicitly marked');
    assert.equal(verified.documentNumber, undefined);
    assert.equal((await app.webhook({ ...approved, status: 'declined', code: 9102, decisionTime: new Date(now - 1000).toISOString() })).status, 200);
    assert.equal((await app.request('/v1/verification', { token: user.token })).data.verification.status, 'approved');
    assert.equal((await start()).data.url, undefined, 'Already approved session is not recaptured');
  } finally { await app.close(); }
});

await test('missing provider credentials fail closed without creating a fake approval', async () => {
  const app = await fixture({ veriff: { baseUrl: 'https://stationapi.veriff.com', environment: 'test' }, googleClientIds: [] });
  try {
    const user = await app.signup();
    assert.equal((await app.request('/v1/verification', { token: user.token })).data.configured, false);
    assert.equal((await app.request('/v1/verification/session', { token: user.token, method: 'POST', data: { consent: true } })).status, 503);
    assert.equal((await app.request('/v1/verification', { token: user.token })).data.verification, null);
    assert.equal((await app.request('/v1/auth/google', { method: 'POST', data: { idToken: googleToken() } })).status, 503);
  } finally { await app.close(); }
});
