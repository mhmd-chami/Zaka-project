import { getSession, getUserAccount } from '@/services/authStorage';

export type SendBlockReason = 'not_logged_in' | 'not_verified' | 'pending' | 'rejected';

export async function getSendBlockReason(): Promise<SendBlockReason | null> {
  const session = await getSession();
  if (!session) return 'not_logged_in';
  if (session.role === 'admin' || session.role === 'owner') return null;

  const account = await getUserAccount(session.userId);
  const status = account?.identityVerification?.status;
  if (status === 'approved') return null;
  if (status === 'pending') return 'pending';
  if (status === 'rejected') return 'rejected';
  return 'not_verified';
}

export function sendBlockTranslationKey(reason: SendBlockReason): string {
  switch (reason) {
    case 'not_logged_in':
      return 'sendNotLoggedIn';
    case 'pending':
      return 'sendVerificationPending';
    case 'rejected':
      return 'sendVerificationRejected';
    default:
      return 'sendRequiresVerification';
  }
}

export async function ensureCanSendMoney(): Promise<
  { ok: true } | { ok: false; reason: SendBlockReason }
> {
  const reason = await getSendBlockReason();
  if (!reason) return { ok: true };
  return { ok: false, reason };
}
