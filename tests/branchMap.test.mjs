import assert from 'node:assert/strict';
import test from 'node:test';
import { project, panViewport, fitCoordinates, googleMapsUrl, branchShareMessage, mapTileUrl, TILE_SIZE } from '../utils/branchMap.ts';
import { zakaLocations } from '../data/locations.ts';

test('panning moves geographic markers with the map, rather than leaving them in the center', () => {
  const point = project(zakaLocations[0].coordinate);
  const view = { ...point, zoom: 13 };
  const dragged = panViewport(view, 100, -50);
  const size = TILE_SIZE * 2 ** view.zoom;
  assert.ok(Math.abs((point.x - dragged.x) * size - 100) < 0.001);
  assert.ok(Math.abs((point.y - dragged.y) * size + 50) < 0.001);
});

test('all branches fit inside both phone and desktop map viewports', () => {
  for (const width of [280, 390, 1200]) {
    const height = 360;
    const view = fitCoordinates(zakaLocations.map((location) => location.coordinate), width, height);
    const size = TILE_SIZE * 2 ** view.zoom;
    for (const branch of zakaLocations) {
      const point = project(branch.coordinate);
      const x = width / 2 + (point.x - view.x) * size;
      const y = height / 2 + (point.y - view.y) * size;
      assert.ok(x >= 48 && x <= width - 48, `${branch.id} fits horizontally at ${width}px`);
      assert.ok(y >= 64 && y <= height - 64, `${branch.id} fits vertically at ${width}px`);
    }
  }
});

test('Google Maps, directions and sharing all use the exact demo marker coordinate', () => {
  for (const branch of zakaLocations) {
    const point = `${branch.coordinate.latitude},${branch.coordinate.longitude}`;
    const search = new URL(googleMapsUrl(branch.coordinate));
    const directions = new URL(googleMapsUrl(branch.coordinate, true));
    assert.equal(search.searchParams.get('query'), point);
    assert.equal(directions.searchParams.get('destination'), point);
    assert.equal(search.searchParams.get('api'), '1');
    const message = branchShareMessage(branch.name, branch.mapArea, branch.coordinate);
    assert.ok(message.includes(search.href));
    assert.ok(message.includes('Demo location:'));
    assert.ok(message.includes('not a verified storefront'));
  }
});

test('map remains finite at the poles and wraps tiles at the date line', () => {
  for (const latitude of [-90, 90]) {
    const point = project({ latitude, longitude: 180 });
    assert.ok(Number.isFinite(point.y));
    assert.ok(point.y >= 0 && point.y <= 1);
  }
  assert.ok(mapTileUrl(3, -1, 2).endsWith('/tile/3/2/7'));
  assert.ok(mapTileUrl(3, 8, 2).endsWith('/tile/3/2/0'));
  assert.ok(!mapTileUrl(3, 0, 2).includes('openstreetmap'));
});
