import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUsers } from '@/services/authStorage';
import { sendNotificationToUser } from '@/services/notificationStorage';
import {
  addTransactionForUser,
  getProfileByUserId,
  saveProfileByUserId,
  updateTransactionForUser,
} from '@/services/walletStorage';
import { BranchTransfer } from '@/types';

const TRANSFERS_KEY = '@zaka_branch_transfers';

async function getAllTransfers(): Promise<BranchTransfer[]> {
  const raw = await AsyncStorage.getItem(TRANSFERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAllTransfers(transfers: BranchTransfer[]): Promise<void> {
  await AsyncStorage.setItem(TRANSFERS_KEY, JSON.stringify(transfers));
}

export async function getPendingTransfersForLocation(
  locationId: string
): Promise<BranchTransfer[]> {
  const all = await getAllTransfers();
  return all
    .filter((t) => t.locationId === locationId && t.status === 'pending')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function createBranchTransfer(
  senderUserId: string,
  senderName: string,
  senderPhone: string,
  locationId: string,
  locationName: string,
  amount: number
): Promise<{ ok: boolean; error?: string; reference?: string; transferId?: string }> {
  const profile = await getProfileByUserId(senderUserId);
  if (amount > profile.balance) {
    return { ok: false, error: 'Not enough balance' };
  }

  const reference = `ZKP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const transferId = `bt-${Date.now()}`;
  const now = new Date().toISOString();

  const transfer: BranchTransfer = {
    id: transferId,
    reference,
    senderUserId,
    senderName,
    senderPhone,
    locationId,
    locationName,
    amount,
    status: 'pending',
    createdAt: now,
  };

  const all = await getAllTransfers();
  all.unshift(transfer);
  await saveAllTransfers(all);

  await addTransactionForUser(senderUserId, {
    id: `tx-${Date.now()}`,
    type: 'send_cash',
    amount,
    title: 'Send to branch',
    subtitle: `${locationName} · Ref ${reference}`,
    createdAt: now,
    status: 'pending',
    transferId,
  });

  const users = await getAllUsers();
  const branchAdmins = users.filter(
    (u) => u.role === 'admin' && u.locationId === locationId
  );
  for (const admin of branchAdmins) {
    await sendNotificationToUser(
      admin.id,
      'New branch send request',
      `${senderName} (${senderPhone}) wants to send $${amount.toFixed(2)} to ${locationName}. Ref: ${reference}`,
      'user'
    );
  }

  return { ok: true, reference, transferId };
}

export async function acceptBranchTransfer(
  transferId: string,
  adminUserId: string,
  adminLocationId?: string
): Promise<{ ok: boolean; error?: string }> {
  const all = await getAllTransfers();
  const idx = all.findIndex((t) => t.id === transferId);
  if (idx < 0) return { ok: false, error: 'Request not found' };

  const transfer = all[idx];
  if (transfer.status !== 'pending') {
    return { ok: false, error: 'This request was already handled' };
  }
  if (adminLocationId && transfer.locationId !== adminLocationId) {
    return { ok: false, error: 'This request is for another branch' };
  }

  const senderProfile = await getProfileByUserId(transfer.senderUserId);
  if (transfer.amount > senderProfile.balance) {
    return { ok: false, error: 'Sender does not have enough balance' };
  }

  senderProfile.balance -= transfer.amount;
  await saveProfileByUserId(transfer.senderUserId, senderProfile);

  const adminProfile = await getProfileByUserId(adminUserId);
  adminProfile.balance += transfer.amount;
  await saveProfileByUserId(adminUserId, adminProfile);

  const completedAt = new Date().toISOString();

  all[idx] = {
    ...transfer,
    status: 'completed',
    completedAt,
    acceptedByUserId: adminUserId,
  };
  await saveAllTransfers(all);

  await updateTransactionForUser(transfer.senderUserId, transfer.id, {
    status: 'completed',
    title: 'Sent to branch',
    subtitle: `${transfer.locationName} · Ref ${transfer.reference}`,
  });

  await addTransactionForUser(adminUserId, {
    id: `tx-${Date.now()}-recv`,
    type: 'receive',
    amount: transfer.amount,
    title: 'Branch receive',
    subtitle: `From ${transfer.senderName} · Ref ${transfer.reference}`,
    createdAt: completedAt,
    status: 'completed',
    transferId: transfer.id,
  });

  await sendNotificationToUser(
    transfer.senderUserId,
    'Send completed',
    `$${transfer.amount.toFixed(2)} was received at ${transfer.locationName}. Ref: ${transfer.reference}`,
    'admin'
  );

  return { ok: true };
}
