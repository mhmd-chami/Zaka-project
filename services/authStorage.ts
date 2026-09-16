import { api, clearApiSession } from '@/services/api';
import { GoogleIdentity, signOutFromGoogle } from '@/services/googleAuth';
import { AuthSession, UserAccount, UserRole } from '@/types';

type AuthResult = { ok: boolean; error?: string; session?: AuthSession };
const message = (error: unknown) => error instanceof Error ? error.message : 'Please try again.';

export async function getSession(): Promise<AuthSession | null> {
  try { return (await api<{ session: AuthSession }>('/auth/session')).session; }
  catch { return null; }
}

export async function signUp(name: string, phone: string, password: string): Promise<AuthResult> {
  try { return await api('/auth/signup', { method: 'POST', body: { name, phone, password } }); }
  catch (error) { return { ok: false, error: message(error) }; }
}

export async function login(phone: string, password: string): Promise<AuthResult> {
  try { return await api('/auth/login', { method: 'POST', body: { phone, password } }); }
  catch (error) { return { ok: false, error: message(error) }; }
}

export async function findGoogleAccount(identity: GoogleIdentity): Promise<{ session?: AuthSession; needsPhone: boolean; identity?: Omit<GoogleIdentity, 'idToken'>; error?: string }> {
  try { return await api('/auth/google', { method: 'POST', body: { idToken: identity.idToken } }); }
  catch (error) { return { needsPhone: false, error: message(error) }; }
}

export async function completeGoogleSignUp(identity: GoogleIdentity, phone: string): Promise<AuthResult> {
  try { return await api('/auth/google', { method: 'POST', body: { idToken: identity.idToken, phone } }); }
  catch (error) { return { ok: false, error: message(error) }; }
}

export async function getAllUsers(): Promise<UserAccount[]> {
  return (await api<{ users: UserAccount[] }>('/users')).users;
}

export async function findUserByPhone(phone: string): Promise<UserAccount | null> {
  return (await api<{ user: UserAccount | null }>('/users/lookup', { method: 'POST', body: { phone } })).user;
}

export async function getUserAccount(userId: string): Promise<UserAccount | null> {
  return (await api<{ user: UserAccount }>(`/users/${encodeURIComponent(userId)}`)).user;
}

export async function updateUserName(_userId: string, name: string): Promise<AuthResult> {
  try { return await api('/me', { method: 'PATCH', body: { name } }); }
  catch (error) { return { ok: false, error: message(error) }; }
}

export async function changePassword(_userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
  try { return await api('/me/password', { method: 'POST', body: { currentPassword, newPassword } }); }
  catch (error) { return { ok: false, error: message(error) }; }
}

export async function logout(): Promise<void> {
  // Do not claim a browser session is revoked if the server cannot be reached.
  await api('/auth/logout', { method: 'POST', body: {} });
  clearApiSession();
  await signOutFromGoogle();
}

export async function setUserRole(userId: string, role: UserRole): Promise<AuthResult> {
  try { return await api(`/users/${encodeURIComponent(userId)}/role`, { method: 'PATCH', body: { role } }); }
  catch (error) { return { ok: false, error: message(error) }; }
}

export function roleLabel(role?: UserRole): string {
  return role === 'owner' ? 'Owner' : role === 'admin' ? 'Admin' : 'User';
}
