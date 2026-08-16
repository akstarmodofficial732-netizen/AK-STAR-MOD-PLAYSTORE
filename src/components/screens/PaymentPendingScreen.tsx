import React from 'react';
import { motion } from 'motion/react';
import { Clock, ShieldCheck, ShoppingBag, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../navigation/TopHeader';

export const PaymentPendingScreen: React.FC = () => {
  const { activePurchase, setScreen, simulateAdminAction } = useApp();

  const handleSimulateApprove = () => {
    if (activePurchase) {
      simulateAdminAction(activePurchase.id, true);
    }
  };

  const handleSimulateReject = () => {
    if (activePurchase) {
      simulateAdminAction(activePurchase.id, false, 'Screenshot UTR number was unreadable.');
    }
  };

  return (
    <div id="payment-pending-screen" className="min-h-screen bg-[#0A0B0E] pb-24 text-white">
      <TopHeader title="Payment Status" showBack={true} onBack={() => setScreen('home')} />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-6 space-y-6 text-center">
        {/* Pulsing Gold Clock Icon matching Screenshot 9 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative inline-flex items-center justify-center mx-auto"
        >
          <div className="absolute inset-0 rounded-full bg-[#F5B014]/20 blur-xl scale-125 animate-pulse" />
          <div className="w-20 h-20 rounded-full bg-[#181923] border-2 border-[#F5B014] flex items-center justify-center shadow-[0_0_30px_rgba(245,176,20,0.3)]">
            <Clock className="w-10 h-10 text-[#F5B014] animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </motion.div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Verification in Progress
          </h2>
          <p className="text-xs text-[#8E93A4] max-w-xs mx-auto leading-relaxed">
            Your payment proof has been submitted. Our team is verifying the transaction via Admin APK.
          </p>
        </div>

        {/* Order Details Card */}
        {activePurchase && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-5 rounded-3xl bg-[#14151D] border border-[#232533] text-left space-y-3.5 shadow-md"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#20222E]">
              <span className="text-xs text-[#8E93A4]">Order Reference</span>
              <span className="text-xs font-mono font-bold text-[#F5B014]">
                {activePurchase.orderId}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-[#9DA2B3]">
              <div className="flex justify-between">
                <span>Software</span>
                <span className="font-semibold text-white">{activePurchase.appName}</span>
              </div>
              <div className="flex justify-between">
                <span>Access Tier</span>
                <span className="font-semibold text-white">{activePurchase.keyTierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid</span>
                <span className="font-bold text-[#F5B014]">
                  {activePurchase.finalAmount} {activePurchase.currency}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span>Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F5B014]/20 text-[#F5B014] text-[10px] font-extrabold uppercase flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5B014] animate-ping" />
                  <span>Pending Admin Approval</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Realtime Listener Info Banner */}
        <div className="p-3.5 rounded-2xl bg-[#171924] border border-[#262838] flex items-center space-x-3 text-left">
          <Sparkles className="w-5 h-5 text-[#F5B014] flex-shrink-0" />
          <p className="text-xs text-[#A0A5B5] leading-relaxed">
            <strong className="text-white">Realtime Sync Active:</strong> This page will automatically transition to your <strong className="text-[#F5B014]">Key Received</strong> screen the moment the Admin approves your payment!
          </p>
        </div>

        {/* Admin APK Simulation Tester Panel (Allows instant testing of approval without leaving preview) */}
        <div className="p-4 rounded-2xl bg-[#111218] border border-[#2D3040] space-y-2 text-left">
          <p className="text-[11px] font-bold text-[#8C91A0] uppercase tracking-wider flex items-center gap-1.5">
            <span>⚡ Tester Quick-Simulate (Admin APK Action)</span>
          </p>
          <div className="flex space-x-2">
            <button
              id="btn-simulate-approve"
              onClick={handleSimulateApprove}
              className="flex-1 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulate Admin Approve</span>
            </button>
            <button
              id="btn-simulate-reject"
              onClick={handleSimulateReject}
              className="py-2 px-3 rounded-xl bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] font-bold text-xs transition-all"
            >
              Simulate Reject
            </button>
          </div>
        </div>

        {/* Action Navigation Buttons */}
        <div className="space-y-2 pt-2">
          <button
            id="btn-goto-purchases"
            onClick={() => setScreen('purchases')}
            className="w-full h-11 bg-[#1A1C27] hover:bg-[#222533] border border-[#2E3142] rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-[#F5B014]" />
            <span>View All My Purchases</span>
          </button>
          <button
            onClick={() => setScreen('home')}
            className="w-full py-2 text-xs font-semibold text-[#8C91A0] hover:text-white"
          >
            Return to Marketplace
          </button>
        </div>
      </main>
    </div>
  );
};
