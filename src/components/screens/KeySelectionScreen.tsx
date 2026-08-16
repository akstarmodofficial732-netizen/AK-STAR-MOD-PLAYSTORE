import React from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Percent 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../navigation/TopHeader';
import { KeyTier } from '../../types';

export const KeySelectionScreen: React.FC = () => {
  const { 
    selectedApp, 
    selectedKeyTier, 
    setSelectedKeyTier, 
    proceedToPayment, 
    appliedCoupon, 
    couponCodeInput, 
    setCouponCodeInput, 
    couponDiscount, 
    couponError, 
    couponSuccess, 
    applyCouponCode, 
    removeCouponCode, 
    goBack 
  } = useApp();

  if (!selectedApp) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] p-6 text-center text-white flex flex-col items-center justify-center">
        <p>No software selected.</p>
        <button onClick={goBack} className="mt-4 px-4 py-2 bg-[#F5B014] text-black font-bold rounded-lg">
          Return
        </button>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applyCouponCode(couponCodeInput);
  };

  const handleSelectTier = (tier: KeyTier) => {
    setSelectedKeyTier(tier);
    // If coupon was applied, re-evaluate or keep
    if (appliedCoupon && tier.price > 0) {
      applyCouponCode(appliedCoupon.code);
    }
  };

  const currentPrice = selectedKeyTier?.price || 0;
  const finalPrice = Math.max(0, currentPrice - couponDiscount);
  const isFreeKey = selectedKeyTier?.isFree || finalPrice === 0;

  return (
    <div id="key-selection-screen" className="min-h-screen bg-[#0A0B0E] pb-32 text-white">
      <TopHeader title="Key Selection" showBack={true} onBack={goBack} />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-4 space-y-5">
        {/* Selected App Mini Header */}
        <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-[#14151D] border border-[#232533]">
          <img
            src={selectedApp.iconUrl}
            alt={selectedApp.name}
            className="w-12 h-12 rounded-xl object-cover border border-[#2B2E3F]"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{selectedApp.name}</h3>
            <p className="text-xs text-[#8C91A0]">{selectedApp.version} • {selectedApp.category}</p>
          </div>
        </div>

        {/* ================= KEY TIERS RADIO LIST ================= */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-1 h-3.5 bg-[#F5B014] rounded-full" />
            <h3 className="text-xs font-bold text-[#8C91A0] uppercase tracking-wider">
              Choose License Tier
            </h3>
          </div>

          <div className="space-y-2.5">
            {selectedApp.keyTiers.map((tier) => {
              const isSelected = selectedKeyTier?.id === tier.id;

              return (
                <motion.div
                  key={tier.id}
                  id={`tier-card-${tier.id}`}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectTier(tier)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-[#181923] border-[#F5B014] shadow-[0_0_15px_rgba(245,176,20,0.15)] ring-1 ring-[#F5B014]'
                      : 'bg-[#14151D] border-[#232533] hover:border-[#F5B014]/40 hover:bg-[#161822]'
                  }`}
                >
                  {/* Popular pill */}
                  {tier.isPopular && (
                    <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-[#F5B014] text-black text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Radio Circle */}
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#F5B014] bg-[#F5B014]'
                          : 'border-[#424758] bg-transparent'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">{tier.name}</h4>
                        <p className="text-xs text-[#8E93A4]">{tier.durationText}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {tier.originalPrice && tier.originalPrice > tier.price && (
                        <p className="text-[10px] text-[#6D7282] line-through">
                          {tier.originalPrice} {tier.currency}
                        </p>
                      )}
                      <p className="text-sm font-extrabold text-[#F5B014]">
                        {tier.isFree ? 'FREE' : `${tier.price} ${tier.currency}`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================= COUPON PROMO SECTION ================= */}
        {selectedKeyTier && !selectedKeyTier.isFree && (
          <div className="p-4 rounded-2xl bg-[#14151D] border border-[#232533] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-[#F5B014]" />
                <span className="text-xs font-bold text-white">Have a Promo Coupon?</span>
              </div>
              <span className="text-[10px] text-[#8C91A0]">e.g. AKSTAR50</span>
            </div>

            <form onSubmit={handleApplyCoupon} className="flex space-x-2">
              <input
                id="input-coupon-code"
                type="text"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                placeholder="ENTER COUPON CODE"
                className="flex-1 h-10 bg-[#1A1C26] border border-[#2C2F3E] focus:border-[#F5B014] rounded-xl px-3.5 text-xs text-white placeholder-[#6D7282] uppercase tracking-wider font-mono outline-none"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  id="btn-remove-coupon"
                  onClick={removeCouponCode}
                  className="px-3.5 h-10 rounded-xl bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] text-xs font-bold transition-all"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="submit"
                  id="btn-apply-coupon"
                  className="px-4 h-10 rounded-xl bg-[#F5B014] hover:bg-[#FFD54F] active:scale-95 text-black text-xs font-extrabold shadow-md transition-all"
                >
                  Apply
                </button>
              )}
            </form>

            {couponError && (
              <div className="flex items-center space-x-1.5 text-xs text-[#EF4444]">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{couponError}</span>
              </div>
            )}

            {couponSuccess && (
              <div className="flex items-center space-x-1.5 text-xs text-[#10B981]">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{couponSuccess}</span>
              </div>
            )}
          </div>
        )}

        {/* ================= ORDER SUMMARY BREAKDOWN ================= */}
        {selectedKeyTier && (
          <div className="p-4 rounded-2xl bg-[#14151D] border border-[#232533] space-y-2.5">
            <h4 className="text-xs font-bold text-[#8C91A0] uppercase tracking-wider">
              Price Calculation
            </h4>

            <div className="space-y-1.5 text-xs text-[#9DA2B3] pt-1">
              <div className="flex justify-between">
                <span>Tier Base Price</span>
                <span className="font-semibold text-white">
                  {selectedKeyTier.isFree ? 'FREE' : `${selectedKeyTier.price} ${selectedKeyTier.currency}`}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#10B981]">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{couponDiscount} {selectedKeyTier.currency}</span>
                </div>
              )}

              <div className="border-t border-[#232535] pt-2 flex justify-between text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="text-[#F5B014] text-base">
                  {finalPrice === 0 ? 'FREE' : `${finalPrice} ${selectedKeyTier.currency}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= STICKY BOTTOM BUTTON ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0D11]/95 backdrop-blur-md border-t border-[#1C1E26] p-3.5 max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl">
        <button
          id="btn-proceed-to-payment"
          disabled={!selectedKeyTier}
          onClick={() => {
            if (selectedKeyTier && selectedApp) {
              proceedToPayment(selectedApp, selectedKeyTier);
            }
          }}
          className="w-full h-12 bg-[#F5B014] hover:bg-[#FFD54F] active:scale-98 disabled:opacity-50 text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_18px_rgba(245,176,20,0.35)] transition-all"
        >
          <span>{isFreeKey ? 'CONTINUE TO INSTANT ACCESS' : 'CONTINUE TO PAYMENT'}</span>
          <ArrowRight className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
};
