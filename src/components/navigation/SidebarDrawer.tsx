import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Home, 
  LayoutGrid, 
  Search, 
  ShoppingBag, 
  User, 
  LogOut, 
  LogIn,
  Sliders,
  HelpCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getGmailAvatarUrl, checkIsAdmin } from '../../services/firebase';

export const SidebarDrawer: React.FC = () => {
  const { 
    isSidebarOpen, 
    setIsSidebarOpen, 
    setScreen, 
    setSelectedCategory,
    dynamicCategories,
    setIsSupportModalOpen,
  } = useApp();
  const { user, logout } = useAuth();
  const [drawerImgErr, setDrawerImgErr] = useState(false);

  const isAuthenticated = Boolean(user && !user.isGuest && user.email);
  const isUserAdmin = Boolean(user && !user.isGuest && (user.isAdmin || checkIsAdmin(user.email)));

  const userEmail = user?.email || '';
  const userDisplayName = user?.displayName || (userEmail ? userEmail.split('@')[0] : 'Guest Explorer');
  const avatarUrl = drawerImgErr || !user?.photoURL
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=F5B014&color=000000&bold=true`
    : user.photoURL;

  const handleNav = (screen: any) => {
    setScreen(screen);
    setIsSidebarOpen(false);
  };

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
    setScreen('category-detail');
    setIsSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await logout();
    setIsSidebarOpen(false);
    setScreen('login');
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-4/5 max-w-xs bg-[#0F1015] border-r border-[#222430] h-full flex flex-col justify-between p-5 shadow-2xl overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1E202B]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F5B014] flex items-center justify-center font-extrabold text-black text-sm shadow-md">
                    AK
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-white tracking-wide">AK STAR MOD</h2>
                    <p className="text-[10px] text-[#F5B014] font-medium">Official APK Repository</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-lg text-[#8C91A0] hover:text-white hover:bg-[#1E202B] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User card in sidebar */}
              <div className="my-4 p-3 rounded-xl bg-[#171922] border border-[#262835] flex items-center space-x-3">
                <img
                  src={avatarUrl}
                  alt={userDisplayName}
                  onError={() => setDrawerImgErr(true)}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-[#F5B014] bg-[#1C1E2A]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                  <p className="text-[10px] text-[#F5B014] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5B014] animate-ping" />
                    {isAuthenticated 
                      ? (isUserAdmin ? 'Admin Master' : 'Google Verified') 
                      : 'Guest / Not Signed In'}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 my-3">
                <p className="text-[10px] font-bold text-[#6D7282] uppercase tracking-wider px-2 mb-2">Navigation</p>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#D0D4E0] hover:text-[#F5B014] hover:bg-[#181A24] transition-all"
                >
                  <Home className="w-4 h-4 text-[#F5B014]" />
                  <span>Home Marketplace</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('categories')}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#D0D4E0] hover:text-[#F5B014] hover:bg-[#181A24] transition-all"
                >
                  <LayoutGrid className="w-4 h-4 text-[#F5B014]" />
                  <span>All Categories</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('search')}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#D0D4E0] hover:text-[#F5B014] hover:bg-[#181A24] transition-all"
                >
                  <Search className="w-4 h-4 text-[#F5B014]" />
                  <span>Search Applications</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('purchases')}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#D0D4E0] hover:text-[#F5B014] hover:bg-[#181A24] transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-[#F5B014]" />
                  <span>My Orders & Keys</span>
                </button>

                {/* Role-Based Admin Link: ONLY visible for genuine Admins */}
                {isUserAdmin && (
                  <button
                    type="button"
                    onClick={() => handleNav('admin')}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#F5B014] bg-[#F5B014]/10 border border-[#F5B014]/30 hover:bg-[#F5B014]/20 transition-all"
                  >
                    <Sliders className="w-4 h-4 text-[#F5B014]" />
                    <span>Admin Console (Upload APK)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleNav('profile')}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#D0D4E0] hover:text-[#F5B014] hover:bg-[#181A24] transition-all"
                >
                  <User className="w-4 h-4 text-[#F5B014]" />
                  <span>Profile Settings</span>
                </button>
              </div>

              {/* Dynamic Categories */}
              {dynamicCategories.length > 0 && (
                <div className="space-y-1 my-4 pt-3 border-t border-[#1C1E28]">
                  <p className="text-[10px] font-bold text-[#6D7282] uppercase tracking-wider px-2 mb-2">Live Categories</p>
                  <div className="grid grid-cols-2 gap-1.5 px-1">
                    {dynamicCategories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat.name)}
                        className="text-left text-[11px] px-2.5 py-1.5 rounded-md bg-[#161720] hover:bg-[#1F212E] text-[#B5BAC8] hover:text-[#F5B014] truncate transition-colors"
                      >
                        {cat.name} ({cat.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Real Firebase Status notice */}
              <div className="mt-3 p-2.5 rounded-lg bg-[#141620] border border-[#232636]">
                <div className="flex items-center space-x-2 text-[11px] font-bold text-[#10B981]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span>Firebase Synchronized</span>
                </div>
                <p className="text-[10px] text-[#7E8394] mt-1 leading-relaxed">
                  Applications & APKs are loaded directly from Firebase Firestore.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#1E202B] space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsSupportModalOpen(true);
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#161822] text-xs font-semibold text-[#8C91A0] hover:text-white transition-all"
              >
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-[#F5B014]" />
                  <span>Help & Support</span>
                </div>
              </button>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav('login')}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#F5B014] hover:bg-[#F5B014]/10 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
