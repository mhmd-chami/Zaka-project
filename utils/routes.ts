import { Href } from 'expo-router';
import { UserRole } from '@/types';

export function getHomeRoute(role?: UserRole): Href {
  switch (role) {
    case 'owner':
      return '/(owner)/wallet' as Href;
    case 'admin':
      return '/(admin)/wallet' as Href;
    default:
      return '/(tabs)' as Href;
  }
}
