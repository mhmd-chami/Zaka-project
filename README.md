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
npm start
```

Scan QR with **Expo Go** on your phone.

If the school network blocks Expo services, use `npm run start:offline` after dependencies are installed.

If Expo Go reports an SDK mismatch, install the Android build for SDK 57 from [Expo's official download page](https://expo.dev/go?device=true&platform=android&sdkVersion=57), then restart `npm start`.

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
