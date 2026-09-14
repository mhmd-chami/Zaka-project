export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SafeSpot {
  id: string;
  name: string;
  type: 'police' | 'cafe' | 'hospital' | 'campus' | 'shop';
  coordinate: Coordinates;
  lit: boolean;
  openLate: boolean;
}

export interface WalkSession {
  id: string;
  destinationName: string;
  destination: Coordinates;
  start: Coordinates;
  routeCoords: Coordinates[];
  safeSpots: SafeSpot[];
  startedAt: string;
  status: 'active' | 'completed' | 'sos';
}

export interface DestinationPreset {
  id: string;
  name: string;
  emoji: string;
  coordinate: Coordinates;
}
