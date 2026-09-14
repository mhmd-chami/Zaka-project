import { Coordinates } from '@/types';

export async function fetchWalkingRoute(
  start: Coordinates,
  end: Coordinates
): Promise<Coordinates[]> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/foot/` +
      `${start.longitude},${start.latitude};${end.longitude},${end.latitude}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        })
      );
    }
  } catch {
    // fall through to straight line
  }

  return interpolateRoute(start, end, 12);
}

function interpolateRoute(
  start: Coordinates,
  end: Coordinates,
  points: number
): Coordinates[] {
  const coords: Coordinates[] = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    coords.push({
      latitude: start.latitude + (end.latitude - start.latitude) * t,
      longitude: start.longitude + (end.longitude - start.longitude) * t,
    });
  }
  return coords;
}

export function formatCoords(c: Coordinates): string {
  return `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`;
}

export function mapsLink(c: Coordinates): string {
  return `https://maps.google.com/?q=${c.latitude},${c.longitude}`;
}
