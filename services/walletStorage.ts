import AsyncStorage from '@react-native-async-storage/async-storage';
import { findUserByPhone, getAllUsers, getSession } from '@/services/authStorage';
import { sendNotificationToUser } from '@/services/notificationStorage';
import { Transaction, UserRole, WalletProfile } from '@/types';

function defaultBalance(role: UserRole): number {
  switch (role) {
    case 'owner':
      return 10000;
    case 'admin':
      return 5000;
    default:
      return 150;
  }
}

function profileKey(userId: string) {
  return `@zaka_wallet_profile_${userId}`;
}

function txKey(userId: string) {
  return `@zaka_wallet_transactions_${userId}`;
}

async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error('Not logged in');
  return session.userId;
}

export async function getProfile(): Promise<WalletProfile> {
  const session = await getSession();
  if (!session) {
    return { name: 'Guest', phone: '', balance: 0 };
  }

  const key = profileKey(session.userId);
  const raw = await AsyncStorage.getItem(key);

  if (!raw) {
    const profile: WalletProfile = {
      name: session.name,
      phone: session.phone,
      balance: defaultBalance(session.role),
    };
    await AsyncStorage.setItem(key, JSON.stringify(profile));
    return profile;
  }

  const profile: WalletProfile = JSON.parse(raw);
  return {
    ...profile,
    name: session.name,
    phone: session.phone,
  };
}

export async function saveProfile(profile: WalletProfile): Promise<void> {
  const userId = await requireUserId();
  await AsyncStorage.setItem(profileKey(userId), JSON.stringify(profile));
}

export async function getTransactions(): Promise<Transaction[]> {
  const session = await getSession();
  if (!session) return [];

  const raw = await AsyncStorage.getItem(txKey(session.userId));
  if (!raw) return [];
  const txs: Transaction[] = JSON.parse(raw);
  return txs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function addTransaction(tx: Transaction): Promise<void> {
  const userId = await requireUserId();
  await addTransactionForUser(userId, tx);
}

export async function getProfileByUserId(
  userId: string
): Promise<WalletProfile> {
  const raw = await AsyncStorage.getItem(profileKey(userId));
  if (!raw) {
    const users = await getAllUsers();
    const user = users.find((u) => u.id === userId);
    const profile: WalletProfile = {
      name: user?.name ?? 'User',
      phone: user?.phone ?? '',
      balance: defaultBalance(user?.role ?? 'user'),
    };
    await AsyncStorage.setItem(profileKey(userId), JSON.stringify(profile));
    return profile;
  }
  return JSON.parse(raw);
}

export async function saveProfileByUserId(
  userId: string,
  profile: WalletProfile
): Promise<void> {
  await AsyncStorage.setItem(profileKey(userId), JSON.stringify(profile));
}

export async function addTransactionForUser(
  userId: string,
  tx: Transaction
): Promise<void> {
  const raw = await AsyncStorage.getItem(txKey(userId));
  const txs: Transaction[] = raw ? JSON.parse(raw) : [];
  txs.unshift(tx);
  await AsyncStorage.setItem(txKey(userId), JSON.stringify(txs));
}

export async function updateTransactionForUser(
  userId: string,
  transferId: string,
  updates: Partial<Transaction>
): Promise<void> {
  const raw = await AsyncStorage.getItem(txKey(userId));
  if (!raw) return;
  const txs: Transaction[] = JSON.parse(raw);
  const idx = txs.findIndex((t) => t.transferId === transferId);
  if (idx < 0) return;
  txs[idx] = { ...txs[idx], ...updates };
  await AsyncStorage.setItem(txKey(userId), JSON.stringify(txs));
}

export async function seedDemoTransactions(): Promise<void> {
  try {
    const session = await getSession();
    if (!session) return;

    const existing = await getTransactions();
    if (existing.length > 0) return;

    const profile = await getProfile();
    const demos: Transaction[] = [
      {
        id: 'tx-1',
        type: 'receive',
        amount: 50,
        title: 'Received from Sara',
        subtitle: '+961 71 555 123',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'tx-2',
        type: 'topup',
        amount: 10,
        title: 'Alfa recharge',
        subtitle: profile.phone,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    await AsyncStorage.setItem(txKey(session.userId), JSON.stringify(demos));
  } catch {
    // Ignore seed errors — wallet still loads
  }
}

export async function sendMoneyP2P(
  toPhone: string,
  amount: number
): Promise<{ ok: boolean; error?: string; recipientName?: string }> {
  if (amount <= 0) return { ok: false, error: 'Enter a valid amount' };

  const session = await getSession();
  if (!session) return { ok: false, error: 'Not logged in' };

  const recipient = await findUserByPhone(toPhone);
  if (!recipient) {
    return { ok: false, error: 'No ZakaPay account found for this number' };
  }

  if (recipient.id === session.userId) {
    return { ok: false, error: 'You cannot send money to yourself' };
  }

  const senderProfile = await getProfile();
  if (amount > senderProfile.balance) {
    return { ok: false, error: 'Not enough balance' };
  }

  senderProfile.balance -= amount;
  await saveProfile(senderProfile);
  await addTransaction({
    id: `tx-${Date.now()}`,
    type: 'send_p2p',
    amount,
    title: 'ZakaPay → ZakaPay',
    subtitle: recipient.phone,
    createdAt: new Date().toISOString(),
  });

  const recipientProfile = await getProfileByUserId(recipient.id);
  recipientProfile.balance += amount;
  await saveProfileByUserId(recipient.id, recipientProfile);
  await addTransactionForUser(recipient.id, {
    id: `tx-${Date.now()}-in`,
    type: 'receive',
    amount,
    title: `Received from ${session.name}`,
    subtitle: session.phone,
    createdAt: new Date().toISOString(),
  });

  return { ok: true, recipientName: recipient.name };
}

export async function addMoneyViaCard(
  amount: number,
  cardLast4: string
): Promise<{ ok: boolean; error?: string }> {
  if (amount <= 0) return { ok: false, error: 'Enter a valid amount' };
  if (amount > 5000) {
    return { ok: false, error: 'Maximum deposit is $5,000 per transaction' };
  }

  const profile = await getProfile();
  profile.balance += amount;
  await saveProfile(profile);
  await addTransaction({
    id: `tx-${Date.now()}`,
    type: 'deposit',
    amount,
    title: 'Credit card deposit',
    subtitle: `•••• ${cardLast4}`,
    createdAt: new Date().toISOString(),
  });

  return { ok: true };
}

export async function sendCashAtLocation(
  amount: number,
  locationId: string,
  locationName: string
): Promise<{ ok: boolean; error?: string; reference?: string }> {
  if (amount <= 0) return { ok: false, error: 'Enter a valid amount' };

  const session = await getSession();
  if (!session) return { ok: false, error: 'Not logged in' };

  const { createBranchTransfer } = await import(
    '@/services/branchTransferStorage'
  );

  return createBranchTransfer(
    session.userId,
    session.name,
    session.phone,
    locationId,
    locationName,
    amount
  );
}

export async function receiveMoney(
  fromName: string,
  amount: number
): Promise<void> {
  const profile = await getProfile();
  profile.balance += amount;
  await saveProfile(profile);
  await addTransaction({
    id: `tx-${Date.now()}`,
    type: 'receive',
    amount,
    title: `Received from ${fromName}`,
    subtitle: 'Demo payment',
    createdAt: new Date().toISOString(),
  });
}

function generateRedeemCode(carrier: string): string {
  const prefix = carrier.toUpperCase().replace(/\s/g, '').slice(0, 4);
  const segment = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${segment()}-${segment()}`;
}

export async function topUpPhone(
  carrier: string,
  phone: string,
  amount: number
): Promise<{ ok: boolean; error?: string; redeemCode?: string }> {
  if (amount <= 0) return { ok: false, error: 'Enter a valid amount' };

  const session = await getSession();
  if (!session) return { ok: false, error: 'Not logged in' };

  const profile = await getProfile();
  if (amount > profile.balance) {
    return { ok: false, error: 'Not enough balance' };
  }

  const redeemCode = generateRedeemCode(carrier);

  profile.balance -= amount;
  await saveProfile(profile);
  await addTransaction({
    id: `tx-${Date.now()}`,
    type: 'topup',
    amount,
    title: `${carrier} recharge`,
    subtitle: `${phone} · ${redeemCode}`,
    createdAt: new Date().toISOString(),
  });

  await sendNotificationToUser(
    session.userId,
    `${carrier} redeem code 🎫`,
    `Your $${amount.toFixed(2)} ${carrier} recharge for ${phone} is ready.\n\nRedeem code: ${redeemCode}\n\nUse this code with ${carrier} to top up your line.`,
    'admin'
  );

  return { ok: true, redeemCode };
}

export async function purchaseItem(
  itemName: string,
  price: number
): Promise<{ ok: boolean; error?: string }> {
  const profile = await getProfile();
  if (price > profile.balance) {
    return { ok: false, error: 'Not enough balance' };
  }

  profile.balance -= price;
  await saveProfile(profile);
  await addTransaction({
    id: `tx-${Date.now()}`,
    type: 'purchase',
    amount: price,
    title: itemName,
    subtitle: 'Shop purchase',
    createdAt: new Date().toISOString(),
  });

  return { ok: true };
}
