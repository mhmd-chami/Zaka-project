export interface Coordinate { latitude: number; longitude: number }
export interface MapViewport { x: number; y: number; zoom: number }
export const TILE_SIZE = 256;
export const MIN_ZOOM = 3;
export const MAX_ZOOM = 18;
export const MAP_TILE_SERVICE = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer';

export function project({ latitude, longitude }: Coordinate) {
  const clampedLatitude = Math.max(-85.05112878, Math.min(85.05112878, latitude));
  const sin = Math.sin(clampedLatitude * Math.PI / 180);
  return {
    x: (longitude + 180) / 360,
    y: Math.max(0, Math.min(1, 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI))),
  };
}

export function panViewport(view: MapViewport, dx: number, dy: number): MapViewport {
  const size = TILE_SIZE * 2 ** view.zoom;
  return { ...view, x: ((view.x - dx / size) % 1 + 1) % 1, y: Math.max(0, Math.min(1, view.y - dy / size)) };
}

export function fitCoordinates(coordinates: Coordinate[], width: number, height: number): MapViewport {
  const points = coordinates.map(project);
  if (!points.length) return { ...project({ latitude: 33.9, longitude: 35.5 }), zoom: 8 };
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const availableWidth = Math.max(1, width - 96);
  const availableHeight = Math.max(1, height - 128);
  const zoom = Math.floor(Math.min(
    Math.log2(availableWidth / (TILE_SIZE * Math.max(maxX - minX, 0.00001))),
    Math.log2(availableHeight / (TILE_SIZE * Math.max(maxY - minY, 0.00001))),
  ));
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, zoom: Math.max(MIN_ZOOM, Math.min(14, zoom)) };
}

export function mapTileUrl(zoom: number, x: number, y: number) {
  const count = 2 ** zoom;
  return `${MAP_TILE_SERVICE}/tile/${zoom}/${y}/${((x % count) + count) % count}`;
}

export function googleMapsUrl(coordinate: Coordinate, directions = false) {
  const point = encodeURIComponent(`${coordinate.latitude},${coordinate.longitude}`);
  return directions
    ? `https://www.google.com/maps/dir/?api=1&destination=${point}`
    : `https://www.google.com/maps/search/?api=1&query=${point}`;
}

export function branchShareMessage(name: string, area: string, coordinate: Coordinate) {
  return `${name}\nDemo location: ${area}, Lebanon (not a verified storefront)\n${googleMapsUrl(coordinate)}`;
}
