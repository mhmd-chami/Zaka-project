import { createHmac } from 'node:crypto';
import { ApiError, safeEqual } from './security.mjs';

export const signVeriff = (body, secret) => createHmac('sha256', secret).update(body).digest('hex');
export function veriffProvider(config, fetcher = fetch) {
  const configured = Boolean(config.apiKey && config.secret);
  return {
    configured,
    async create(userId) {
      if (!configured) throw new ApiError(503, 'Identity verification is not available yet. Please try again once the service is enabled.');
      const body = JSON.stringify({ verification: { vendorData: userId, endUserId: userId, callback: config.callbackUrl } });
      let response, payload;
      try {
        response = await fetcher(`${config.baseUrl}/v1/sessions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-AUTH-CLIENT': config.apiKey, 'X-HMAC-SIGNATURE': signVeriff(body, config.secret) },
          body, signal: AbortSignal.timeout(15000), redirect: 'error',
        });
        payload = await response.json();
      } catch { throw new ApiError(502, 'Could not start identity verification. Please try again.'); }
      if (!response.ok || payload.status !== 'success' || !payload.verification?.id) throw new ApiError(502, 'The verification provider could not start a session.');
      let url;
      try { url = new URL(payload.verification.url); } catch { throw new ApiError(502, 'The provider returned an invalid verification link.'); }
      if (url.protocol !== 'https:' || !/(^|\.)veriff\.(com|me)$/.test(url.hostname) || url.username || url.password) throw new ApiError(502, 'The provider returned an invalid verification link.');
      return { id: payload.verification.id, url: url.href };
    },
    authenticate(raw, headers) {
      if (!configured) throw new ApiError(503, 'Verification provider is not configured.');
      const signature = headers['x-hmac-signature'];
      if (headers['x-auth-client'] !== config.apiKey || typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)
        || !safeEqual(signVeriff(raw, config.secret), signature.toLowerCase())) throw new ApiError(401, 'Invalid webhook signature.');
    },
  };
}
