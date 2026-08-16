import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Copy, 
  Check, 
  UploadCloud, 
  Image as ImageIcon, 
  AlertCircle, 
  QrCode, 
  ShieldCheck, 
  X,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../navigation/TopHeader';

export const PaymentScreen: React.FC = () => {
  const { 
    selectedApp, 
    selectedKeyTier, 
    couponDiscount, 
    appliedCoupon, 
    paymentSettings, 
    submitPaymentOrder, 
    goBack 
  } = useApp();

  const [copiedUPI, setCopiedUPI] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedApp || !selectedKeyTier) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] p-6 text-center text-white flex flex-col items-center justify-center">
        <p>No order in progress.</p>
        <button onClick={goBack} className="mt-4 px-4 py-2 bg-[#F5B014] text-black font-bold rounded-lg">
          Return
        </button>
      </div>
    );
  }

  const rawPrice = selectedKeyTier.price;
  const finalPrice = Math.max(0, rawPrice - couponDiscount);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(paymentSettings.upiId);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (PNG, JPG, JPEG).');
        return;
      }
      setErrorMsg(null);
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please upload an image screenshot.');
        return;
      }
      setErrorMsg(null);
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    // If it's a paid key, screenshot is strictly compulsory
    if (finalPrice > 0 && !selectedFile) {
      setErrorMsg('Payment screenshot is required for administrator verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a dummy image file if free key
      let fileToSubmit = selectedFile;
      if (!fileToSubmit) {
        const dummyBlob = new Blob(['free_tier_claim'], { type: 'text/plain' });
        fileToSubmit = new File([dummyBlob], 'free_tier.png', { type: 'image/png' });
      }
      await submitPaymentOrder(fileToSubmit);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div id="payment-screen" className="min-h-screen bg-[#0A0B0E] pb-32 text-white">
      <TopHeader title="Payment" showBack={true} onBack={goBack} />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-4 space-y-5">
        {/* ================= ORDER SUMMARY CARD ================= */}
        <section className="p-4 rounded-2xl bg-[#14151D] border border-[#232533] space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#20222F]">
            <div>
              <h3 className="text-sm font-bold text-white">{selectedApp.name}</h3>
              <p className="text-xs text-[#8C91A0]">{selectedKeyTier.name}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8C91A0] uppercase block">Amount to Pay</span>
              <span className="text-base font-extrabold text-[#F5B014]">
                {finalPrice === 0 ? 'FREE' : `${finalPrice} ${selectedKeyTier.currency}`}
              </span>
            </div>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-xs text-[#10B981] pt-1">
              <span>Promo Code Applied ({appliedCoupon.code})</span>
              <span>-{couponDiscount} {selectedKeyTier.currency}</span>
            </div>
          )}
        </section>

        {/* ================= SCAN TO PAY SECTION ================= */}
        {finalPrice > 0 && (
          <section className="p-5 rounded-3xl bg-[#14151D] border border-[#232533] space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5B014] animate-ping" />
              <h3 className="text-xs font-bold text-[#8C91A0] uppercase tracking-wider">
                Scan to Pay with Any UPI App
              </h3>
            </div>

            {/* QR Code Container */}
            <div className="relative inline-block p-4 rounded-2xl bg-white border-2 border-[#F5B014]/60 shadow-[0_0_25px_rgba(245,176,20,0.2)]">
              <img
                src={paymentSettings.qrCodeUrl}
                alt="Payment UPI QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0C0D11] border border-[#F5B014] text-[9px] font-extrabold text-[#F5B014] uppercase tracking-wider whitespace-nowrap">
                {paymentSettings.beneficiaryName}
              </div>
            </div>

            {/* Copy UPI ID Box */}
            <div className="pt-2">
              <p className="text-[11px] text-[#8C91A0] mb-1.5 font-medium">Or pay directly to UPI ID:</p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1B1D27] border border-[#2C2F3F] max-w-xs mx-auto">
                <span className="text-xs font-mono text-[#F5B014] font-bold truncate mr-2">
                  {paymentSettings.upiId}
                </span>
                <button
                  id="btn-copy-upi"
                  onClick={handleCopyUPI}
                  className="px-2.5 py-1 rounded-lg bg-[#262838] hover:bg-[#F5B014] hover:text-black text-xs font-semibold flex items-center space-x-1 transition-all"
                >
                  {copiedUPI ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-[#10B981]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ================= PAYMENT SCREENSHOT UPLOAD ================= */}
        {finalPrice > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-1 h-3.5 bg-[#F5B014] rounded-full" />
                <h3 className="text-xs font-bold text-[#8C91A0] uppercase tracking-wider">
                  Upload Payment Screenshot <span className="text-[#EF4444]">*</span>
                </h3>
              </div>
              <span className="text-[10px] text-[#717684]">UTR reference visible</span>
            </div>

            <input
              ref={fileInputRef}
              id="input-payment-screenshot"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                filePreview
                  ? 'border-[#10B981] bg-[#10B981]/5'
                  : 'border-[#2D3042] hover:border-[#F5B014]/60 bg-[#14151D] hover:bg-[#181A24]'
              }`}
            >
              {filePreview ? (
                <div className="relative inline-block">
                  <img
                    src={filePreview}
                    alt="Payment receipt preview"
                    className="max-h-48 rounded-xl object-contain border border-[#10B981] mx-auto shadow-md"
                  />
                  <button
                    id="btn-remove-screenshot"
                    onClick={handleClearFile}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-xs text-[#10B981] font-semibold mt-2">
                    ✓ {selectedFile?.name || 'Screenshot attached'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#1F212D] flex items-center justify-center text-[#F5B014]">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Tap to upload receipt</p>
                    <p className="text-[10px] text-[#7E8394] mt-0.5">JPG, PNG or Screenshot from UPI app</p>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center space-x-1.5 text-xs text-[#EF4444] bg-[#EF4444]/10 p-2.5 rounded-xl border border-[#EF4444]/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </section>
        )}

        {/* Verification notice */}
        <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#232533] flex items-start space-x-2.5 text-xs text-[#8E93A4]">
          <Info className="w-4 h-4 text-[#F5B014] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Upon submitting, the order moves to <strong className="text-white">Pending Verification</strong>. The administrator will verify the transaction on the Admin APK and release your license key instantly.
          </p>
        </div>
      </main>

      {/* ================= STICKY SUBMIT BUTTON ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0D11]/95 backdrop-blur-md border-t border-[#1C1E26] p-3.5 max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl">
        <button
          id="btn-submit-verification"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="w-full h-12 bg-[#F5B014] hover:bg-[#FFD54F] active:scale-98 disabled:opacity-50 text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_18px_rgba(245,176,20,0.35)] transition-all"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Uploading & Creating Order...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>{finalPrice === 0 ? 'CLAIM FREE KEY' : 'SUBMIT FOR VERIFICATION'}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
