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
