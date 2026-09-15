import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthSession,
  IdentityDocumentType,
  IdentityVerification,
  UserAccount,
  UserRole,
} from '@/types';
import { GoogleIdentity, signOutFromGoogle } from '@/services/googleAuth';

const USERS_KEY = '@zaka_users';
const SESSION_KEY = '@zaka_session';

const DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-owner',
    name: 'Zaka Owner',
    phone: '+96170000001',
    password: 'owner123',
    role: 'owner',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-admin',
    name: 'Hamra Admin',
    phone: '+96170000002',
    password: 'admin123',
    role: 'admin',
    locationId: 'loc-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-admin-verdun',
    name: 'Verdun Admin',
    phone: '+96170000003',
    password: 'admin123',
    role: 'admin',
    locationId: 'loc-2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-admin-tripoli',
    name: 'Tripoli Admin',
    phone: '+96170000004',
    password: 'admin123',
    role: 'admin',
    locationId: 'loc-3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-admin-saida',
    name: 'Saida Admin',
    phone: '+96170000005',
    password: 'admin123',
    role: 'admin',
    locationId: 'loc-4',
    createdAt: new Date().toISOString(),
  },
];

function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').trim();
}

function normalizeRole(role?: UserRole): UserRole {
  if (role === 'owner' || role === 'admin') return role;
  return 'user';
}

async function saveUsers(users: UserAccount[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Ensure demo owner/admin exist and every account has a role */
export async function seedDemoAccounts(): Promise<void> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  let users: UserAccount[] = raw ? JSON.parse(raw) : [];
  let changed = false;

  users = users.map((u) => {
    if (!u.role) {
      changed = true;
      return { ...u, role: 'user' as UserRole };
    }
    return u;
  });

  for (const demo of DEMO_ACCOUNTS) {
    const idx = users.findIndex((u) => u.id === demo.id);
    if (idx < 0) {
      users.push(demo);
      changed = true;
    } else {
      const merged = {
        ...users[idx],
        name: demo.name,
        role: demo.role,
        locationId: demo.locationId ?? users[idx].locationId,
      };
      if (
        users[idx].name !== merged.name ||
        users[idx].role !== merged.role ||
        users[idx].locationId !== merged.locationId
      ) {
        users[idx] = merged;
        changed = true;
      }
    }
  }

  if (changed || !raw) {
    await saveUsers(users);
  }
}

export async function findUserByPhone(
  phone: string
): Promise<UserAccount | null> {
  const normalized = normalizePhone(phone);
  const users = await getAllUsers();
  return users.find((u) => normalizePhone(u.phone) === normalized) ?? null;
}

export async function getAllUsers(): Promise<UserAccount[]> {
  await seedDemoAccounts();
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function toSession(user: UserAccount): AuthSession {
  return {
    userId: user.id,
    name: user.name,
    phone: user.phone,
    role: normalizeRole(user.role),
    locationId: user.locationId,
    authProvider: user.authProvider ?? 'password',
    email: user.email,
  };
}

export async function getSession(): Promise<AuthSession | null> {
  await seedDemoAccounts();
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  const parsed = JSON.parse(raw) as Partial<AuthSession>;
  if (!parsed.userId) return null;

  const users = await getAllUsers();
  const user = users.find((u) => u.id === parsed.userId);

  const session: AuthSession = {
    userId: parsed.userId,
    name: parsed.name ?? user?.name ?? 'User',
    phone: parsed.phone ?? user?.phone ?? '',
    role: normalizeRole(parsed.role ?? user?.role),
    locationId: parsed.locationId ?? user?.locationId,
    authProvider: parsed.authProvider ?? user?.authProvider ?? 'password',
    email: parsed.email ?? user?.email,
  };

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function signUp(
  name: string,
  phone: string,
  password: string
): Promise<{ ok: boolean; error?: string; session?: AuthSession }> {
  const trimmedName = name.trim();
  const normalizedPhone = normalizePhone(phone);
  const trimmedPassword = password.trim();

  if (!trimmedName) return { ok: false, error: 'Enter your full name' };
  if (normalizedPhone.length < 8) {
    return { ok: false, error: 'Enter a valid phone number' };
  }
  if (trimmedPassword.length < 4) {
    return { ok: false, error: 'Password must be at least 4 characters' };
  }

  const users = await getAllUsers();
  if (users.some((u) => normalizePhone(u.phone) === normalizedPhone)) {
    return { ok: false, error: 'This phone number is already registered' };
  }

  const user: UserAccount = {
    id: `user-${Date.now()}`,
    name: trimmedName,
    phone: normalizedPhone,
    password: trimmedPassword,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await saveUsers(users);

  const session = toSession(user);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { ok: true, session };
}

export async function findGoogleAccount(
  identity: GoogleIdentity
): Promise<{ session?: AuthSession; needsPhone: boolean }> {
  const users = await getAllUsers();
  const user = users.find((account) => account.googleId === identity.id);
  if (!user) return { needsPhone: true };

  const session = toSession(user);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { session, needsPhone: false };
}

export async function completeGoogleSignUp(
  identity: GoogleIdentity,
  phone: string
): Promise<{ ok: boolean; error?: string; session?: AuthSession }> {
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone.length < 8) {
    return { ok: false, error: 'Enter a valid phone number' };
  }

  const users = await getAllUsers();
  const existingGoogle = users.find((account) => account.googleId === identity.id);
  if (existingGoogle) {
    const session = toSession(existingGoogle);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }
  if (users.some((account) => normalizePhone(account.phone) === normalizedPhone)) {
    return { ok: false, error: 'This phone number is already registered' };
  }

  const user: UserAccount = {
    id: `user-google-${Date.now()}`,
    name: identity.name,
    phone: normalizedPhone,
    password: '',
    role: 'user',
    authProvider: 'google',
    googleId: identity.id,
    email: identity.email,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await saveUsers(users);

  const session = toSession(user);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export async function login(
  phone: string,
  password: string
): Promise<{ ok: boolean; error?: string; session?: AuthSession }> {
  const normalizedPhone = normalizePhone(phone);
  const trimmedPassword = password.trim();

  if (!normalizedPhone) return { ok: false, error: 'Enter your phone number' };
  if (!trimmedPassword) return { ok: false, error: 'Enter your password' };

  const users = await getAllUsers();
  const user = users.find(
    (u) =>
      normalizePhone(u.phone) === normalizedPhone &&
      u.password === trimmedPassword
  );

  if (!user) {
    return { ok: false, error: 'Wrong phone number or password' };
  }

  const session = toSession(user);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { ok: true, session };
}

export async function getUserAccount(
  userId: string
): Promise<UserAccount | null> {
  const users = await getAllUsers();
  return users.find((u) => u.id === userId) ?? null;
}

export async function updateUserName(
  userId: string,
  name: string
): Promise<{ ok: boolean; error?: string; session?: AuthSession }> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: 'Enter a valid name' };

  const users = await getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return { ok: false, error: 'User not found' };

  users[idx].name = trimmed;
  await saveUsers(users);

  const session = toSession(users[idx]);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export async function submitIdentityVerification(
  userId: string,
  documentType: IdentityDocumentType,
  documentNumber: string,
  details?: Pick<IdentityVerification, 'documentPhotoUri' | 'fullName' | 'dateOfBirth' | 'expiryDate' | 'nationality'>
): Promise<{ ok: boolean; error?: string; verification?: IdentityVerification }> {
  const normalizedNumber = documentNumber.trim().toUpperCase();
  if (documentType === 'lebanese_id' && !/^\d{8}$/.test(normalizedNumber)) {
    return { ok: false, error: 'Lebanese ID numbers must contain 8 digits' };
  }
  if (documentType !== 'lebanese_id' && normalizedNumber.length < 5) {
    return { ok: false, error: 'Enter a valid document number' };
  }

  const users = await getAllUsers();
  const idx = users.findIndex((user) => user.id === userId);
  if (idx < 0) return { ok: false, error: 'User not found' };

  const verification: IdentityVerification = {
    documentType,
    documentNumber: normalizedNumber,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    ...details,
  };
  users[idx] = { ...users[idx], identityVerification: verification };
  await saveUsers(users);
  return { ok: true, verification };
}

export async function reviewIdentityVerification(
  userId: string,
  status: 'approved' | 'rejected'
): Promise<{ ok: boolean; error?: string }> {
  const users = await getAllUsers();
  const idx = users.findIndex((user) => user.id === userId);
  if (idx < 0) return { ok: false, error: 'User not found' };
  if (!users[idx].identityVerification) return { ok: false, error: 'No identity document was submitted' };
  users[idx] = {
    ...users[idx],
    identityVerification: { ...users[idx].identityVerification, status },
  };
  await saveUsers(users);
  return { ok: true };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const users = await getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return { ok: false, error: 'User not found' };

  const user = users[idx];
  if (user.authProvider === 'google') {
    return { ok: false, error: 'Google accounts cannot change password here' };
  }
  if (user.password !== currentPassword.trim()) {
    return { ok: false, error: 'Current password is incorrect' };
  }
  if (newPassword.trim().length < 4) {
    return { ok: false, error: 'Password must be at least 4 characters' };
  }

  users[idx].password = newPassword.trim();
  await saveUsers(users);
  return { ok: true };
}

export async function logout(): Promise<void> {
  const session = await getSession();
  await AsyncStorage.removeItem(SESSION_KEY);
  if (session?.authProvider === 'google') {
    await signOutFromGoogle();
  }
}

export async function setUserRole(
  userId: string,
  role: UserRole
): Promise<{ ok: boolean; error?: string }> {
  const users = await getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return { ok: false, error: 'User not found' };
  if (users[idx].role === 'owner') {
    return { ok: false, error: 'Cannot change owner role' };
  }
  if (role === 'owner') {
    return { ok: false, error: 'Cannot assign owner role' };
  }

  users[idx].role = role;
  await saveUsers(users);
  return { ok: true };
}

export function roleLabel(role?: UserRole): string {
  switch (normalizeRole(role)) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Admin';
    default:
      return 'User';
  }
}
