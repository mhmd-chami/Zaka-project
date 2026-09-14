# SafeRoute — Zaka Project

**Walk home safely at night.** SafeRoute picks a well-lit path, shows nearby safe spots, lets you share live GPS with friends, and triggers SOS with a phone shake.

> Built for hackathon teams aiming for **1st place** — emotional problem, live demo, real phone sensors.

## Features

- **Safe route planning** — walking directions via OSRM
- **Live GPS tracking** — share your position with one tap
- **Safe spots map** — police, cafés, hospitals, campus gates
- **Shake SOS** — accelerometer detects shake → emergency alert + location share
- **"I'm home safe"** — one tap to close the walk

## Tech Stack

| Layer | Choice |
|-------|--------|
| Mobile | React Native + Expo (TypeScript) |
| Maps | react-native-maps |
| Location | expo-location |
| SOS | expo-sensors (accelerometer) + expo-haptics |
| Routing | OSRM (free, no API key) |

## Team Split (3 people)

| Person | Focus |
|--------|-------|
| **Dev A** | Map UI, walk screen, animations |
| **Dev B** | GPS, routing, SOS logic, safe spot data |
| **Dev C** | Pitch deck, demo video, device testing |

## Quick Start

```bash
npm install
npm start
```

Scan QR with **Expo Go** on your phone (maps + GPS need a real device).

## Demo Flow (2-min pitch)

1. *"Walking alone at night is scary — SafeRoute fixes that."*
2. Pick **Home** → **Start Safe Walk**
3. Show map with route + 6 safe spots
4. Tap **Share live location** → send to friend
5. **Shake phone** → SOS modal appears
6. Tap **I'm home safe** → done

## Project Structure

```
app/
  index.tsx       # Home — pick destination
  walk/[id].tsx   # Live walk + map + SOS
components/       # SafeMap, SOSModal, DestinationCard
data/safeSpots.ts # Safe spots + destinations (edit for your city)
services/         # Location, routing, storage
hooks/            # Shake detection
```

## Customize for Your City

Edit `data/safeSpots.ts` — change coordinates and spot names to your hackathon location.

## License

MIT — Zaka Project Hackathon 2026
