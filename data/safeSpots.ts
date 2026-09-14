import { Coordinates, DestinationPreset, SafeSpot } from '@/types';

export const DEMO_CENTER: Coordinates = {
  latitude: 33.8938,
  longitude: 35.5018,
};

function offset(base: Coordinates, dLat: number, dLng: number): Coordinates {
  return {
    latitude: base.latitude + dLat,
    longitude: base.longitude + dLng,
  };
}

/** Build destinations near the user's GPS so the map always looks correct */
export function getDestinationsNear(here: Coordinates): DestinationPreset[] {
  return [
    {
      id: 'home',
      name: 'Home',
      emoji: '🏠',
      coordinate: offset(here, 0.004, 0.006),
    },
    {
      id: 'campus',
      name: 'University',
      emoji: '🎓',
      coordinate: offset(here, 0.008, -0.005),
    },
    {
      id: 'dorm',
      name: 'Dorm',
      emoji: '🛏️',
      coordinate: offset(here, -0.005, 0.004),
    },
    {
      id: 'metro',
      name: 'Metro',
      emoji: '🚇',
      coordinate: offset(here, 0.003, -0.008),
    },
  ];
}

/** Safe spots within ~1km of user */
export function getSafeSpotsNear(here: Coordinates): SafeSpot[] {
  return [
    {
      id: 's1',
      name: 'Police Station',
      type: 'police',
      coordinate: offset(here, 0.003, -0.004),
      lit: true,
      openLate: true,
    },
    {
      id: 's2',
      name: 'Late Night Café',
      type: 'cafe',
      coordinate: offset(here, 0.002, 0.003),
      lit: true,
      openLate: true,
    },
    {
      id: 's3',
      name: 'Campus Gate',
      type: 'campus',
      coordinate: offset(here, 0.006, -0.003),
      lit: true,
      openLate: false,
    },
    {
      id: 's4',
      name: '24h Market',
      type: 'shop',
      coordinate: offset(here, -0.003, 0.002),
      lit: true,
      openLate: true,
    },
    {
      id: 's5',
      name: 'Hospital',
      type: 'hospital',
      coordinate: offset(here, -0.005, -0.003),
      lit: true,
      openLate: true,
    },
    {
      id: 's6',
      name: 'Well-lit Plaza',
      type: 'shop',
      coordinate: offset(here, 0.001, 0.005),
      lit: true,
      openLate: true,
    },
  ];
}
