import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Mail, AlertCircle, CheckCircle2, Copy, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const { setScreen } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const domain = typeof window !== 'undefined' ? window.location.hostname : '';

  const copyDomain = () => {
    if (domain) {
      navigator.clipboard.writeText(domain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setShowDomainHelp(false);
    try {
      await loginWithGoogle();
      setScreen('home');
    } catch (e: any) {
      console.warn('Google Auth popup notice:', e);
      const isUnauth = 
        e?.code === 'auth/unauthorized-domain' || 
        String(e?.message || '').includes('unauthorized-domain');

      if (isUnauth) {
        setShowDomainHelp(true);
        setShowEmailForm(true);
      } else if (e?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign in popup was closed. Please choose your Gmail account.');
      } else {
        setErrorMessage(e?.message || 'Could not sign in with Google Popup.');
        setShowEmailForm(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorMessage('Please enter a valid Gmail or Email address (e.g. user@gmail.com)');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await loginWithEmail(customEmail.trim(), customName.trim());
      setScreen('home');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="login-screen"
      className="min-h-screen bg-gradient-to-b from-[#121318] via-[#0E0F14] to-[#0A0A0D] flex flex-col items-center justify-center p-4 sm:p-6 text-white select-none relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#F5B014]/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Brand Star Badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-16 h-16 rounded-2xl bg-[#1C1E26] border border-[#F5B014]/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,176,20,0.2)] mb-5"
      >
        <div className="w-10 h-10 rounded-full border border-[#F5B014] flex items-center justify-center bg-[#F5B014]/10">
          <Star className="w-5 h-5 text-[#F5B014] fill-[#F5B014]" />
        </div>
      </motion.div>

      {/* Center Auth Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full max-w-sm bg-[#1D1F27]/90 backdrop-blur-xl border border-[#2D303C] rounded-3xl p-5 sm:p-7 shadow-2xl relative z-10 space-y-4"
      >
        <div>
          <h2 className="text-xl font-extrabold text-center text-[#F2F4F8] mb-1.5 tracking-tight leading-snug">
            Sign In to AK STAR MOD
          </h2>
          <p className="text-xs text-center text-[#9CA3AF] leading-relaxed">
            Select or enter your Google account to access apps, downloads, and key activations.
          </p>
        </div>

        {/* Domain Authorization Notice if triggered */}
        {showDomainHelp && (
          <div className="p-3.5 rounded-2xl bg-[#F5B014]/10 border border-[#F5B014]/30 space-y-2.5 text-left">
            <div className="flex items-center space-x-2 text-[#F5B014] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Firebase Domain Authorization Notice</span>
            </div>
            <p className="text-[11px] text-[#D1D5DB] leading-relaxed">
              Google Auth popup requires adding this preview domain to Firebase Console. In the meantime, you can <strong>log in instantly below</strong> with your Gmail ID!
            </p>
            <div className="flex items-center space-x-1.5 bg-[#12131A] p-2 rounded-xl border border-[#2A2D3C]">
              <span className="text-[10px] text-[#9CA3AF] font-mono truncate flex-1">{domain}</span>
              <button
                type="button"
                onClick={copyDomain}
                className="px-2 py-1 bg-[#F5B014] hover:bg-[#FFD54F] text-black text-[10px] font-bold rounded-lg flex items-center space-x-1 flex-shrink-0 transition-all"
              >
                {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {errorMessage && !showDomainHelp && (
          <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Google Login Button */}
        <button
          id="btn-google-login"
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full h-12 bg-[#0F1015] hover:bg-[#161720] active:scale-[0.98] border border-[#333745] hover:border-[#F5B014]/60 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center space-x-3 transition-all duration-200 shadow-md group disabled:opacity-60"
        >
          {/* Google Color 'G' SVG */}
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
          <span>{isSubmitting ? 'Opening Chooser...' : 'Continue with Google Account'}</span>
        </button>

        {/* Enter Custom Gmail Section */}
        <div className="pt-1">
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full py-2 text-center text-xs text-[#F5B014] hover:underline font-bold flex items-center justify-center space-x-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Or sign in with any other Gmail address</span>
            </button>
          ) : (
            <form onSubmit={handleCustomEmailLogin} className="space-y-3 p-3.5 rounded-2xl bg-[#14151E] border border-[#2B2E3E]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#F5B014] uppercase tracking-wider">
                  Sign in with any Gmail
                </span>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-[10px] text-[#8C91A0] hover:text-white"
                >
                  Hide
                </button>
              </div>

              <div>
                <label className="text-[10px] text-[#8C91A0] font-bold uppercase block mb-1">
                  Gmail / Email ID *
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  className="w-full h-9 bg-[#1B1D27] border border-[#2C2F40] focus:border-[#F5B014] rounded-xl px-3 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8C91A0] font-bold uppercase block mb-1">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-9 bg-[#1B1D27] border border-[#2C2F40] focus:border-[#F5B014] rounded-xl px-3 text-xs text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 bg-[#F5B014] hover:bg-[#FFD54F] active:scale-98 text-black font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Log In With This Gmail</span>
              </button>
            </form>
          )}
        </div>
      </motion.div>

      {/* Footer info */}
      <div className="mt-4 text-center text-[11px] text-[#717684]">
        <span>Firebase Cloud Firestore Powered</span>
      </div>
    </div>
  );
};
