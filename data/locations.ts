export interface ZakaLocation {
  id: string;
  name: string;
  address: string;
  area: string;
  hours: string;
  /** Demo neighborhood/city point, not a verified storefront position. */
  coordinate: { latitude: number; longitude: number };
  mapArea: string;
}

export const zakaLocations: ZakaLocation[] = [
  {
    id: 'loc-1',
    mapArea: 'Hamra, Beirut',
    coordinate: { latitude: 33.896, longitude: 35.482 },
    name: 'ZakaPay Hamra',
    address: 'Hamra Main St, Beirut',
    area: 'Beirut',
    hours: '8am – 8pm',
  },
  {
    id: 'loc-2',
    mapArea: 'Verdun, Beirut',
    coordinate: { latitude: 33.884, longitude: 35.486 },
    name: 'ZakaPay Verdun',
    address: 'Verdun 732, Beirut',
    area: 'Beirut',
    hours: '9am – 9pm',
  },
  {
    id: 'loc-3',
    mapArea: 'Tripoli',
    coordinate: { latitude: 34.436, longitude: 35.839 },
    name: 'ZakaPay Tripoli',
    address: 'Azmi St, Tripoli',
    area: 'North',
    hours: '8am – 7pm',
  },
  {
    id: 'loc-4',
    mapArea: 'Saida',
    coordinate: { latitude: 33.561, longitude: 35.375 },
    name: 'ZakaPay Saida',
    address: 'Riad El Solh, Saida',
    area: 'South',
    hours: '8am – 7pm',
  },
];

export function getLocationById(id?: string): ZakaLocation | null {
  if (!id) return null;
  return zakaLocations.find((l) => l.id === id) ?? null;
}
