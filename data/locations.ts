export interface ZakaLocation {
  id: string;
  name: string;
  address: string;
  area: string;
  hours: string;
}

export const zakaLocations: ZakaLocation[] = [
  {
    id: 'loc-1',
    name: 'ZakaPay Hamra',
    address: 'Hamra Main St, Beirut',
    area: 'Beirut',
    hours: '8am – 8pm',
  },
  {
    id: 'loc-2',
    name: 'ZakaPay Verdun',
    address: 'Verdun 732, Beirut',
    area: 'Beirut',
    hours: '9am – 9pm',
  },
  {
    id: 'loc-3',
    name: 'ZakaPay Tripoli',
    address: 'Azmi St, Tripoli',
    area: 'North',
    hours: '8am – 7pm',
  },
  {
    id: 'loc-4',
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
