# ZakaPay authentication and identity backend

This API replaces device-local accounts with SQLite-backed accounts and integrates Google sign-in and Veriff Document + Selfie verification. It needs Node **22.16 or newer** and has no npm runtime dependencies. SQLite is experimental in Node 22.

Wallet balances, transfers, purchases and notifications remain the app's local demo features. This is not a banking/payment backend. Phone numbers are contact identifiers; this implementation does not perform SMS ownership verification.

## Run locally

From the project root, in PowerShell:

```powershell
Copy-Item server/.env.example server/.env
npm run backend
```

Run `npm start` in a second terminal. The API listens on port 3001. `GET http://localhost:3001/health` reports readiness without exposing credentials. Signup/login work before Veriff or Google credentials are configured.

Set `EXPO_PUBLIC_API_URL` in the root `.env`. Use `http://localhost:3001` for the web app, or `http://YOUR-COMPUTER-LAN-IP:3001` for Expo Go on the same Wi-Fi. Without that variable, the app derives the development host and port 3001. Restart Expo after changing public environment variables. Add your browser's exact origin to backend `ALLOWED_ORIGINS` if using a LAN address or another Expo port. Public deployment must use HTTPS, a persistent database volume, restricted database access, backups, and a same-site frontend/API so browser session cookies work.

Existing device-local accounts are not silently imported. Create a backend account. Previous demo wallet data stays on the device. For local demonstrations only, set `SEED_DEMO_ACCOUNTS=true` in `server/.env` and `EXPO_PUBLIC_SHOW_DEMO_ACCOUNTS=true` in the root `.env` to enable the previously displayed owner/admin logins. The server rejects demo seeding in production. For a real owner, set `OWNER_PHONE`, `OWNER_NAME` and a strong `OWNER_PASSWORD` before the first server launch; this only creates a new account and never promotes an existing signup.

## Enable Veriff

1. Create a Veriff account and a **Document + Selfie** integration. Enable the required document countries and types. The hosted flow handles document capture, selfie/liveness and camera permissions.
2. Copy the integration API base URL, API key and shared secret into `VERIFF_BASE_URL`, `VERIFF_API_KEY` and `VERIFF_SHARED_SECRET` in `server/.env`. Keep the secret on the server; never use an `EXPO_PUBLIC_` variable for it.
3. Configure the **decision webhook** in the Veriff dashboard as `https://YOUR-PUBLIC-API/v1/webhooks/veriff`. Veriff cannot reach localhost; use a deployed HTTPS API or a development HTTPS tunnel. For a tunnel, point it at port 3001.
4. Set `VERIFF_CALLBACK_URL` to your reachable app verification page, such as `https://YOUR-APP/verification`. This is the customer's browser return URL, not the webhook. Native users can switch back to the app after capture; the app refreshes status when resumed.
5. Keep `VERIFF_ENVIRONMENT=test` while using test integration keys. A test approval is clearly labeled and **never displays the identity-verified badge**. Once the provider account is live, use live integration keys and `VERIFF_ENVIRONMENT=live`. Users can start a fresh live session after a test approval.
6. Restart the API. In the app, open **Profile > Verify identity**, consent, start a session, then choose **Scan ID with secure camera**. Veriff's hosted camera flow captures the ID and selfie; no photo is uploaded to ZakaPay.

Lebanese passports and IDs are listed in [Veriff's coverage table](https://www.veriff.com/supported-countries). **Arabic/non-Latin Lebanese identity cards require support enabled on the Enterprise plan.** Confirm document coverage with Veriff before relying on it. This integration cannot activate coverage on your behalf.

The API creates the provider session for the authenticated user; request-supplied user IDs or status fields cannot choose another account or grant approval. Decisions require an exact-body HMAC-SHA256 signature and the correct API-key header. Duplicate events are idempotent, older decisions are ignored, and an old session cannot replace the user's current session. A return URL or client-side camera success never grants approval. `review` remains pending; no app endpoint allows users or administrators to self-approve. Resolve provider review cases through your agreed Veriff process.

The database retains account details, hashed sessions, provider session references/URLs, status, timestamps and webhook hashes. It does not store identity document images, selfies, document numbers or raw webhook bodies. Configure retention/deletion of provider media in your Veriff account and protect database backups. Provider URLs should be treated as sensitive and are not logged.

References: [create session](https://devdocs.veriff.com/apidocs/v1sessions), [signed webhooks](https://devdocs.veriff.com/docs/webhooks-guide), [status codes](https://devdocs.veriff.com/docs/verification-session-status-codes-table).

## Enable Google sign-in

1. In Google Cloud, create/configure an OAuth **Web application** client and consent screen. Add `http://localhost:8081` (and the deployed app's HTTPS origin) to its **Authorized JavaScript origins**. Add test users if the consent screen is in testing.
2. Put this client ID in the app's `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and in backend `GOOGLE_CLIENT_IDS`. The latter supports a comma-separated allowlist of accepted audiences. The GIS web button sends the ID token to the API. A client secret is not required for this ID-token flow.
3. For Android, also configure an Android OAuth client for `com.zaka.zakapay` with the signing certificate's SHA-1 in the same project. For iOS, configure its client and replace the Google plugin's placeholder URL scheme in `app.json` with the actual reversed iOS client ID.
4. Native Google sign-in still requires an Expo **development build**. Adding a backend does not add the Google native module to Expo Go. Web Google sign-in works through Google's web button; phone/password and Veriff's hosted camera flow work in Expo Go.

The API verifies Google's RSA signature, issuer, audience, expiration and verified email before creating a session. Accounts are keyed by Google's `sub`; a client-supplied email/name cannot authenticate, and matching an email or phone does not silently link an existing account. [Google token verification guide](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## Authentication and operations

- Passwords use salted scrypt; new passwords must be 10–128 characters. Signup roles are always `user`.
- Browser sessions use HttpOnly, SameSite cookies; production also uses Secure. Native session tokens stay in memory, so an app restart requires signing in again. No passwords or tokens are written to AsyncStorage.
- Logout revokes the session; password changes revoke previous sessions. The frontend shows a network error if login cannot reach the API.
- JSON writes require a custom client header, and browser origins must be explicitly allowlisted. Rate limits apply to login, signup/Google, phone lookup, password changes and verification creation. This is a single-process SQLite service; horizontal deployments need shared rate limiting and a database designed for that deployment.
- Google account configuration, Veriff account activation, live document testing, HTTPS hosting and native-device testing must be completed with your own accounts. Test doubles in automated tests are not live verification results.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Configuration readiness |
| POST | `/v1/auth/signup`, `/v1/auth/login` | Password authentication |
| POST | `/v1/auth/google` | Verify Google token; request phone for a new account |
| GET | `/v1/auth/session` | Current server session/account |
| POST | `/v1/auth/logout` | Revoke session |
| GET | `/v1/users`, `/v1/users/:id` | Own account or staff-authorized directory |
| POST | `/v1/users/lookup` | Exact-phone recipient lookup with limited fields |
| PATCH | `/v1/me`, `/v1/users/:id/role` | Own name / owner-only role change |
| POST | `/v1/me/password` | Password change and session rotation |
| GET | `/v1/verification` | Own current status and provider readiness |
| POST | `/v1/verification/session` | Start/resume hosted capture with consent |
| POST | `/v1/webhooks/veriff` | Signed provider decisions only |

## Tests

```powershell
npm run test:backend
npx tsc --noEmit
```

Tests use a temporary in-memory database, locally signed Google-token fixtures and simulated signed Veriff decisions. They cover authorization, session revocation, password storage, forged/expired/wrong-audience Google tokens, webhook signatures, replay/order handling and missing provider configuration. They send no documents to an external provider.
