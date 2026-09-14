# MedPack — Zaka Project

**MedPack** is a mobile app for hackathon teams who need smart packing checklists for travel and emergencies.

> "What's in my bag?" — Pick a trip type, get an AI-ready checklist, scan items with your camera, and share with family.

## Features

- **4 trip templates**: Beach, Hiking, Conference, Hospital visit
- **Smart checklists** grouped by category (Medical, Documents, Tech, etc.)
- **Camera scan** to photo-verify packed items
- **Progress tracking** with visual progress bar
- **Share list** with family via native share sheet
- **Saved packs** — resume packing anytime

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo (TypeScript) |
| Navigation | Expo Router |
| Storage | AsyncStorage |
| Camera | expo-image-picker |

## Team Roles (3-person hackathon split)

| Person | Focus |
|--------|-------|
| **Developer A** | UI screens (`app/`, `components/`) |
| **Developer B** | Data & logic (`data/`, `services/`) |
| **Developer C** | Demo polish, pitch deck, testing on device |

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android emulator / device
npm run android

# Run on iOS (Mac only)
npm run ios
```

Scan the QR code with **Expo Go** on your phone to test instantly.

## Project Structure

```
Zaka-project/
├── app/                    # Screens (Expo Router)
│   ├── index.tsx           # Home — pick trip type
│   ├── checklist/[id].tsx  # Packing checklist
│   └── history.tsx         # Saved packs
├── components/             # Reusable UI
├── data/tripTemplates.ts   # Trip checklists
├── services/               # Storage & helpers
└── types/                  # TypeScript types
```

## Demo Flow (2-minute pitch)

1. Open app → choose **Hospital Visit**
2. Show auto-generated checklist (12 items)
3. Tap checkbox + **camera** to scan an item
4. Show progress bar hitting 100%
5. Tap **Share with family** → send list

## License

MIT — Zaka Project Hackathon 2026
