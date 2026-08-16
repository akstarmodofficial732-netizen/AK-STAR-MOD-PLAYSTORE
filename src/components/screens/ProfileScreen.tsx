import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  CheckCircle2,
  Sliders,
  Database,
  LogIn,
  Mail,
  AlertCircle,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getGmailAvatarUrl, checkIsAdmin } from '../../services/firebase';
import { TopHeader } from '../navigation/TopHeader';

export const ProfileScreen: React.FC = () => {
  const { user, logout, loginWithGoogle, loginWithEmail, isLoading } = useAuth();
  const { setScreen, setIsSupportModalOpen } = useApp();
  
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  
  // Custom email / switch form state
  const [switchEmail, setSwitchEmail] = useState('');
  const [switchName, setSwitchName] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  
  // Login card state when signed out
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showEmailLoginInput, setShowEmailLoginInput] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [imageError, setImageError] = useState(false);

  // Determine if user is genuinely authenticated
  const isAuthenticated = Boolean(user && !user.isGuest && user.email);
  const isUserAdmin = Boolean(user && !user.isGuest && (user.isAdmin || checkIsAdmin(user.email)));

  const handleLogout = async () => {
    try {
      await logout();
      setImageError(false);
    } catch (err) {
      console.warn('Logout error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      console.warn('Google sign-in error on profile:', e);
      if (e?.code === 'auth/unauthorized-domain' || String(e?.message || '').includes('unauthorized-domain')) {
        setLoginError('Domain pending Firebase authorization. You can sign in directly with any Gmail address below.');
        setShowEmailLoginInput(true);
      } else if (e?.code === 'auth/popup-closed-by-user') {
        setLoginError('Sign in popup was closed. Please select an account.');
      } else {
        setLoginError(e?.message || 'Google sign-in failed. Please try again or use Gmail login.');
        setShowEmailLoginInput(true);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setLoginError('Please enter a valid Gmail address.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await loginWithEmail(emailInput.trim(), nameInput.trim());
      setEmailInput('');
      setNameInput('');
    } catch (err: any) {
      setLoginError(err?.message || 'Failed to sign in.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSwitch = async () => {
    setIsSwitching(true);
    setSwitchError(null);
    try {
      await loginWithGoogle();
      setShowSwitchAccountModal(false);
    } catch (e: any) {
      console.warn('Switch account notice:', e);
      if (e?.code === 'auth/unauthorized-domain' || String(e?.message || '').includes('unauthorized-domain')) {
        setSwitchError('Preview domain pending Firebase authorization. You can enter any Gmail ID below directly.');
      } else {
        setSwitchError(e?.message || 'Could not choose Google account. Please enter Gmail below.');
      }
    } finally {
      setIsSwitching(false);
    }
  };

  const handleCustomSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchEmail.trim() || !switchEmail.includes('@')) return;
    setIsSwitching(true);
    try {
      await loginWithEmail(switchEmail.trim(), switchName.trim());
      setShowSwitchAccountModal(false);
      setSwitchEmail('');
      setSwitchName('');
    } finally {
      setIsSwitching(false);
    }
  };

  // Profile data derived exclusively from real authenticated user
  const userEmail = user?.email || '';
  const userDisplayName = user?.displayName || (userEmail ? userEmail.split('@')[0] : 'User');
  const avatarUrl = imageError || !user?.photoURL
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=F5B014&color=000000&bold=true`
    : user.photoURL;

  return (
    <div id="profile-screen" className="min-h-screen bg-[#0A0B0E] pb-24 text-white">
      <TopHeader title="Profile" showBack={false} />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-3xl px-4 pt-4 space-y-5">
        {/* ================= AUTH STATE HEADER CARD ================= */}
        {isAuthenticated ? (
          /* ================= LOGGED IN USER CARD ================= */
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-[#14151D] border border-[#232533] flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center space-x-4 min-w-0">
              <div className="relative flex-shrink-0">
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

              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate">
                  {userDisplayName}
                </h2>
                <p className="text-xs text-[#8C91A0] truncate">
                  {userEmail}
                </p>

                <div className="mt-2 flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    isUserAdmin 
                      ? 'bg-[#F5B014]/20 border border-[#F5B014]/40 text-[#F5B014]' 
                      : 'bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]'
                  }`}>
                    {isUserAdmin ? (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Admin Master</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Google Verified</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <button
              id="btn-profile-switch-id"
              type="button"
              onClick={() => setShowSwitchAccountModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#222533] hover:bg-[#F5B014] text-[#8C91A0] hover:text-black font-extrabold text-[11px] transition-colors flex-shrink-0"
            >
              Switch ID
            </button>
          </motion.section>
        ) : (
          /* ================= SIGNED OUT / GUEST CARD ================= */
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-[#14151D] border border-[#F5B014]/30 shadow-xl space-y-4 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1C1E26] border border-[#F5B014]/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,176,20,0.15)]">
              <Lock className="w-6 h-6 text-[#F5B014]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white">
                Not Signed In
              </h2>
              <p className="text-xs text-[#8C91A0] max-w-sm mx-auto leading-relaxed">
                Sign in with your Google Account to access software downloads, cloud license keys, and manage orders.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] text-xs flex items-start space-x-2 text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{loginError}</span>
              </div>
            )}

            <div className="space-y-2 pt-1 max-w-sm mx-auto">
              {/* Google Sign-In Button */}
              <button
                id="btn-profile-google-signin"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="w-full h-11 bg-[#0F1015] hover:bg-[#161720] active:scale-[0.98] border border-[#333745] hover:border-[#F5B014]/60 rounded-xl font-bold text-xs text-white flex items-center justify-center space-x-3 transition-all duration-200 shadow-md group disabled:opacity-60"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span>{isLoggingIn ? 'Opening Chooser...' : 'Sign In with Google'}</span>
              </button>

              {/* Enter Custom Gmail Option */}
              {!showEmailLoginInput ? (
                <button
                  type="button"
                  onClick={() => setShowEmailLoginInput(true)}
                  className="w-full py-1.5 text-center text-xs text-[#F5B014] hover:underline font-bold flex items-center justify-center space-x-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Or sign in with any Gmail address</span>
                </button>
              ) : (
                <form onSubmit={handleEmailSignIn} className="space-y-2.5 p-3 rounded-2xl bg-[#0F1015] border border-[#2B2E3E] text-left">
                  <p className="text-[11px] font-bold text-[#F5B014]">Sign In with Gmail</p>
                  <div>
                    <label className="text-[10px] text-[#8C91A0] block mb-1">Gmail Address</label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full h-9 bg-[#171922] border border-[#2C2F40] focus:border-[#F5B014] rounded-xl px-3 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8C91A0] block mb-1">Display Name (Optional)</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full h-9 bg-[#171922] border border-[#2C2F40] focus:border-[#F5B014] rounded-xl px-3 text-xs text-white outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-2 bg-[#F5B014] hover:bg-[#FFD54F] text-black font-extrabold text-xs rounded-xl transition-all"
                  >
                    {isLoggingIn ? 'Signing In...' : 'Continue with this Email'}
                  </button>
                </form>
              )}
            </div>
          </motion.section>
        )}

        {/* ================= MENU LIST ================= */}
        <section className="bg-[#14151D] border border-[#232533] rounded-3xl overflow-hidden divide-y divide-[#1F212E] shadow-md">
          {/* ================= ROLE-BASED ADMIN BUTTON ================= */}
          {/* CRITICAL: ONLY visible if logged in and confirmed admin */}
          {isUserAdmin && (
            <button
              id="btn-profile-admin-console"
              type="button"
              onClick={() => setScreen('admin')}
              className="w-full flex items-center justify-between p-4 bg-[#F5B014]/10 hover:bg-[#F5B014]/20 transition-colors text-left group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F5B014] flex items-center justify-center text-black shadow-md">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-[#F5B014] group-hover:text-white transition-colors">
                      Admin Console (Upload APK & Manage Apps)
                    </span>
                    <span className="text-[9px] bg-[#F5B014] text-black font-extrabold px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A6ACBE]">
                    Upload APK files, toggle published state, manage UPI settings & orders
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#F5B014] group-hover:text-white flex-shrink-0" />
            </button>
          )}

          {/* Switch Account (Available if logged in) */}
          {isAuthenticated && (
            <button
              id="btn-profile-switch-account"
              type="button"
              onClick={() => setShowSwitchAccountModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#181A24] transition-colors text-left group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#1D1F2A] flex items-center justify-center text-[#F5B014]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-[#F5B014] transition-colors block">
                    Switch / Change Google Account
                  </span>
                  <span className="text-[10px] text-[#717684]">
                    Log in with another Gmail address or account
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6A6F80] group-hover:text-white" />
            </button>
          )}

          {/* My Purchases */}
          <button
            id="btn-profile-purchases"
            type="button"
            onClick={() => setScreen('purchases')}
            className="w-full flex items-center justify-between p-4 hover:bg-[#181A24] transition-colors text-left group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#1D1F2A] flex items-center justify-center text-[#F5B014]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white group-hover:text-[#F5B014] transition-colors block">
                  My Purchases & License Keys
                </span>
                <span className="text-[10px] text-[#717684]">
                  View purchased software, activation keys, and download links
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6A6F80] group-hover:text-white" />
          </button>

          {/* Settings */}
          <button
            id="btn-profile-settings"
            type="button"
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
            type="button"
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
            type="button"
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
            type="button"
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
            AK STAR MOD is synced directly with Firebase Firestore. Only published applications uploaded by the administrator are visible to users.
          </p>
        </div>

        {/* ================= SIGN OUT BUTTON (Available if logged in) ================= */}
        {isAuthenticated ? (
          <button
            id="btn-logout"
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-[#171923] hover:bg-[#EF4444]/15 border border-[#282A3A] hover:border-[#EF4444]/50 text-xs font-bold text-[#EF4444] flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-[0.99]"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoading ? 'Signing Out...' : 'Sign Out / Logout'}</span>
          </button>
        ) : (
          <button
            id="btn-profile-login-redirect"
            type="button"
            onClick={() => setScreen('login')}
            className="w-full h-12 rounded-2xl bg-[#F5B014] hover:bg-[#FFD54F] text-black font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-[0.99]"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Your Account</span>
          </button>
        )}
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
              type="button"
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
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 bg-[#F5B014] text-black font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Switch Account Modal */}
      {showSwitchAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14151D] border border-[#262838] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232533] pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Switch Gmail / Account
              </h3>
              <button
                type="button"
                onClick={() => setShowSwitchAccountModal(false)}
                className="text-xs text-[#8C91A0] hover:text-white"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-[#9DA2B3] leading-relaxed">
              Sign in with another Google account or enter any Gmail to immediately switch your profile.
            </p>

            {switchError && (
              <div className="p-2.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] text-[11px] leading-snug">
                {switchError}
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSwitch}
              disabled={isSwitching}
              className="w-full h-11 bg-[#0E0F14] hover:bg-[#181A24] border border-[#2F3244] hover:border-[#F5B014] rounded-xl font-bold text-xs text-white flex items-center justify-center space-x-2 transition-all"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                />
              </svg>
              <span>{isSwitching ? 'Opening Account Chooser...' : 'Google Account Chooser'}</span>
            </button>

            <div className="relative my-2 flex items-center justify-center">
              <div className="w-full border-t border-[#232533]" />
              <span className="bg-[#14151D] px-2 text-[10px] uppercase font-bold text-[#6F7486] absolute">
                Or Direct Gmail ID
              </span>
            </div>

            <form onSubmit={handleCustomSwitch} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#8C91A0] block mb-1">Gmail Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@gmail.com"
                  value={switchEmail}
                  onChange={(e) => setSwitchEmail(e.target.value)}
                  className="w-full h-9 bg-[#191B24] border border-[#292C3C] focus:border-[#F5B014] rounded-xl px-3 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8C91A0] block mb-1">Display Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={switchName}
                  onChange={(e) => setSwitchName(e.target.value)}
                  className="w-full h-9 bg-[#191B24] border border-[#292C3C] focus:border-[#F5B014] rounded-xl px-3 text-xs text-white outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSwitching}
                className="w-full py-2 bg-[#F5B014] hover:bg-[#FFD54F] text-black font-extrabold text-xs rounded-xl transition-all"
              >
                Switch Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
