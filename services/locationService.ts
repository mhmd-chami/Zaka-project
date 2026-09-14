import * as Location from 'expo-location';
import { DEMO_CENTER } from '@/data/safeSpots';
import { Coordinates } from '@/types';

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentPosition(
  fallback: Coordinates = DEMO_CENTER
): Promise<Coordinates> {
  try {
    const loc = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('GPS timeout')), 10000)
      ),
    ]);
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch {
    return fallback;
  }
}

export async function watchPosition(
  onUpdate: (coords: Coordinates) => void
): Promise<Location.LocationSubscription | null> {
  try {
    return await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 3000,
        distanceInterval: 10,
      },
      (loc) => {
        onUpdate({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    );
  } catch {
    return null;
  }
}
