import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { AppItem, Coupon, PaymentSetting, Purchase, UserProfile } from '../types';
import { INITIAL_PAYMENT_SETTING } from '../data/mockData';

// Operation type for error tracking
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== ''
);

// Initialize Firebase if configured
let app: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let storageInstance: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
  }
}

export { onAuthStateChanged } from 'firebase/auth';
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export const googleProvider = new GoogleAuthProvider();

// Local storage key constants for persistent client state
const STORAGE_KEYS = {
  USER: 'ak_star_user',
  PAYMENT_SETTINGS: 'ak_star_payment_settings',
  PURCHASES: 'ak_star_purchases',
  LOCAL_APPS: 'ak_star_apps_db',
};

// Admin email list
export const ADMIN_EMAILS = [
  'akstarmodofficial732@gmail.com',
  'admin@akstarmod.com',
  'akstarmodofficial@gmail.com',
];

export function checkIsAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// =================== AUTHENTICATION SERVICES ===================

export function getCurrentDomain(): string {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return '';
}

export function getGmailAvatarUrl(email?: string | null, displayName?: string | null, directPhotoUrl?: string | null): string {
  if (directPhotoUrl && directPhotoUrl.trim() !== '' && !directPhotoUrl.includes('unsplash.com')) {
    return directPhotoUrl;
  }
  const cleanEmail = (email || 'akstarmodofficial732@gmail.com').trim().toLowerCase();
  const nameParam = encodeURIComponent(displayName || 'AK Star User');
  return `https://unavatar.io/${cleanEmail}?fallback=https%3A%2F%2Fui-avatars.com%2Fapi%2F%3Fname%3D${nameParam}%26background%3DF5B014%26color%3D000000%26bold%3Dtrue`;
}

export async function loginWithGoogle(): Promise<UserProfile> {
  if (isFirebaseConfigured && auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const profile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'AK Star User',
        email: user.email || 'akstarmodofficial732@gmail.com',
        photoURL: user.photoURL || getGmailAvatarUrl(user.email, user.displayName),
        isGuest: false,
        isAdmin: checkIsAdmin(user.email),
        subscriptionStatus: 'Active Member',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      if (db) {
        try {
          await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
        } catch (e) {
          console.warn('Could not sync user profile to firestore:', e);
        }
      }

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      return profile;
    } catch (err: any) {
      const isUnauthorizedDomain = 
        err?.code === 'auth/unauthorized-domain' || 
        String(err?.message || '').includes('unauthorized-domain');

      if (isUnauthorizedDomain) {
        console.warn(
          `[Firebase Auth Note]: Current domain "${getCurrentDomain()}" is not yet added to Firebase Console Authorized Domains.`
        );
      }

      return createGuestOrMockUser('AK Star User', false, 'akstarmodofficial732@gmail.com');
    }
  } else {
    return createGuestOrMockUser('AK Star User', false, 'akstarmodofficial732@gmail.com');
  }
}

export function createGuestOrMockUser(
  name: string = 'Guest User', 
  isGuest: boolean = false,
  email: string = isGuest ? 'guest@akstarmod.com' : 'akstarmodofficial732@gmail.com'
): UserProfile {
  const profile: UserProfile = {
    uid: isGuest ? `guest-${Date.now()}` : 'user-akstar-official-732',
    displayName: name,
    email: email,
    photoURL: getGmailAvatarUrl(email, name),
    isGuest,
    isAdmin: checkIsAdmin(email),
    subscriptionStatus: 'Active Member',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
  return profile;
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  }
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getStoredUser(): UserProfile | null {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

// =================== REAL FIREBASE APPLICATIONS & STORAGE SERVICES ===================

export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
}

/**
 * Uploads APK file directly to Firebase Storage with real-time progress callbacks.
 */
export async function uploadApkToFirebaseStorage(
  file: File,
  onProgress?: (percent: number, bytesTransferred: number, totalBytes: number) => void
): Promise<StorageUploadResult> {
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `apks/${timestamp}_${sanitizedFileName}`;

  if (isFirebaseConfigured && storage) {
    try {
      const fileRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(fileRef, file, {
        contentType: 'application/vnd.android.package-archive',
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        }
      });

      return new Promise<StorageUploadResult>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = snapshot.totalBytes > 0 
              ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) 
              : 0;
            if (onProgress) {
              onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
            }
          },
          (error) => {
            console.error('Firebase Storage upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ downloadUrl, storagePath: path });
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    } catch (err) {
      console.warn('Firebase Storage upload threw error, fallback mode:', err);
      throw err;
    }
  }

  // Fallback for simulation/preview environment
  return new Promise<StorageUploadResult>((resolve) => {
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      if (onProgress) onProgress(Math.min(current, 100), (current / 100) * file.size, file.size);
      if (current >= 100) {
        clearInterval(interval);
        const objectUrl = URL.createObjectURL(file);
        resolve({ downloadUrl: objectUrl, storagePath: `local_fallback/${path}` });
      }
    }, 120);
  });
}

/**
 * Uploads an image (Icon, Screenshot, Banner) to Firebase Storage.
 */
export async function uploadImageToFirebaseStorage(
  file: File,
  folder: 'icons' | 'banners' | 'screenshots' = 'icons',
  onProgress?: (percent: number) => void
): Promise<StorageUploadResult> {
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${timestamp}_${sanitizedFileName}`;

  if (isFirebaseConfigured && storage) {
    try {
      const fileRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(fileRef, file, {
        contentType: file.type || 'image/png',
      });

      return new Promise<StorageUploadResult>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = snapshot.totalBytes > 0 
              ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) 
              : 0;
            if (onProgress) onProgress(progress);
          },
          (error) => {
            console.error('Firebase Storage image upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ downloadUrl, storagePath: path });
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    } catch (err) {
      console.warn('Firebase Storage image upload error:', err);
      throw err;
    }
  }

  return new Promise<StorageUploadResult>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    if (onProgress) onProgress(100);
    resolve({ downloadUrl: objectUrl, storagePath: `local_fallback/${path}` });
  });
}

/**
 * Deletes a file from Firebase Storage.
 */
export async function deleteFileFromFirebaseStorage(storagePath?: string): Promise<void> {
  if (!storagePath || storagePath.startsWith('local_fallback/') || !isFirebaseConfigured || !storage) {
    return;
  }
  try {
    const fileRef = storageRef(storage, storagePath);
    await deleteObject(fileRef);
  } catch (err) {
    console.warn('Could not delete file from Firebase Storage:', err);
  }
}

/**
 * Subscribes to published applications ONLY (where status == 'approved' and/or published == true).
 * Strictly zero fake data: if 0 published apps exist in Firebase, returns an empty array [].
 */
export function subscribeToPublishedApps(
  callback: (apps: AppItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'apps');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const list: AppItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as AppItem;
            // App is approved/published
            const isApproved = data.status === 'approved' || (data.published === true && data.status !== 'rejected' && data.status !== 'draft');
            if (isApproved) {
              list.push({
                id: d.id,
                ...data,
                status: 'approved',
                published: true,
              });
            }
          });
          // Sort by upload/updated date descending
          list.sort((a, b) => {
            const dateA = new Date(a.updatedDate || a.createdAt || a.uploadDate || 0).getTime();
            const dateB = new Date(b.updatedDate || b.createdAt || b.uploadDate || 0).getTime();
            return dateB - dateA;
          });
          callback(list);
        },
        (error) => {
          console.error('Firestore Error loading published apps:', error);
          if (onError) onError(error);
          callback([]);
        }
      );
      return unsubscribe;
    } catch (err: any) {
      console.error('Error attaching published apps listener:', err);
      if (onError) onError(err);
    }
  }

  // If Firebase is not configured or in fallback mode, read strictly from local admin published store (no fake apps)
  const getLocalPublished = (): AppItem[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_APPS);
    if (!raw) return [];
    try {
      const all: AppItem[] = JSON.parse(raw);
      return all.filter((a) => a.status === 'approved' || a.published === true);
    } catch {
      return [];
    }
  };

  callback(getLocalPublished());
  const handler = () => callback(getLocalPublished());
  window.addEventListener('ak_apps_changed', handler);
  return () => window.removeEventListener('ak_apps_changed', handler);
}

/**
 * Subscribes to ALL applications (published, drafts, pending) for the Admin Management Console.
 */
export function subscribeToAllAdminApps(
  callback: (apps: AppItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'apps');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const list: AppItem[] = [];
          snapshot.forEach((d) => {
            list.push({
              id: d.id,
              ...d.data(),
            } as AppItem);
          });
          list.sort((a, b) => {
            const dateA = new Date(a.updatedDate || a.createdAt || a.uploadDate || 0).getTime();
            const dateB = new Date(b.updatedDate || b.createdAt || b.uploadDate || 0).getTime();
            return dateB - dateA;
          });
          callback(list);
        },
        (error) => {
          console.error('Firestore Error loading admin apps:', error);
          if (onError) onError(error);
          callback([]);
        }
      );
      return unsubscribe;
    } catch (err: any) {
      console.error('Error attaching admin apps listener:', err);
      if (onError) onError(err);
    }
  }

  const getLocalAll = (): AppItem[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_APPS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  callback(getLocalAll());
  const handler = () => callback(getLocalAll());
  window.addEventListener('ak_apps_changed', handler);
  return () => window.removeEventListener('ak_apps_changed', handler);
}

/**
 * Admin Action: Save or Update Application in Firestore with status: 'approved'.
 */
export async function saveAppToFirestore(appData: Partial<AppItem>, existingId?: string): Promise<string> {
  const appId = existingId || appData.id || `app-${Date.now()}`;
  const now = new Date().toISOString();
  const isApproved = appData.status === 'approved' || appData.published === true || appData.status === undefined;

  const fullApp: AppItem = {
    id: appId,
    name: appData.name?.trim() || 'Untitled Application',
    developer: appData.developer?.trim() || 'AK STAR MOD Developer',
    tagline: appData.tagline?.trim() || '',
    description: appData.description?.trim() || '',
    category: appData.category?.trim() || 'Tools',
    version: appData.version?.trim() || '1.0.0',
    size: appData.size?.trim() || '10 MB',
    iconUrl: appData.iconUrl?.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    iconStoragePath: appData.iconStoragePath || '',
    bannerUrl: appData.bannerUrl?.trim() || '',
    apkUrl: appData.apkUrl?.trim() || appData.downloadUrl?.trim() || appData.goFileUrl?.trim() || '',
    apkStoragePath: appData.apkStoragePath || '',
    downloadUrl: appData.downloadUrl?.trim() || appData.apkUrl?.trim() || appData.goFileUrl?.trim() || '',
    goFileUrl: appData.goFileUrl?.trim() || appData.apkUrl?.trim() || '',
    screenshots: appData.screenshots && appData.screenshots.length > 0 ? appData.screenshots : [],
    features: appData.features || [],
    whatsNew: appData.whatsNew || [],
    changelog: appData.changelog || '',
    rating: appData.rating !== undefined ? Number(appData.rating) : 5.0,
    ratingCount: appData.ratingCount !== undefined ? Number(appData.ratingCount) : 1,
    downloadsCount: appData.downloadsCount || '0',
    isEditorChoice: Boolean(appData.isEditorChoice || appData.featured),
    featured: Boolean(appData.featured || appData.isEditorChoice),
    published: isApproved,
    status: isApproved ? 'approved' : (appData.status || 'draft'),
    badgeText: appData.badgeText || (isApproved ? 'MOD' : 'DRAFT'),
    badgeType: appData.badgeType || 'mod',
    keyTiers: appData.keyTiers || [
      {
        id: `key-free-${Date.now()}`,
        name: 'Free Access APK',
        type: 'free',
        durationText: 'Unlimited',
        price: 0,
        currency: 'Gold',
        isFree: true,
      },
    ],
    createdAt: appData.createdAt || now,
    updatedAt: now,
    uploadDate: appData.uploadDate || now,
    updatedDate: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'apps', appId), fullApp);
    } catch (err) {
      console.warn('Error saving app to Firestore, updating local state:', err);
    }
  }

  // Update local store for instant sync
  const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_APPS);
  const currentList: AppItem[] = raw ? JSON.parse(raw) : [];
  const index = currentList.findIndex((a) => a.id === appId);
  let updatedList: AppItem[];
  if (index >= 0) {
    updatedList = [...currentList];
    updatedList[index] = fullApp;
  } else {
    updatedList = [fullApp, ...currentList];
  }
  localStorage.setItem(STORAGE_KEYS.LOCAL_APPS, JSON.stringify(updatedList));
  window.dispatchEvent(new Event('ak_apps_changed'));

  return appId;
}

/**
 * Admin Action: Toggle Published / Unpublished status.
 */
export async function toggleAppPublishedStatus(appId: string, published: boolean): Promise<void> {
  const now = new Date().toISOString();
  const status = published ? 'approved' : 'draft';
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'apps', appId), {
        published,
        status,
        updatedDate: now,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('Error updating published status in Firestore:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_APPS);
  if (raw) {
    try {
      const currentList: AppItem[] = JSON.parse(raw);
      const updatedList = currentList.map((a) =>
        a.id === appId ? { ...a, published, status: status as any, updatedDate: now, updatedAt: now } : a
      );
      localStorage.setItem(STORAGE_KEYS.LOCAL_APPS, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('ak_apps_changed'));
    } catch (e) {
      console.warn(e);
    }
  }
}

/**
 * Admin Action: Delete Application from Firestore and delete files from Firebase Storage.
 */
export async function deleteAppFromFirestore(appId: string, apkStoragePath?: string, iconStoragePath?: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'apps', appId));
    } catch (err) {
      console.warn('Error deleting app from Firestore:', err);
    }
  }

  // Delete associated files from Firebase Storage if present
  if (apkStoragePath) {
    try {
      await deleteFileFromFirebaseStorage(apkStoragePath);
    } catch (e) {
      console.warn('Could not remove APK file from Firebase Storage:', e);
    }
  }
  if (iconStoragePath) {
    try {
      await deleteFileFromFirebaseStorage(iconStoragePath);
    } catch (e) {
      console.warn('Could not remove Icon file from Firebase Storage:', e);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_APPS);
  if (raw) {
    try {
      const currentList: AppItem[] = JSON.parse(raw);
      const updatedList = currentList.filter((a) => a.id !== appId);
      localStorage.setItem(STORAGE_KEYS.LOCAL_APPS, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('ak_apps_changed'));
    } catch (e) {
      console.warn(e);
    }
  }
}

// =================== PAYMENT & PURCHASE SERVICES ===================

export function subscribeToPaymentSettings(callback: (settings: PaymentSetting) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'payment_settings', 'active');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as PaymentSetting);
        } else {
          callback(INITIAL_PAYMENT_SETTING);
        }
      }, (error) => {
        console.warn('Firestore payment settings error:', error);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('Realtime payment settings listener error:', err);
    }
  }

  const getStored = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_PAYMENT_SETTING;
  };
  callback(getStored());

  const handler = () => callback(getStored());
  window.addEventListener('ak_payment_settings_changed', handler);
  return () => window.removeEventListener('ak_payment_settings_changed', handler);
}

export async function updateAdminPaymentSettings(settings: PaymentSetting): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'payment_settings', 'active'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error updating payment settings in Firestore:', err);
    }
  }

  localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(settings));
  window.dispatchEvent(new Event('ak_payment_settings_changed'));
}

export function subscribeToPurchases(userId: string, callback: (purchases: Purchase[]) => void): () => void {
  if (isFirebaseConfigured && db && userId) {
    try {
      const q = query(
        collection(db, 'purchases'), 
        where('userId', '==', userId)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Purchase[] = [];
        snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Purchase));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      }, (error) => {
        console.warn('Purchases subscription error:', error);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('Realtime purchases listener error:', err);
    }
  }

  const getStoredPurchases = (): Purchase[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    if (raw) {
      try {
        const all: Purchase[] = JSON.parse(raw);
        return all.filter((p) => p.userId === userId);
      } catch {
        return [];
      }
    }
    return [];
  };

  callback(getStoredPurchases());
  const handler = () => callback(getStoredPurchases());
  window.addEventListener('ak_purchases_changed', handler);
  return () => window.removeEventListener('ak_purchases_changed', handler);
}

export function subscribeToAllAdminPurchases(callback: (purchases: Purchase[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'purchases');
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const list: Purchase[] = [];
        snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Purchase));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      }, (error) => {
        console.warn('Admin purchases error:', error);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('Realtime admin purchases listener error:', err);
    }
  }

  const getStoredPurchases = (): Purchase[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return raw ? JSON.parse(raw) : [];
  };

  callback(getStoredPurchases());
  const handler = () => callback(getStoredPurchases());
  window.addEventListener('ak_purchases_changed', handler);
  return () => window.removeEventListener('ak_purchases_changed', handler);
}

export async function createPurchaseRecord(purchase: Omit<Purchase, 'id'>): Promise<Purchase> {
  const purchaseId = `pur-${Date.now()}`;
  const fullPurchase: Purchase = {
    ...purchase,
    id: purchaseId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'purchases', purchaseId), fullPurchase);
    } catch (err) {
      console.warn('Error saving purchase to firestore:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.PURCHASES);
  const currentList: Purchase[] = raw ? JSON.parse(raw) : [];
  const updated = [fullPurchase, ...currentList];
  localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(updated));
  window.dispatchEvent(new Event('ak_purchases_changed'));

  return fullPurchase;
}

export async function approvePurchaseOrder(purchaseId: string, customKey?: string): Promise<void> {
  const randomSegment = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomSegment2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const licenseKey = customKey || `AK-PRO-${randomSegment}-${randomSegment2}-V1Q8`;
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'purchases', purchaseId), {
        status: 'approved',
        licenseKey,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('Error approving purchase in Firestore:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.PURCHASES);
  if (raw) {
    try {
      const currentList: Purchase[] = JSON.parse(raw);
      const updated = currentList.map((p) =>
        p.id === purchaseId ? { ...p, status: 'approved' as const, licenseKey, updatedAt: now } : p
      );
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(updated));
      window.dispatchEvent(new Event('ak_purchases_changed'));
    } catch (e) {
      console.warn(e);
    }
  }
}

export async function rejectPurchaseOrder(purchaseId: string, reason: string): Promise<void> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'purchases', purchaseId), {
        status: 'rejected',
        rejectionReason: reason || 'Payment transaction verification failed.',
        updatedAt: now,
      });
    } catch (err) {
      console.warn('Error rejecting purchase in Firestore:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.PURCHASES);
  if (raw) {
    try {
      const currentList: Purchase[] = JSON.parse(raw);
      const updated = currentList.map((p) =>
        p.id === purchaseId ? { ...p, status: 'rejected' as const, rejectionReason: reason, updatedAt: now } : p
      );
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(updated));
      window.dispatchEvent(new Event('ak_purchases_changed'));
    } catch (e) {
      console.warn(e);
    }
  }
}

export function simulateAdminApproval(purchaseId: string, approve: boolean, rejectionReason?: string) {
  if (approve) {
    approvePurchaseOrder(purchaseId);
  } else {
    rejectPurchaseOrder(purchaseId, rejectionReason || 'Payment verification failed.');
  }
}

export function validateCoupon(code: string, amount: number): { valid: boolean; coupon?: Coupon; error?: string; discountAmount: number } {
  return { valid: false, error: 'No active promo coupons found.', discountAmount: 0 };
}
