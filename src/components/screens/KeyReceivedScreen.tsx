import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Key, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../navigation/TopHeader';

export const KeyReceivedScreen: React.FC = () => {
  const { activePurchase, setScreen } = useApp();
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    // Fire gold & green celebration confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#F5B014', '#FFD54F', '#10B981', '#ffffff'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleCopyKey = () => {
    if (activePurchase?.licenseKey) {
      navigator.clipboard.writeText(activePurchase.licenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const licenseKey = activePurchase?.licenseKey || 'AK-PRO-X7Y9-L4M2-V1Q8';
  const downloadUrl = activePurchase?.goFileDownloadUrl || 'https://gofile.io/d/akstar-focusflow-v241';

  return (
    <div id="key-received-screen" className="min-h-screen bg-[#0A0B0E] pb-24 text-white">
      <TopHeader title="Key Received" showBack={true} onBack={() => setScreen('home')} />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-5 space-y-5 text-center">
        {/* Glowing Success Badge */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative inline-flex items-center justify-center mx-auto"
        >
          <div className="absolute inset-0 rounded-full bg-[#10B981]/20 blur-xl scale-125" />
          <div className="w-18 h-18 rounded-full bg-[#15231C] border-2 border-[#10B981] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
          </div>
        </motion.div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Payment Approved!
          </h2>
          <p className="text-xs text-[#8E93A4] max-w-xs mx-auto">
            Your license key is now activated and verified by admin.
          </p>
        </div>

        {/* License Key Golden Box matching Screenshot 10 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-3xl bg-[#14151D] border-2 border-[#F5B014]/60 shadow-[0_0_25px_rgba(245,176,20,0.2)] space-y-3 text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F5B014] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>YOUR UNIQUE LICENSE KEY</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] text-[9px] font-bold uppercase">
              Active
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D0E13] border border-[#2B2E3D] flex items-center justify-between">
            <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider break-all select-all">
              {licenseKey}
            </span>
          </div>

          {/* Copy Button */}
          <button
            id="btn-copy-license-key"
            onClick={handleCopyKey}
            className="w-full h-11 bg-[#F5B014] hover:bg-[#FFD54F] active:scale-98 text-black font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            {copiedKey ? (
              <>
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>LICENSE KEY COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-black" />
                <span>COPY LICENSE KEY</span>
              </>
            )}
          </button>
        </motion.div>

        {/* GoFile Direct Software Binary Download */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-2xl bg-[#14151D] border border-[#232533] text-left space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Download Software Package</h4>
              <p className="text-[10px] text-[#8C91A0]">High speed mirror hosted on GoFile</p>
            </div>
            <span className="text-[10px] font-mono text-[#F5B014]">APK / Binary</span>
          </div>

          <a
            id="btn-download-gofile"
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 bg-[#1A1C27] hover:bg-[#232635] border border-[#2E3142] hover:border-[#F5B014]/50 rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all group"
          >
            <Download className="w-4 h-4 text-[#F5B014] group-hover:scale-110 transition-transform" />
            <span>DOWNLOAD FROM GOFILE</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8C91A0]" />
          </a>
        </motion.div>

        {/* Order Info Card */}
        {activePurchase && (
          <div className="p-4 rounded-2xl bg-[#14151D] border border-[#232533] text-left space-y-2 text-xs text-[#8E93A4]">
            <div className="flex justify-between">
              <span>Order ID</span>
              <span className="font-mono text-white font-semibold">{activePurchase.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Software</span>
              <span className="text-white font-semibold">{activePurchase.appName}</span>
            </div>
            <div className="flex justify-between">
              <span>Tier</span>
              <span className="text-white font-semibold">{activePurchase.keyTierName}</span>
            </div>
          </div>
        )}

        {/* How to activate note */}
        <p className="text-[11px] text-[#717684] leading-relaxed max-w-xs mx-auto">
          💡 Install the downloaded software APK and paste your license key in the activation prompt.
        </p>

        {/* Bottom Nav Action */}
        <div className="pt-2 space-y-2">
          <button
            id="btn-view-purchases"
            onClick={() => setScreen('purchases')}
            className="w-full h-11 bg-[#1A1C27] hover:bg-[#222533] border border-[#2C2F3F] rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-[#F5B014]" />
            <span>Go to My Purchases</span>
          </button>
        </div>
      </main>
    </div>
  );
};
