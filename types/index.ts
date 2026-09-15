import type { BrandName } from '@/constants/brands';

export type UserRole = 'owner' | 'admin' | 'user';

export type TransactionType =
  | 'send'
  | 'send_p2p'
  | 'send_cash'
  | 'cash_out'
  | 'receive'
  | 'deposit'
  | 'topup'
  | 'purchase';

export type AddMoneyMode = 'qr' | 'card';

export type SendMode = 'p2p' | 'location';

export type TransactionStatus = 'pending' | 'completed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  title: string;
  subtitle: string;
  createdAt: string;
  status?: TransactionStatus;
  transferId?: string;
}

export type BranchTransferStatus = 'pending' | 'completed';

export type CashOutStatus = 'pending' | 'completed';

export interface CashOutRequest {
  id: string;
  reference: string;
  userId: string;
  userName: string;
  userPhone: string;
  locationId: string;
  locationName: string;
  amount: number;
  status: CashOutStatus;
  createdAt: string;
  completedAt?: string;
  acceptedByUserId?: string;
}

export interface BranchTransfer {
  id: string;
  reference: string;
  senderUserId: string;
  senderName: string;
  senderPhone: string;
  locationId: string;
  locationName: string;
  amount: number;
  status: BranchTransferStatus;
  createdAt: string;
  completedAt?: string;
  acceptedByUserId?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  brand: BrandName;
  price: number;
  category: string;
}

export interface Carrier {
  id: string;
  name: string;
  brand: BrandName;
  minAmount: number;
  maxAmount: number;
}

export interface WalletProfile {
  name: string;
  phone: string;
  balance: number;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: UserRole;
  locationId?: string;
  authProvider?: 'password' | 'google';
  googleId?: string;
  email?: string;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  name: string;
  phone: string;
  role: UserRole;
  locationId?: string;
  authProvider?: 'password' | 'google';
  email?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  fromRole: UserRole;
  createdAt: string;
}
