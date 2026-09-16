import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Linking, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent, ViewStyle } from 'react-native';
import { zakaLocations } from '@/data/locations';
import { fitCoordinates, MAP_TILE_SERVICE, mapTileUrl, MAX_ZOOM, MIN_ZOOM, panViewport, project, TILE_SIZE } from '@/utils/branchMap';
import type { MapViewport } from '@/utils/branchMap';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  onInteractionChange: (active: boolean) => void;
}

const webGestureStyle = { cursor: 'grab', touchAction: 'none' } as unknown as ViewStyle;

interface Tile { id: string; uri: string; x: number; y: number }
type TileStatus = 'loaded' | 'error';

function MapTile({ tile, onStatus }: { tile: Tile; onStatus: (id: string, status: TileStatus) => void }) {
  const source = useMemo(() => ({ uri: tile.uri }), [tile.uri]);
  const onLoad = useCallback(() => onStatus(tile.id, 'loaded'), [tile.id, onStatus]);
  const onError = useCallback(() => onStatus(tile.id, 'error'), [tile.id, onStatus]);
  return <Image source={source} style={{ position: 'absolute', left: tile.x, top: tile.y, width: TILE_SIZE, height: TILE_SIZE }} onLoad={onLoad} onError={onError} accessible={false} />;
}

function touchDistance(event: GestureResponderEvent) {
  const touches = event.nativeEvent.touches;
  return touches.length < 2 ? 0 : Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
}

export function BranchMap({ selectedId, onSelect, onInteractionChange }: Props) {
  const selected = zakaLocations.find((location) => location.id === selectedId) ?? zakaLocations[0];
  const [layout, setLayout] = useState({ width: 0, height: 360 });
  const [viewport, setViewport] = useState<MapViewport>({ ...project(selected.coordinate), zoom: 13 });
  const [retry, setRetry] = useState(0);
  const [tileStates, setTileStates] = useState<Record<string, 'loaded' | 'error'>>({});
  const currentView = useRef(viewport);
  currentView.current = viewport;
  const interactionCallback = useRef(onInteractionChange);
  interactionCallback.current = onInteractionChange;
  const gesture = useRef({ view: viewport, dx: 0, dy: 0, distance: 0 });

  useEffect(() => {
    setViewport({ ...project(selected.coordinate), zoom: 13 });
  }, [selected.id]);

  useEffect(() => () => interactionCallback.current(false), []);

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      gesture.current = { view: currentView.current, dx: 0, dy: 0, distance: touchDistance(event) };
      interactionCallback.current(true);
    },
    onPanResponderMove: (event, state) => {
      const distance = touchDistance(event);
      const start = gesture.current;
      if (Boolean(distance) !== Boolean(start.distance)) {
        gesture.current = { view: currentView.current, dx: state.dx, dy: state.dy, distance };
        return;
      }
      const zoom = distance && start.distance
        ? Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, start.view.zoom + Math.round(Math.log2(distance / start.distance))))
        : start.view.zoom;
      setViewport({ ...panViewport(start.view, state.dx - start.dx, state.dy - start.dy), zoom });
    },
    onPanResponderRelease: () => interactionCallback.current(false),
    onPanResponderTerminate: () => interactionCallback.current(false),
    onPanResponderTerminationRequest: () => false,
  }), []);

  const worldSize = TILE_SIZE * 2 ** viewport.zoom;
  const left = viewport.x * worldSize - layout.width / 2;
  const top = viewport.y * worldSize - layout.height / 2;
  const tiles: Tile[] = [];
  if (layout.width > 0) {
    for (let x = Math.floor(left / TILE_SIZE); x <= Math.floor((left + layout.width) / TILE_SIZE); x++) {
      for (let y = Math.max(0, Math.floor(top / TILE_SIZE)); y <= Math.min(2 ** viewport.zoom - 1, Math.floor((top + layout.height) / TILE_SIZE)); y++) {
        tiles.push({ id: `${retry}/${viewport.zoom}/${x}/${y}`, uri: mapTileUrl(viewport.zoom, x, y), x: x * TILE_SIZE - left, y: y * TILE_SIZE - top });
      }
    }
  }
  const failed = tiles.some((tile) => tileStates[tile.id] === 'error');
  const loading = tiles.length > 0 && !failed && tiles.some((tile) => !tileStates[tile.id]);
  const visibleTileIds = tiles.map((tile) => tile.id).join('|');

  useEffect(() => {
    if (!visibleTileIds) return;
    const timeout = setTimeout(() => {
      setTileStates((states) => {
        const missing = visibleTileIds.split('|').filter((id) => !states[id]);
        if (!missing.length) return states;
        return { ...states, ...Object.fromEntries(missing.map((id) => [id, 'error' as const])) };
      });
    }, 15000);
    return () => clearTimeout(timeout);
  }, [visibleTileIds]);

  const recordTile = useCallback((id: string, status: TileStatus) => {
    // Cached web images may report onLoad again when their props change.
    // Keep an unchanged state object to avoid a render/onLoad loop.
    setTileStates((states) => states[id] === status ? states : { ...states, [id]: status });
  }, []);

  function changeZoom(delta: number) {
    setViewport((view) => ({ ...view, zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, view.zoom + delta)) }));
  }

  return (
    <View testID="branch-map" style={styles.map} onLayout={(event) => setLayout(event.nativeEvent.layout)}>
      <View
        {...responder.panHandlers}
        testID="map-drag-surface"
        style={[StyleSheet.absoluteFill, Platform.OS === 'web' ? webGestureStyle : null]}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {tiles.map((tile) => <MapTile key={tile.id} tile={tile} onStatus={recordTile} />)}
        </View>
      </View>
      {zakaLocations.map((location, index) => {
        const point = project(location.coordinate);
        // Wrap longitude to the nearest visible copy of the world.
        const dx = ((point.x - viewport.x + 1.5) % 1) - 0.5;
        const x = layout.width / 2 + dx * worldSize;
        const y = layout.height / 2 + (point.y - viewport.y) * worldSize;
        if (x < -30 || x > layout.width + 30 || y < -30 || y > layout.height + 30) return null;
        const active = selectedId === location.id;
        return (
          <Pressable
            key={location.id}
            accessibilityRole="button"
            accessibilityLabel={`Show ${location.name}, demo location`}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(location.id)}
            style={[styles.pin, { left: x - 20, top: y - 40 }, active && styles.activePin]}
          >
            <Text style={styles.pinText}>{index + 1}</Text>
          </Pressable>
        );
      })}
      <View style={styles.topControls}>
        <Pressable accessibilityRole="button" onPress={() => setViewport(fitCoordinates(zakaLocations.map((location) => location.coordinate), layout.width, layout.height))} style={styles.smallButton}>
          <Text style={styles.controlText}>All branches</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Recenter on selected branch" onPress={() => setViewport({ ...project(selected.coordinate), zoom: 13 })} style={styles.smallButton}>
          <Text style={styles.controlText}>Recenter</Text>
        </Pressable>
      </View>
      <View style={styles.zoomControls}>
        <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" disabled={viewport.zoom === MAX_ZOOM} onPress={() => changeZoom(1)} style={[styles.zoomButton, viewport.zoom === MAX_ZOOM && styles.disabled]}><Text style={styles.symbol}>+</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" disabled={viewport.zoom === MIN_ZOOM} onPress={() => changeZoom(-1)} style={[styles.zoomButton, viewport.zoom === MIN_ZOOM && styles.disabled]}><Text style={styles.symbol}>−</Text></Pressable>
      </View>
      {loading ? <View pointerEvents="none" style={styles.loading}><ActivityIndicator size="small" color="#145d47" /><Text style={styles.controlText}>Loading map</Text></View> : null}
      {failed ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>Map could not load. You can still open or share this location below.</Text>
          <Pressable accessibilityRole="button" onPress={() => { setTileStates({}); setRetry((value) => value + 1); }} style={styles.retry}><Text style={styles.controlText}>Retry map</Text></Pressable>
        </View>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.hint}>Drag to move · + / − to zoom</Text>
        <Pressable accessibilityRole="link" onPress={() => { Linking.openURL(MAP_TILE_SERVICE).catch(() => {}); }}>
          <Text style={styles.attribution}>Tiles © Esri · HERE, Garmin, USGS & contributors</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, overflow: 'hidden', backgroundColor: '#e9eee8' },
  pin: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderBottomRightRadius: 4, backgroundColor: '#344b43', borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  activePin: { backgroundColor: '#b47921', zIndex: 1 },
  pinText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  topControls: { position: 'absolute', left: 10, top: 10, flexDirection: 'row', gap: 8, zIndex: 2 },
  smallButton: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: '#d6dfd9' },
  controlText: { color: '#145d47', fontSize: 12, fontWeight: '700' },
  zoomControls: { position: 'absolute', right: 10, top: 68, gap: 6, zIndex: 2 },
  zoomButton: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d6dfd9' },
  disabled: { opacity: 0.5 },
  symbol: { fontSize: 28, color: '#16382e' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fffffff2', padding: 8, gap: 3, zIndex: 2 },
  hint: { color: '#365248', fontSize: 11 },
  attribution: { color: '#365248', fontSize: 10, textDecorationLine: 'underline' },
  loading: { position: 'absolute', bottom: 62, left: 10, backgroundColor: '#fff', borderRadius: 8, padding: 10, flexDirection: 'row', gap: 8, alignItems: 'center' },
  error: { position: 'absolute', bottom: 62, left: 10, right: 64, padding: 12, backgroundColor: '#fff', borderRadius: 10, gap: 8, zIndex: 2 },
  errorText: { color: '#333', fontSize: 12, lineHeight: 18 },
  retry: { paddingVertical: 8 },
});
