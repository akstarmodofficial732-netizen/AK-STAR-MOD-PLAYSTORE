import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AppItem, CategoryInfo, Coupon, KeyTier, PaymentSetting, Purchase, ScreenType } from '../types';
import { INITIAL_PAYMENT_SETTING, CATEGORY_ICON_MAP } from '../data/mockData';
import { 
  subscribeToPublishedApps, 
  subscribeToAllAdminApps,
  subscribeToPaymentSettings, 
  subscribeToPurchases, 
  createPurchaseRecord, 
  validateCoupon, 
  simulateAdminApproval,
  saveAppToFirestore,
  deleteAppFromFirestore,
  toggleAppPublishedStatus,
  updateAdminPaymentSettings,
  approvePurchaseOrder,
  rejectPurchaseOrder,
} from '../services/firebase';
import { uploadScreenshotToImageKit } from '../services/imagekit';
import { useAuth } from './AuthContext';

interface AppContextType {
  currentScreen: ScreenType;
  screenHistory: ScreenType[];
  setScreen: (screen: ScreenType) => void;
  goBack: () => void;
  
  // Real Applications catalog loaded strictly from Firebase
  apps: AppItem[];
  isLoadingApps: boolean;
  appsError: string | null;
  selectedApp: AppItem | null;
  setSelectedApp: (app: AppItem | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  
  // Dynamically derived categories from real published apps
  dynamicCategories: CategoryInfo[];
  
  // Key tier & purchase state
  selectedKeyTier: KeyTier | null;
  setSelectedKeyTier: (tier: KeyTier | null) => void;
  activePurchase: Purchase | null;
  setActivePurchase: (purchase: Purchase | null) => void;
  
  // Coupon state
  appliedCoupon: Coupon | null;
  couponCodeInput: string;
  setCouponCodeInput: (code: string) => void;
  couponDiscount: number;
  couponError: string | null;
  couponSuccess: string | null;
  applyCouponCode: (code: string) => boolean;
  removeCouponCode: () => void;
  
  // Realtime Data
  purchases: Purchase[];
  paymentSettings: PaymentSetting;
  
  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchCategoryFilter: string;
  setSearchCategoryFilter: (cat: string) => void;
  searchPriceFilter: 'all' | 'free' | 'premium';
  setSearchPriceFilter: (price: 'all' | 'free' | 'premium') => void;
  searchRatingFilter: number;
  setSearchRatingFilter: (rating: number) => void;
  sortFilter: 'newest' | 'rating' | 'price-asc' | 'price-desc';
  setSortFilter: (sort: 'newest' | 'rating' | 'price-asc' | 'price-desc') => void;

  // Actions
  openAppDetails: (app: AppItem) => void;
  openKeySelection: (app: AppItem) => void;
  proceedToPayment: (app: AppItem, keyTier: KeyTier) => void;
  submitPaymentOrder: (screenshotFile: File) => Promise<Purchase>;
  viewPurchaseKey: (purchase: Purchase) => void;
  
  // Admin App Management Actions
  allAdminApps: AppItem[];
  saveApp: (appData: Partial<AppItem>, existingId?: string) => Promise<string>;
  deleteApp: (appId: string, apkStoragePath?: string, iconStoragePath?: string) => Promise<void>;
  togglePublishApp: (appId: string, published: boolean) => Promise<void>;
  savePaymentSettings: (settings: PaymentSetting) => Promise<void>;
  approveOrder: (purchaseId: string, customKey?: string) => Promise<void>;
  rejectOrder: (purchaseId: string, reason: string) => Promise<void>;
  simulateAdminAction: (purchaseId: string, approve: boolean, reason?: string) => void;
  
  // UI states
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isSupportModalOpen: boolean;
  setIsSupportModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Screens
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>([]);

  // Real Apps loaded strictly from Firebase
  const [apps, setApps] = useState<AppItem[]>([]);
  const [allAdminApps, setAllAdminApps] = useState<AppItem[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);
  const [appsError, setAppsError] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Key Tier & Purchases
  const [selectedKeyTier, setSelectedKeyTier] = useState<KeyTier | null>(null);
  const [activePurchase, setActivePurchase] = useState<Purchase | null>(null);

  // Coupons
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Realtime Data
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting>(INITIAL_PAYMENT_SETTING);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCategoryFilter, setSearchCategoryFilter] = useState<string>('All');
  const [searchPriceFilter, setSearchPriceFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [searchRatingFilter, setSearchRatingFilter] = useState<number>(0);
  const [sortFilter, setSortFilter] = useState<'newest' | 'rating' | 'price-asc' | 'price-desc'>('newest');

  // Modals & UI
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);

  // Navigation helpers
  const setScreen = (newScreen: ScreenType) => {
    setScreenHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(newScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory((old) => old.slice(0, old.length - 1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen('home');
    }
  };

  // 1. Subscribe strictly to REAL published applications from Firebase Firestore
  useEffect(() => {
    setIsLoadingApps(true);
    setAppsError(null);

    const unsubscribe = subscribeToPublishedApps(
      (realPublishedApps) => {
        setApps(realPublishedApps);
        setIsLoadingApps(false);
      },
      (error) => {
        setAppsError('Unable to load apps from Firebase. Please check your connection.');
        setIsLoadingApps(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Subscribe to ALL applications for Admin APK management
  useEffect(() => {
    const unsubAdmin = subscribeToAllAdminApps((adminList) => {
      setAllAdminApps(adminList);
    });
    return () => {
      if (unsubAdmin) unsubAdmin();
    };
  }, []);

  // 3. Realtime payment settings listener
  useEffect(() => {
    const unsubscribe = subscribeToPaymentSettings((settings) => {
      setPaymentSettings(settings);
    });
    return () => unsubscribe();
  }, []);

  // 4. Realtime purchases listener for current user
  useEffect(() => {
    const targetUserId = user?.uid || 'guest-user';
    const unsubscribe = subscribeToPurchases(targetUserId, (list) => {
      setPurchases(list);
      // Auto-update activePurchase if currently listening on payment pending screen
      if (activePurchase) {
        const updated = list.find((p) => p.id === activePurchase.id || p.orderId === activePurchase.orderId);
        if (updated) {
          setActivePurchase(updated);
          if (updated.status === 'approved' && currentScreen === 'payment-pending') {
            setCurrentScreen('key-received');
          }
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid, activePurchase?.id, currentScreen]);

  // 5. Dynamically calculate categories strictly from real published apps
  const dynamicCategories = useMemo<CategoryInfo[]>(() => {
    const categoryMap = new Map<string, { id: string; name: string; count: number }>();
    
    apps.forEach((app) => {
      if (app.category && app.category.trim() !== '') {
        const catName = app.category.trim();
        const catId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const existing = categoryMap.get(catId);
        if (existing) {
          existing.count += 1;
        } else {
          categoryMap.set(catId, {
            id: catId,
            name: catName,
            count: 1,
          });
        }
      }
    });

    return Array.from(categoryMap.values()).map((cat) => ({
      ...cat,
      icon: CATEGORY_ICON_MAP[cat.id] || 'Layers',
      description: `${cat.count} published software application${cat.count === 1 ? '' : 's'} available`,
    }));
  }, [apps]);

  // User Actions
  const openAppDetails = (app: AppItem) => {
    setSelectedApp(app);
    setScreen('app-details');
  };

  const openKeySelection = (app: AppItem) => {
    setSelectedApp(app);
    // If app has key tiers, pick first
    if (app.keyTiers && app.keyTiers.length > 0) {
      setSelectedKeyTier(app.keyTiers[0]);
    } else {
      setSelectedKeyTier({
        id: 'free-tier',
        name: 'Full Version APK',
        type: 'free',
        durationText: 'Unlimited',
        price: 0,
        currency: 'Gold',
        isFree: true,
      });
    }
    setScreen('key-selection');
  };

  const proceedToPayment = (app: AppItem, keyTier: KeyTier) => {
    setSelectedApp(app);
    setSelectedKeyTier(keyTier);
    setScreen('payment');
  };

  const submitPaymentOrder = async (screenshotFile: File): Promise<Purchase> => {
    if (!selectedApp || !selectedKeyTier) {
      throw new Error('No selected software or key tier.');
    }

    let screenshotUrl = '';
    try {
      screenshotUrl = await uploadScreenshotToImageKit(screenshotFile);
    } catch (e) {
      console.warn('Screenshot upload fallback:', e);
      screenshotUrl = URL.createObjectURL(screenshotFile);
    }

    const rawPrice = selectedKeyTier.price;
    const finalAmount = Math.max(0, rawPrice - couponDiscount);
    const orderRef = `AK-${Math.floor(1000 + Math.random() * 9000)}-MOD`;

    const purchasePayload: Omit<Purchase, 'id'> = {
      orderId: orderRef,
      userId: user?.uid || 'guest-user',
      userEmail: user?.email || 'guest@akstarmod.com',
      userName: user?.displayName || 'AK Star User',
      appId: selectedApp.id,
      appName: selectedApp.name,
      appIcon: selectedApp.iconUrl,
      keyTierId: selectedKeyTier.id,
      keyTierName: selectedKeyTier.name,
      originalPrice: rawPrice,
      discount: couponDiscount,
      finalAmount: finalAmount,
      currency: selectedKeyTier.currency,
      couponCode: appliedCoupon?.code,
      paymentScreenshotUrl: screenshotUrl,
      status: 'pending',
      goFileDownloadUrl: selectedApp.goFileUrl || selectedApp.downloadUrl || selectedApp.apkUrl,
      apkUrl: selectedApp.apkUrl || selectedApp.downloadUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await createPurchaseRecord(purchasePayload);
    setActivePurchase(created);

    // If 0 price / free tier, auto-approve immediately
    if (finalAmount === 0) {
      approvePurchaseOrder(created.id);
      setCurrentScreen('key-received');
    } else {
      setCurrentScreen('payment-pending');
    }

    return created;
  };

  const viewPurchaseKey = (purchase: Purchase) => {
    setActivePurchase(purchase);
    if (purchase.status === 'approved') {
      setScreen('key-received');
    } else {
      setScreen('payment-pending');
    }
  };

  const applyCouponCode = (code: string): boolean => {
    if (!selectedKeyTier) return false;
    setCouponError(null);
    setCouponSuccess(null);

    const result = validateCoupon(code, selectedKeyTier.price);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discountAmount);
      setCouponSuccess(`Coupon code applied! You save ${result.discountAmount} ${selectedKeyTier.currency}.`);
      return true;
    } else {
      setCouponError(result.error || 'Invalid promo code');
      return false;
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCodeInput('');
    setCouponError(null);
    setCouponSuccess(null);
  };

  // Admin Management Handlers
  const saveApp = async (appData: Partial<AppItem>, existingId?: string): Promise<string> => {
    return await saveAppToFirestore(appData, existingId);
  };

  const deleteApp = async (appId: string, apkStoragePath?: string, iconStoragePath?: string): Promise<void> => {
    return await deleteAppFromFirestore(appId, apkStoragePath, iconStoragePath);
  };

  const togglePublishApp = async (appId: string, published: boolean): Promise<void> => {
    return await toggleAppPublishedStatus(appId, published);
  };

  const savePaymentSettings = async (settings: PaymentSetting): Promise<void> => {
    return await updateAdminPaymentSettings(settings);
  };

  const approveOrder = async (purchaseId: string, customKey?: string): Promise<void> => {
    return await approvePurchaseOrder(purchaseId, customKey);
  };

  const rejectOrder = async (purchaseId: string, reason: string): Promise<void> => {
    return await rejectPurchaseOrder(purchaseId, reason);
  };

  const simulateAdminAction = (purchaseId: string, approve: boolean, reason?: string) => {
    simulateAdminApproval(purchaseId, approve, reason);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        screenHistory,
        setScreen,
        goBack,
        apps,
        isLoadingApps,
        appsError,
        selectedApp,
        setSelectedApp,
        selectedCategory,
        setSelectedCategory,
        dynamicCategories,
        selectedKeyTier,
        setSelectedKeyTier,
        activePurchase,
        setActivePurchase,
        appliedCoupon,
        couponCodeInput,
        setCouponCodeInput,
        couponDiscount,
        couponError,
        couponSuccess,
        applyCouponCode,
        removeCouponCode,
        purchases,
        paymentSettings,
        searchQuery,
        setSearchQuery,
        searchCategoryFilter,
        setSearchCategoryFilter,
        searchPriceFilter,
        setSearchPriceFilter,
        searchRatingFilter,
        setSearchRatingFilter,
        sortFilter,
        setSortFilter,
        openAppDetails,
        openKeySelection,
        proceedToPayment,
        submitPaymentOrder,
        viewPurchaseKey,
        allAdminApps,
        saveApp,
        deleteApp,
        togglePublishApp,
        savePaymentSettings,
        approveOrder,
        rejectOrder,
        simulateAdminAction,
        isSidebarOpen,
        setIsSidebarOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isSupportModalOpen,
        setIsSupportModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
