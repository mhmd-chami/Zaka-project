import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUsers, getSession } from '@/services/authStorage';
import { sendNotificationToUser } from '@/services/notificationStorage';
import {
  addTransactionForUser,
  getProfileByUserId,
  saveProfileByUserId,
  updateTransactionForUser,
} from '@/services/walletStorage';
import { CashOutRequest } from '@/types';

const CASH_OUT_KEY = '@zaka_cash_out_requests';

async function getAllRequests(): Promise<CashOutRequest[]> {
  const raw = await AsyncStorage.getItem(CASH_OUT_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAllRequests(requests: CashOutRequest[]): Promise<void> {
  await AsyncStorage.setItem(CASH_OUT_KEY, JSON.stringify(requests));
}

export async function getPendingCashOutsForLocation(
  locationId: string
): Promise<CashOutRequest[]> {
  const all = await getAllRequests();
  return all
    .filter((r) => r.locationId === locationId && r.status === 'pending')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function createCashOutRequest(
  locationId: string,
  locationName: string,
  amount: number
): Promise<{ ok: boolean; error?: string; reference?: string }> {
  if (amount <= 0) return { ok: false, error: 'Enter a valid amount' };

  const session = await getSession();
  if (!session) return { ok: false, error: 'Not logged in' };

  const profile = await getProfileByUserId(session.userId);
  if (amount > profile.balance) {
    return { ok: false, error: 'Not enough balance' };
  }

  const reference = `ZKC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const requestId = `co-${Date.now()}`;
  const now = new Date().toISOString();

  const request: CashOutRequest = {
    id: requestId,
    reference,
    userId: session.userId,
    userName: session.name,
    userPhone: session.phone,
    locationId,
    locationName,
    amount,
    status: 'pending',
    createdAt: now,
  };

  const all = await getAllRequests();
  all.unshift(request);
  await saveAllRequests(all);

  await addTransactionForUser(session.userId, {
    id: `tx-${Date.now()}`,
    type: 'cash_out',
    amount,
    title: 'Cash out request',
    subtitle: `${locationName} · Ref ${reference}`,
    createdAt: now,
    status: 'pending',
    transferId: requestId,
  });

  const users = await getAllUsers();
  const branchAdmins = users.filter(
    (u) => u.role === 'admin' && u.locationId === locationId
  );
  for (const admin of branchAdmins) {
    await sendNotificationToUser(
      admin.id,
      'Cash out request',
      `${session.name} (${session.phone}) wants to cash out $${amount.toFixed(2)} at ${locationName}. Ref: ${reference}`,
      'user'
    );
  }

  return { ok: true, reference };
}

export async function acceptCashOutRequest(
  requestId: string,
  adminUserId: string,
  adminLocationId?: string
): Promise<{ ok: boolean; error?: string }> {
  const all = await getAllRequests();
  const idx = all.findIndex((r) => r.id === requestId);
  if (idx < 0) return { ok: false, error: 'Request not found' };

  const request = all[idx];
  if (request.status !== 'pending') {
    return { ok: false, error: 'This request was already handled' };
  }
  if (adminLocationId && request.locationId !== adminLocationId) {
    return { ok: false, error: 'This request is for another branch' };
  }

  const userProfile = await getProfileByUserId(request.userId);
  if (request.amount > userProfile.balance) {
    return { ok: false, error: 'Customer does not have enough balance' };
  }

  userProfile.balance -= request.amount;
  await saveProfileByUserId(request.userId, userProfile);

  const completedAt = new Date().toISOString();

  all[idx] = {
    ...request,
    status: 'completed',
    completedAt,
    acceptedByUserId: adminUserId,
  };
  await saveAllRequests(all);

  await updateTransactionForUser(request.userId, request.id, {
    status: 'completed',
    title: 'Cash out',
    subtitle: `${request.locationName} · Ref ${request.reference}`,
  });

  await sendNotificationToUser(
    request.userId,
    'Cash out complete',
    `$${request.amount.toFixed(2)} was handed to you at ${request.locationName}. Ref: ${request.reference}`,
    'admin'
  );

  return { ok: true };
}
