import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUsers } from '@/services/authStorage';
import { sendNotificationToUser } from '@/services/notificationStorage';

const KEY_PREFIX = '@zaka_verification_photo_';

function photoKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

function photoBase64Key(userId: string): string {
  return `${KEY_PREFIX}${userId}_b64`;
}

export async function saveDocumentPhoto(
  userId: string,
  uri: string,
  base64?: string
): Promise<void> {
  await AsyncStorage.setItem(photoKey(userId), uri);
  if (base64) await AsyncStorage.setItem(photoBase64Key(userId), base64);
  else await AsyncStorage.removeItem(photoBase64Key(userId));
}

export async function getDocumentPhoto(userId: string): Promise<string | null> {
  return AsyncStorage.getItem(photoKey(userId));
}

export async function getDocumentPhotoBase64(userId: string): Promise<string | null> {
  return AsyncStorage.getItem(photoBase64Key(userId));
}

export async function clearDocumentPhoto(userId: string): Promise<void> {
  await AsyncStorage.multiRemove([photoKey(userId), photoBase64Key(userId)]);
}

export async function notifyBranchVerificationAdmins(
  locationId: string,
  locationName: string,
  userName: string,
  userPhone: string
): Promise<void> {
  const admins = (await getAllUsers()).filter(
    (user) => user.role === 'admin' && user.locationId === locationId
  );
  for (const admin of admins) {
    await sendNotificationToUser(
      admin.id,
      'New identity verification',
      `${userName} (${userPhone}) submitted ID verification for ${locationName}. Review in branch requests.`,
      'user'
    );
  }
}
