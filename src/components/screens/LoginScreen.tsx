import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, exploreAsGuest } = useAuth();
  const { setScreen } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      setScreen('home');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = () => {
    exploreAsGuest();
    setScreen('home');
  };

  return (
    <div 
      id="login-screen"
      className="min-h-screen bg-gradient-to-b from-[#121318] via-[#0E0F14] to-[#0A0A0D] flex flex-col items-center justify-center p-6 text-white select-none relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#F5B014]/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Brand Star Badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-16 h-16 rounded-2xl bg-[#1C1E26] border border-[#F5B014]/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,176,20,0.2)] mb-8"
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
        className="w-full max-w-sm bg-[#1D1F27]/90 backdrop-blur-xl border border-[#2D303C] rounded-3xl p-7 shadow-2xl relative z-10"
      >
        <h2 className="text-xl font-bold text-center text-[#F2F4F8] mb-2 tracking-tight leading-snug">
          Welcome to the Premium Marketplace
        </h2>
        <p className="text-xs text-center text-[#9CA3AF] mb-7 leading-relaxed px-2">
          Exclusive tools and resources for power users. Sign in to access your dashboard.
        </p>

        {/* Google Login Button */}
        <button
          id="btn-google-login"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full h-12 bg-[#0F1015] hover:bg-[#161720] active:scale-[0.98] border border-[#333745] hover:border-[#F5B014]/50 rounded-xl font-semibold text-sm text-white flex items-center justify-center space-x-3 transition-all duration-200 shadow-md group disabled:opacity-60"
        >
          {/* Google Color 'G' SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <span>{isSubmitting ? 'Signing in...' : 'Continue with Google'}</span>
        </button>

        {/* OR Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-[#2D303D]" />
          <span className="absolute bg-[#1D1F27] px-3 text-[11px] font-medium tracking-widest text-[#717684] uppercase">
            OR
          </span>
        </div>

        {/* Explore as Guest Button */}
        <button
          id="btn-explore-guest"
          onClick={handleGuest}
          className="w-full h-12 bg-transparent hover:bg-[#F5B014]/5 active:scale-[0.98] border border-[#444857] hover:border-[#F5B014] rounded-xl font-semibold text-sm text-[#F5B014] flex items-center justify-center space-x-2 transition-all duration-200"
        >
          <span>Explore as Guest</span>
          <ArrowRight className="w-4 h-4 text-[#F5B014]" />
        </button>
      </motion.div>

      {/* Footer policy links */}
      <div className="mt-8 text-center text-xs text-[#717684] flex items-center space-x-3">
        <button 
          onClick={() => {}} 
          className="hover:text-[#F5B014] transition-colors"
        >
          Privacy Policy
        </button>
        <span>•</span>
        <button 
          onClick={() => {}} 
          className="hover:text-[#F5B014] transition-colors"
        >
          Terms of Service
        </button>
      </div>
    </div>
  );
};
