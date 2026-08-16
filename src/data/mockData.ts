import { AppItem, CategoryInfo, Coupon, PaymentSetting, Purchase } from '../types';

// ZERO FAKE APPS - All apps are dynamically retrieved from Firebase Firestore where published == true
export const INITIAL_APPS: AppItem[] = [];

// Dynamic category mapping icon resolver
export const CATEGORY_ICON_MAP: Record<string, string> = {
  'video-editing': 'Clapperboard',
  'photo-editing': 'Camera',
  'productivity': 'FileText',
  'music-audio': 'Music',
  'tools': 'Wrench',
  'utility': 'Shield',
  'education': 'GraduationCap',
  'social': 'Share2',
  'developer': 'Code',
  'finance': 'DollarSign',
  'entertainment': 'Tv',
};

// Initial empty lists
export const INITIAL_CATEGORIES: CategoryInfo[] = [];
export const INITIAL_COUPONS: Coupon[] = [];
export const SAMPLE_PURCHASES: Purchase[] = [];

// Default Admin Payment Setting blueprint
export const INITIAL_PAYMENT_SETTING: PaymentSetting = {
  upiId: 'akstarmodofficial@upi',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=upi://pay?pa=akstarmodofficial@upi%26pn=AK%20STAR%20MOD%26cu=INR',
  beneficiaryName: 'AK STAR MOD Official',
  instructions: 'Scan QR Code or pay directly to the UPI ID. Upload the screenshot showing the transaction UTR number.',
};
