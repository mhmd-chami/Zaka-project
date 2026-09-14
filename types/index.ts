export type UserRole = 'owner' | 'admin' | 'user';

export type TransactionType =
  | 'send'
  | 'send_p2p'
  | 'send_cash'
  | 'receive'
  | 'topup'
  | 'purchase';

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
  emoji: string;
  price: number;
  category: string;
}

export interface Carrier {
  id: string;
  name: string;
  emoji: string;
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
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  name: string;
  phone: string;
  role: UserRole;
  locationId?: string;
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
