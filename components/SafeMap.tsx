import { useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spotIcons } from '@/constants/theme';
import { Coordinates, SafeSpot } from '@/types';

interface Props {
  userLocation: Coordinates;
  destination: Coordinates;
  routeCoords: Coordinates[];
  safeSpots: SafeSpot[];
}

export function SafeMap({
  userLocation,
  destination,
  routeCoords,
  safeSpots,
}: Props) {
  const mapRef = useRef<MapView>(null);

  const latDelta =
    Math.max(
      Math.abs(userLocation.latitude - destination.latitude) * 2.5,
      0.015
    );
  const lngDelta =
    Math.max(
      Math.abs(userLocation.longitude - destination.longitude) * 2.5,
      0.015
    );

  const initialRegion = {
    latitude: (userLocation.latitude + destination.latitude) / 2,
    longitude: (userLocation.longitude + destination.longitude) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <Text style={styles.webTitle}>🗺️ Live Route Map</Text>
        <Text style={styles.webSub}>Use Expo Go on your phone for the full map</Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton
      zoomEnabled
      scrollEnabled
      rotateEnabled
    >
      <Marker
        coordinate={destination}
        title="Destination"
        pinColor="#818CF8"
      />

      <Marker
        coordinate={userLocation}
        title="You"
        pinColor="#22D3EE"
      />

      {safeSpots.map((spot) => (
        <Marker
          key={spot.id}
          coordinate={spot.coordinate}
          title={spot.name}
          description={spot.openLate ? 'Open late · Well lit' : 'Well lit'}
        >
          <View style={styles.spotMarker}>
            <Text style={styles.spotEmoji}>{spotIcons[spot.type]}</Text>
          </View>
        </Marker>
      ))}

      {routeCoords.length > 1 && (
        <Polyline
          coordinates={routeCoords}
          strokeColor={colors.accent}
          strokeWidth={5}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  spotMarker: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  spotEmoji: {
    fontSize: 16,
  },
  webFallback: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  webTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  webSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
