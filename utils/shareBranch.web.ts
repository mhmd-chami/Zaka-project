import type { ShareResult } from './shareBranch';

export async function shareBranch(title: string, message: string): Promise<ShareResult> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text: message });
      return 'shared';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return 'dismissed';
      // Some browsers expose sharing but do not support it on this device.
    }
  }
  try {
    await navigator.clipboard.writeText(message);
    return 'copied';
  } catch {
    return 'manual';
  }
}
