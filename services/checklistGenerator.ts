import { getTemplate } from '@/data/tripTemplates';
import { ChecklistItem, TripPack, TripType } from '@/types';

export function createPackFromTrip(tripType: TripType): TripPack {
  const template = getTemplate(tripType);
  if (!template) {
    throw new Error(`Unknown trip type: ${tripType}`);
  }

  const items: ChecklistItem[] = template.items.map((item) => ({
    ...item,
    packed: false,
  }));

  return {
    id: `${tripType}-${Date.now()}`,
    tripType,
    title: template.title,
    createdAt: new Date().toISOString(),
    items,
  };
}

export function getProgress(pack: TripPack) {
  const total = pack.items.length;
  const packed = pack.items.filter((i) => i.packed).length;
  return { packed, total, percent: total === 0 ? 0 : Math.round((packed / total) * 100) };
}

export function formatPackForShare(pack: TripPack): string {
  const { packed, total } = getProgress(pack);
  const lines = [
    `📦 MedPack — ${pack.title}`,
    `Progress: ${packed}/${total} items packed`,
    '',
    ...pack.items.map((item) => {
      const status = item.packed ? '✅' : '⬜';
      return `${status} ${item.name}`;
    }),
    '',
    'Generated with MedPack — Zaka Project Hackathon 2026',
  ];
  return lines.join('\n');
}
