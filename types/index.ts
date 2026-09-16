import type { BrandName } from '@/constants/brands';

export type UserRole = 'owner' | 'admin' | 'user';

export type IdentityDocumentType = 'lebanese_id' | 'passport' | 'residence_permit';
export type IdentityVerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'resubmission_requested' | 'expired';

export interface IdentityVerification {
  id: string;
  provider: 'veriff' | 'document';
  environment: 'test' | 'live';
  providerStatus: string;
  reviewedAt?: string;
  documentType?: IdentityDocumentType;
  documentNumber?: string;
  status: IdentityVerificationStatus;
  submittedAt: string;
  documentPhotoUri?: string;
  fullName?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  nationality?: string;
  locationId?: string;
}

export interface BranchVerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  status: IdentityVerificationStatus;
  providerStatus: string;
  submittedAt: string;
  documentType?: IdentityDocumentType;
  documentNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  nationality?: string;
  locationId?: string;
  hasDocumentPhoto?: boolean;
}

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
  role: UserRole;
  locationId?: string;
  authProvider?: 'password' | 'google';
  googleId?: string;
  email?: string;
  identityVerification?: IdentityVerification;
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

export type AppLanguage = 'en' | 'ar';
export type AppTheme = 'dark' | 'light';

export interface ProfileSettings {
  avatarEmoji: string;
  verified: boolean;
  notificationSound: boolean;
  notificationVibration: boolean;
  requirePinForSend: boolean;
  pinCode: string | null;
  defaultSendMode: SendMode;
  language: AppLanguage;
  theme: AppTheme;
  dailySendLimit: number;
  dailyCashOutLimit: number;
}
