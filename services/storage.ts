import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripPack } from '@/types';

const STORAGE_KEY = '@medpack_packs';

export async function savePack(pack: TripPack): Promise<void> {
  const packs = await getAllPacks();
  const index = packs.findIndex((p) => p.id === pack.id);
  if (index >= 0) {
    packs[index] = pack;
  } else {
    packs.unshift(pack);
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
}

export async function getAllPacks(): Promise<TripPack[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TripPack[];
  } catch {
    return [];
  }
}

export async function getPack(id: string): Promise<TripPack | null> {
  const packs = await getAllPacks();
  return packs.find((p) => p.id === id) ?? null;
}

export async function deletePack(id: string): Promise<void> {
  const packs = await getAllPacks();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(packs.filter((p) => p.id !== id))
  );
}
