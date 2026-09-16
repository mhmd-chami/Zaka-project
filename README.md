# ZakaPay — Zaka Project

**Send money, receive payments, charge your phone, and shop — all in one app.**

> Demo wallet app for hackathon — uses local storage, no real payments.

## Features

- **Wallet** — balance, send & receive money by phone number
- **Top Up** — charge Alfa, Touch, or MTN numbers in dollars
- **Shop** — buy gift cards, subscriptions, and more
- **History** — full transaction log

## Tech Stack

| Layer | Choice |
|-------|--------|
| Mobile | React Native + Expo (TypeScript) |
| Navigation | Expo Router (tabs + stack) |
| Storage | AsyncStorage (offline demo wallet) |

## Quick Start

```bash
npm install
npm run backend
```

In a second terminal:

```bash
npm start
```

Scan QR with **Expo Go** on your phone.

Authentication now uses the Node/SQLite API. See [backend setup](server/README.md) for server environment variables, Veriff activation, Google login and local demo accounts. The camera verification flow is ready for Veriff credentials; live verification requires an activated provider account. Wallet payments remain a local demo.

If the school network blocks Expo services, use `npm run start:offline` after dependencies are installed.

If Expo Go reports an SDK mismatch, install the Android build for SDK 57 from [Expo's official download page](https://expo.dev/go?device=true&platform=android&sdkVersion=57), then restart `npm start`.

## Branch locations

Open **Wallet > Branch locations** to drag or zoom the map, show all four demo branches, open Google Maps, get directions, or share the selected location. The same coordinates are used for the pin and all external links. These are demo neighborhood/city points, not verified storefronts; edit `data/locations.ts` when real branch coordinates are available.

The web and Expo Go map use Esri street tiles and require internet. No additional native package or API key is needed. Sharing opens the device share sheet; browsers without sharing support copy the location or display a selectable link. A failed map connection leaves those actions available and offers a retry.

Map geometry and link regression checks (Node 22):

```bash
node --experimental-strip-types tests/branchMap.test.mjs
```

## Google sign-in (Android)

Google sign-in uses Android Credential Manager and therefore needs a development build; Expo Go does not include the native Google module.

1. In Google Cloud, create a Web OAuth client and an Android OAuth client for package `com.zaka.zakapay`.
2. Add the SHA-1 fingerprint of the certificate used to sign the Android build.
3. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to the Web client ID.
4. Build and run the native development app:

```bash
npx eas-cli login
npx eas-cli build --platform android --profile development
npm run start:dev
```

For iOS, replace the temporary `iosUrlScheme` in `app.json` with the reversed iOS client ID before building.

## Demo Flow (2-min pitch)

1. *"ZakaPay — pay friends, top up your line, shop instantly."*
2. Show **$150 balance** on wallet home
3. **Send $10** to a phone number
4. **Top Up** — charge Alfa number $10
5. **Shop** — buy Netflix or Steam card
6. Show **History** tab with all transactions

## Project Structure

```
app/
  (tabs)/index.tsx   # Wallet home
  (tabs)/shop.tsx    # Marketplace
  (tabs)/history.tsx # Transactions
  send.tsx           # Send money
  receive.tsx        # Receive + share number
  topup.tsx          # Mobile recharge
components/          # BalanceCard, ActionButton, etc.
services/            # walletStorage
data/                # shopItems, carriers
```

## License

MIT — Zaka Project Hackathon 2026
