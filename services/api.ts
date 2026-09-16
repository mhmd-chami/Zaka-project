import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const host = Platform.OS === 'web'
  ? (typeof window === 'undefined' ? 'localhost' : window.location.hostname)
  : (Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost');
export const API_URL = (configuredUrl || `http://${host}:3001`).replace(/\/$/, '');
// Native bearer tokens stay in memory. Browser sessions use HttpOnly cookies.
let accessToken: string | undefined;
export function clearApiSession() { accessToken = undefined; }
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${API_URL}/v1${path}`, {
      method: options.method || 'GET', credentials: Platform.OS === 'web' ? 'include' : 'omit', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'X-Zaka-Client': Platform.OS === 'web' ? 'web' : 'native', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) clearApiSession();
      throw new ApiError(result.error || 'The request could not be completed.', response.status);
    }
    if (Platform.OS !== 'web' && typeof result.accessToken === 'string') accessToken = result.accessToken;
    return result as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Cannot reach the ZakaPay server. Check your connection and try again.', 0);
  } finally { clearTimeout(timeout); }
}
