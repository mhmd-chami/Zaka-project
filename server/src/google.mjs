import { createPublicKey, verify } from 'node:crypto';
import { ApiError } from './security.mjs';

// Only Google's fixed JWKS endpoint is trusted; never use a URL from the token.
export function googleVerifier(clientIds, fetcher = fetch) {
  let cache = { keys: [], expires: 0 };
  return async (idToken) => {
    if (!clientIds.length) throw new ApiError(503, 'Google sign-in is not configured on the server.');
    if (typeof idToken !== 'string' || idToken.length > 16000) throw new ApiError(401, 'Invalid Google sign-in token.');
    const parts = idToken.split('.');
    let header, claims;
    try {
      if (parts.length !== 3) throw new Error();
      header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error();
    } catch { throw new ApiError(401, 'Invalid Google sign-in token.'); }
    if (cache.expires <= Date.now()) {
      try {
        const response = await fetcher('https://www.googleapis.com/oauth2/v3/certs', { signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!Array.isArray(data.keys)) throw new Error();
        const ttl = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] || 300);
        cache = { keys: data.keys, expires: Date.now() + Math.min(ttl, 3600) * 1000 };
      } catch { throw new ApiError(503, 'Google sign-in is temporarily unavailable.'); }
    }
    const jwk = cache.keys.find((key) => key.kid === header.kid && key.kty === 'RSA' && key.use === 'sig');
    const now = Math.floor(Date.now() / 1000);
    let valid = false;
    try { valid = Boolean(jwk) && verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url')); } catch { /* Reject invalid keys/signatures. */ }
    if (!valid || !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)
      || !clientIds.includes(claims.aud) || !Number.isFinite(claims.exp) || claims.exp <= now
      || !Number.isFinite(claims.iat) || claims.iat > now + 60 || (claims.nbf && claims.nbf > now + 60)
      || typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 255
      || claims.email_verified !== true || typeof claims.email !== 'string') {
      throw new ApiError(401, 'Google sign-in could not be verified. Please sign in again.');
    }
    return { id: claims.sub, email: claims.email, name: (claims.name || claims.email.split('@')[0]).slice(0, 150) };
  };
}
