import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SplashScreen: React.FC = () => {
  const { setScreen } = useApp();
  const [progress, setProgress] = useState<number>(15);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(45), 400);
    const timer2 = setTimeout(() => setProgress(80), 900);
    const timer3 = setTimeout(() => setProgress(100), 1400);
    const timer4 = setTimeout(() => {
      setScreen('home');
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [setScreen]);

  return (
    <div 
      id="splash-screen"
      className="fixed inset-0 z-50 bg-[#090A0D] flex flex-col items-center justify-between py-16 px-6 text-center select-none"
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Glowing Star Circular Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative flex items-center justify-center mb-6"
        >
          <div className="absolute inset-0 rounded-full bg-[#F5B014]/20 blur-xl scale-125" />
          <div className="w-20 h-20 rounded-full bg-[#161820] border-2 border-[#F5B014] flex items-center justify-center shadow-[0_0_25px_rgba(245,176,20,0.35)]">
            <Star className="w-10 h-10 text-[#F5B014] fill-[#F5B014]" />
          </div>
        </motion.div>

        {/* Brand Typography */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold tracking-wider text-[#F5B014] mb-1 font-sans">
            AK STAR MOD
          </h1>
          <p className="text-xs font-semibold tracking-[0.25em] text-[#9A9EAA] uppercase">
            ELITE UTILITY
          </p>
        </motion.div>
      </div>

      {/* Bottom Progress Bar & Loading Text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-xs flex flex-col items-center space-y-3"
      >
        <div className="w-48 h-1 bg-[#1A1C24] rounded-full overflow-hidden relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F5B014] to-[#FFE082] rounded-full shadow-[0_0_8px_#F5B014]"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeInOut', duration: 0.4 }}
          />
        </div>
        <span className="text-xs text-[#717684] tracking-wide font-medium">
          Initializing Environment...
        </span>
      </motion.div>
    </div>
  );
};
