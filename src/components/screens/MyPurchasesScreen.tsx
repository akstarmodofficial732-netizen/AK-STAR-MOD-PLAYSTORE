import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  X, 
  Key, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../navigation/TopHeader';
import { Purchase } from '../../types';

export const MyPurchasesScreen: React.FC = () => {
  const { purchases, setScreen, viewPurchaseKey, simulateAdminAction } = useApp();
  const [selectedPurchaseModal, setSelectedPurchaseModal] = useState<Purchase | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopy = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div id="purchases-screen" className="min-h-screen bg-[#0A0B0E] pb-24 text-white">
      <TopHeader title="My Purchases" showBack={false} />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-4 space-y-4">
        {/* Realtime sync info pill */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#14151D] border border-[#232533] text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#8E93A4]">Realtime Sync Active</span>
          </div>
          <span className="text-[#F5B014] font-bold font-mono">
            {purchases.length} {purchases.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#14151D] rounded-3xl border border-[#232533] space-y-3">
            <ShoppingBag className="w-10 h-10 text-[#555A6C] mx-auto" />
            <h3 className="text-sm font-bold text-white">No Purchases Yet</h3>
            <p className="text-xs text-[#7E8394] max-w-xs mx-auto">
              Explore our software marketplace to acquire elite modded tools and license keys.
            </p>
            <button
              onClick={() => setScreen('home')}
              className="mt-2 px-5 py-2 rounded-xl bg-[#F5B014] text-black font-extrabold text-xs shadow-md"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => {
              const isApproved = purchase.status === 'approved';
              const isPending = purchase.status === 'pending';
              const isRejected = purchase.status === 'rejected';

              return (
                <motion.div
                  key={purchase.id}
                  id={`purchase-item-${purchase.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-[#14151D] border border-[#232533] hover:border-[#2E3144] space-y-3 shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={purchase.appIcon}
                        alt={purchase.appName}
                        className="w-12 h-12 rounded-xl object-cover border border-[#282B3B] flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {purchase.appName}
                        </h4>
                        <p className="text-xs text-[#8E93A4] truncate">
                          {purchase.keyTierName}
                        </p>
                        <p className="text-[10px] font-mono text-[#6A6F80] mt-0.5">
                          {purchase.orderId}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0 ml-2">
                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399] text-[10px] font-extrabold uppercase flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      )}

                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full bg-[#F5B014]/15 border border-[#F5B014]/30 text-[#F5B014] text-[10px] font-extrabold uppercase flex items-center space-x-1">
                          <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
                          <span>Pending</span>
                        </span>
                      )}

                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] text-[10px] font-extrabold uppercase flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rejection message if applicable */}
                  {isRejected && purchase.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[11px] text-[#F87171]">
                      <strong>Reason:</strong> {purchase.rejectionReason}
                    </div>
                  )}

                  {/* Bottom action row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1F212D]">
                    <div className="text-xs text-[#8E93A4]">
                      Paid: <strong className="text-white">{purchase.finalAmount} {purchase.currency}</strong>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isApproved && (
                        <button
                          id={`btn-view-key-${purchase.id}`}
                          onClick={() => setSelectedPurchaseModal(purchase)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#F5B014] hover:bg-[#FFD54F] active:scale-95 text-black font-extrabold text-xs shadow-md transition-all flex items-center space-x-1"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>View Key</span>
                        </button>
                      )}

                      {isPending && (
                        <button
                          id={`btn-check-status-${purchase.id}`}
                          onClick={() => viewPurchaseKey(purchase)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1B1D28] hover:bg-[#252838] border border-[#2D3042] text-[#F5B014] font-bold text-xs transition-all flex items-center space-x-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Check Status</span>
                        </button>
                      )}

                      {isRejected && (
                        <button
                          onClick={() => setScreen('home')}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1B1D28] hover:bg-[#252838] border border-[#2D3042] text-xs font-bold text-white transition-all"
                        >
                          Re-order
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ================= VIEW KEY MODAL ================= */}
      <AnimatePresence>
        {selectedPurchaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPurchaseModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-[#14151D] border-2 border-[#F5B014]/60 p-6 shadow-2xl space-y-4 text-white z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-[#F5B014]" />
                  <h3 className="text-sm font-bold text-white">License Key Details</h3>
                </div>
                <button
                  onClick={() => setSelectedPurchaseModal(null)}
                  className="w-7 h-7 rounded-full bg-[#1F212D] flex items-center justify-center text-[#8E93A4] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#0D0E13] border border-[#2B2E3D] text-center space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#8C91A0]">
                  {selectedPurchaseModal.appName} • {selectedPurchaseModal.keyTierName}
                </p>
                <p className="font-mono text-sm font-bold text-[#F5B014] break-all select-all">
                  {selectedPurchaseModal.licenseKey || 'AK-PRO-X7Y9-L4M2-V1Q8'}
                </p>
              </div>

              <button
                onClick={() => handleCopy(selectedPurchaseModal.licenseKey || 'AK-PRO-X7Y9-L4M2-V1Q8')}
                className="w-full h-11 bg-[#F5B014] hover:bg-[#FFD54F] active:scale-98 text-black font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>KEY COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY KEY</span>
                  </>
                )}
              </button>

              <a
                href={selectedPurchaseModal.goFileDownloadUrl || 'https://gofile.io/d/akstar-focusflow-v241'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 bg-[#1A1C27] hover:bg-[#232637] border border-[#2D3042] rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4 text-[#F5B014]" />
                <span>DOWNLOAD FROM GOFILE</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8C91A0]" />
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
