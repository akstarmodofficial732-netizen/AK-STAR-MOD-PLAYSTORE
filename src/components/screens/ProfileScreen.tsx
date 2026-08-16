import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  ShoppingBag, 
  Settings, 
  ShieldCheck, 
  FileText, 
  Headphones, 
  LogOut, 
  ChevronRight, 
  Sparkles, 
  ExternalLink,
  Smartphone,
  CheckCircle2,
  Sliders,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getGmailAvatarUrl } from '../../services/firebase';
import { TopHeader } from '../navigation/TopHeader';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { setScreen, setIsSupportModalOpen } = useApp();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLogout = async () => {
    await logout();
    setScreen('login');
  };

  const userEmail = user?.email || 'akstarmodofficial732@gmail.com';
  const userDisplayName = user?.displayName || 'AK Star User';
  const avatarUrl = imageError 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=F5B014&color=000000&bold=true`
    : (user?.photoURL || getGmailAvatarUrl(userEmail, userDisplayName));

  return (
    <div id="profile-screen" className="min-h-screen bg-[#0A0B0E] pb-24 text-white">
      <TopHeader title="Profile" showBack={false} />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-4 space-y-5">
        {/* ================= USER PROFILE CARD ================= */}
        <section className="p-5 rounded-3xl bg-[#14151D] border border-[#232533] flex items-center space-x-4 shadow-md">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={userDisplayName}
              onError={() => setImageError(true)}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#F5B014] shadow-md bg-[#1C1E2A]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-[#14151D] flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">
              {userDisplayName}
            </h2>
            <p className="text-xs text-[#8C91A0] truncate">
              {userEmail}
            </p>

            <div className="mt-2 flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#F5B014]/20 border border-[#F5B014]/40 text-[#F5B014] text-[10px] font-extrabold uppercase">
                <Sparkles className="w-3 h-3" />
                <span>{user?.isGuest ? 'Guest Access' : 'Active Member'}</span>
              </span>
            </div>
          </div>
        </section>

        {/* ================= MENU LIST ================= */}
        <section className="bg-[#14151D] border border-[#232533] rounded-3xl overflow-hidden divide-y divide-[#1F212E] shadow-md">
          {/* Admin APK Console */}
          <button
            id="btn-profile-admin-console"
            onClick={() => setScreen('admin')}
            className="w-full flex items-center justify-between p-4 bg-[#F5B014]/10 hover:bg-[#F5B014]/20 transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F5B014] flex items-center justify-center text-black shadow-md">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#F5B014] group-hover:text-white transition-colors block">
                  Admin Console (Upload APK & Manage Apps)
                </span>
                <span className="text-[10px] text-[#A6ACBE]">
                  Add APKs, toggle published/draft, update UPI settings
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#F5B014] group-hover:text-white" />
          </button>

          {/* My Purchases */}
          <button
            id="btn-profile-purchases"
            onClick={() => setScreen('purchases')}
            className="w-full flex items-center justify-between p-4 hover:bg-[#181A24] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#1D1F2A] flex items-center justify-center text-[#F5B014]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-[#F5B014] transition-colors">
                My Purchases & License Keys
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6A6F80] group-hover:text-white" />
          </button>

          {/* Settings */}
          <button
            id="btn-profile-settings"
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#181A24] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#1D1F2A] flex items-center justify-center text-[#F5B014]">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-[#F5B014] transition-colors">
                Settings & Preferences
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6A6F80] group-hover:text-white" />
          </button>

          {/* Privacy Policy */}
          <button
            id="btn-profile-privacy"
            onClick={() => setShowPrivacyModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#181A24] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#1D1F2A] flex items-center justify-center text-[#F5B014]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-[#F5B014] transition-colors">
                Privacy Policy & Security
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6A6F80] group-hover:text-white" />
          </button>

          {/* Terms */}
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#181A24] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#1D1F2A] flex items-center justify-center text-[#F5B014]">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-[#F5B014] transition-colors">
                Terms of Service
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6A6F80] group-hover:text-white" />
          </button>

          {/* Contact Support */}
          <button
            id="btn-profile-support"
            onClick={() => setIsSupportModalOpen(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#181A24] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#1D1F2A] flex items-center justify-center text-[#F5B014]">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-[#F5B014] transition-colors">
                Contact 24/7 Support
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6A6F80] group-hover:text-white" />
          </button>
        </section>

        {/* Database & Cloud Architecture Specs */}
        <div className="p-4 rounded-2xl bg-[#14151D] border border-[#232533] space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#10B981]">
            <Database className="w-4 h-4" />
            <span>Firebase Firestore Live Integration</span>
          </div>
          <p className="text-xs text-[#8E93A4] leading-relaxed">
            AK STAR MOD is connected to Firebase Firestore. Only published applications uploaded by the administrator are visible to users.
          </p>
        </div>

        {/* ================= LOGOUT BUTTON ================= */}
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl bg-[#171923] hover:bg-[#EF4444]/15 border border-[#282A3A] hover:border-[#EF4444]/50 text-xs font-bold text-[#EF4444] flex items-center justify-center space-x-2 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </main>

      {/* Privacy / Terms Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14151D] border border-[#262838] rounded-3xl max-w-md w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Privacy Policy & Terms</h3>
            <p className="text-xs text-[#9DA2B3] leading-relaxed">
              AK STAR MOD guarantees secure software distribution. All transactions and license keys are tied directly to your authenticated Google account and Firebase Firestore database.
            </p>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 bg-[#F5B014] text-black font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14151D] border border-[#262838] rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Preferences</h3>
            <div className="space-y-3 text-xs text-[#9DA2B3]">
              <div className="flex items-center justify-between py-2 border-b border-[#232533]">
                <span>Cloud Sync</span>
                <span className="text-[#10B981] font-bold">Enabled</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#232533]">
                <span>Color Theme</span>
                <span className="text-[#F5B014] font-bold">Dark Gold Pro</span>
              </div>
            </div>
            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 bg-[#F5B014] text-black font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
