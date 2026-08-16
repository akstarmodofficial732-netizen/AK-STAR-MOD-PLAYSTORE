export type ScreenType = 
  | 'splash'
  | 'login'
  | 'home'
  | 'categories'
  | 'category-detail'
  | 'search'
  | 'app-details'
  | 'key-selection'
  | 'payment'
  | 'payment-pending'
  | 'key-received'
  | 'purchases'
  | 'profile'
  | 'admin';

export interface KeyTier {
  id: string;
  name: string;
  type: 'free' | 'monthly' | 'lifetime' | 'custom';
  durationText: string;
  price: number;
  originalPrice?: number;
  currency: string;
  isFree?: boolean;
  isPopular?: boolean;
}

export interface AppItem {
  id: string;
  name: string;
  developer: string;
  tagline?: string;
  description: string;
  category: string;
  version: string;
  size: string;
  iconUrl: string;
  iconStoragePath?: string;
  bannerUrl?: string;
  apkUrl?: string;
  apkStoragePath?: string;
  downloadUrl?: string;
  goFileUrl?: string;
  screenshots: string[];
  features?: string[];
  whatsNew?: string[];
  changelog?: string;
  rating?: number;
  ratingCount?: number;
  downloadsCount?: string;
  downloadCount?: number;
  isEditorChoice?: boolean;
  featured?: boolean;
  published: boolean;
  status?: 'approved' | 'pending' | 'draft' | 'rejected';
  badgeText?: string;
  badgeType?: 'free' | 'premium' | 'ad-free' | 'update' | 'mod';
  keyTiers?: KeyTier[];
  uploadDate?: string;
  updatedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportSettings {
  whatsapp_url: string;
  telegram_url: string;
  whatsapp_number?: string;
  telegram_username?: string;
  updatedAt?: string;
}

export interface PaymentSetting {
  upiId: string;
  qrCodeUrl: string;
  beneficiaryName: string;
  instructions: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  active: boolean;
  expiryDate?: string;
  minAmount?: number;
}

export type PurchaseStatus = 'pending' | 'approved' | 'rejected';

export interface Purchase {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  appId: string;
  appName: string;
  appIcon: string;
  keyTierId: string;
  keyTierName: string;
  originalPrice: number;
  discount: number;
  finalAmount: number;
  currency: string;
  couponCode?: string;
  paymentScreenshotUrl: string;
  status: PurchaseStatus;
  rejectionReason?: string;
  licenseKey?: string;
  goFileDownloadUrl?: string;
  apkUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isGuest?: boolean;
  isAdmin?: boolean;
  subscriptionStatus?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  count: number;
}
