import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalkSession } from '@/types';

const KEY = '@saferoute_sessions';

export async function saveSession(session: WalkSession): Promise<void> {
  const all = await getAllSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) all[idx] = session;
  else all.unshift(session);
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

export async function getSession(id: string): Promise<WalkSession | null> {
  const all = await getAllSessions();
  return all.find((s) => s.id === id) ?? null;
}

export async function getAllSessions(): Promise<WalkSession[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WalkSession[];
  } catch {
    return [];
  }
}
