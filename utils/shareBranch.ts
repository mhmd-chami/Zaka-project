import { Share } from 'react-native';

export type ShareResult = 'shared' | 'copied' | 'manual' | 'dismissed';

export async function shareBranch(title: string, message: string): Promise<ShareResult> {
  const result = await Share.share({ title, message });
  return result.action === Share.dismissedAction ? 'dismissed' : 'shared';
}
