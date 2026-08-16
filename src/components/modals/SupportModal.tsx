import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Headphones, ExternalLink, MessageCircle, Send, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SupportModal: React.FC = () => {
  const { isSupportModalOpen, setIsSupportModalOpen, supportSettings, isLoadingSupportSettings } = useApp();

  const rawWhatsapp = supportSettings?.whatsapp_url?.trim() || '';
  const rawTelegram = supportSettings?.telegram_url?.trim() || '';

  // Format valid URLs with protocols
  const whatsappUrl = rawWhatsapp
    ? rawWhatsapp.startsWith('http://') || rawWhatsapp.startsWith('https://')
      ? rawWhatsapp
      : `https://${rawWhatsapp}`
    : '';

  const telegramUrl = rawTelegram
    ? rawTelegram.startsWith('http://') || rawTelegram.startsWith('https://')
      ? rawTelegram
      : `https://${rawTelegram}`
    : '';

  const isWhatsappAvailable = Boolean(whatsappUrl);
  const isTelegramAvailable = Boolean(telegramUrl);

  const handleOpenLink = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isSupportModalOpen && (
        <div id="support-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSupportModalOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm rounded-3xl bg-[#14151D] border border-[#2B2E3D] p-6 shadow-2xl space-y-5 text-white z-10 overflow-hidden"
          >
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#F5B014]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#25D366]/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1F212D] to-[#171924] border border-[#2E3144] flex items-center justify-center text-[#F5B014] shadow-inner">
                  <Headphones className="w-5 h-5 text-[#F5B014]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-sm font-bold text-white tracking-wide">Contact 24/7 Support</h3>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E93A4]">Instant Help, Order Queries & Key Support</p>
                </div>
              </div>
              <button
                id="btn-close-support-modal"
                onClick={() => setIsSupportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1C1E29] hover:bg-[#282B3B] border border-[#2B2E3D] flex items-center justify-center text-[#8E93A4] hover:text-white transition-colors"
                aria-label="Close Support Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-banner description */}
            <div className="relative p-3.5 rounded-2xl bg-[#191B26] border border-[#26293A] space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#E2E4EE]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Verified Direct Support Channels</span>
              </div>
              <p className="text-[11px] text-[#8C91A0] leading-relaxed">
                Connect directly with the official AK STAR MOD team for fast assistance regarding license keys, orders, or APK installations.
              </p>
            </div>

            {/* Realtime Support Buttons */}
            <div className="space-y-3 pt-1">
              {isLoadingSupportSettings ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 text-[#8C91A0]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#F5B014]" />
                  <span className="text-xs">Fetching dynamic support channels...</span>
                </div>
              ) : (
                <>
                  {/* WhatsApp Support Button */}
                  <button
                    id="btn-support-whatsapp"
                    type="button"
                    disabled={!isWhatsappAvailable}
                    onClick={() => handleOpenLink(whatsappUrl)}
                    className={`w-full group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 shadow-lg ${
                      isWhatsappAvailable
                        ? 'bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/40 hover:border-[#25D366] text-white active:scale-[0.98]'
                        : 'bg-[#181A24] border-[#252838] opacity-50 cursor-not-allowed text-[#7A7F90]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
                        isWhatsappAvailable ? 'bg-[#25D366] text-black font-extrabold' : 'bg-[#252838] text-[#7A7F90]'
                      }`}>
                        <MessageCircle className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-extrabold text-white group-hover:text-[#25D366] transition-colors">
                            WhatsApp Support
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 uppercase">
                            Fastest
                          </span>
                        </div>
                        <p className="text-[10px] text-[#9EA3B5]">
                          {supportSettings.whatsapp_number ? `Direct Chat (${supportSettings.whatsapp_number})` : 'Instant 1-on-1 Chat on WhatsApp'}
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center text-[#25D366] group-hover:translate-x-0.5 transition-transform">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Telegram Channel / Support Button */}
                  <button
                    id="btn-support-telegram"
                    type="button"
                    disabled={!isTelegramAvailable}
                    onClick={() => handleOpenLink(telegramUrl)}
                    className={`w-full group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 shadow-lg ${
                      isTelegramAvailable
                        ? 'bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border-[#229ED9]/40 hover:border-[#229ED9] text-white active:scale-[0.98]'
                        : 'bg-[#181A24] border-[#252838] opacity-50 cursor-not-allowed text-[#7A7F90]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
                        isTelegramAvailable ? 'bg-[#229ED9] text-white font-extrabold' : 'bg-[#252838] text-[#7A7F90]'
                      }`}>
                        <Send className="w-5 h-5 fill-current -ml-0.5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-extrabold text-white group-hover:text-[#229ED9] transition-colors">
                            Telegram Support
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 uppercase">
                            Channel
                          </span>
                        </div>
                        <p className="text-[10px] text-[#9EA3B5]">
                          {supportSettings.telegram_username ? `Join ${supportSettings.telegram_username}` : 'Official Telegram Updates & Support'}
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center text-[#229ED9] group-hover:translate-x-0.5 transition-transform">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Footer / Notice */}
            <div className="text-center pt-1 border-t border-[#232533]">
              <p className="text-[10px] text-[#6D7282]">
                Average response time: <span className="text-[#34D399] font-semibold">&lt; 5 minutes</span> (24/7 Active)
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
