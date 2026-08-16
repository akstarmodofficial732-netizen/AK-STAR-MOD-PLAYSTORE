import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Star, 
  Download, 
  HardDrive, 
  CheckCircle2, 
  KeyRound, 
  ExternalLink,
  ChevronRight,
  Shield,
  FileCode,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../navigation/TopHeader';

export const AppDetailsScreen: React.FC = () => {
  const { selectedApp, openKeySelection, goBack } = useApp();
  const [selectedScreenshotIdx, setSelectedScreenshotIdx] = useState<number | null>(null);

  if (!selectedApp) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] p-6 text-center text-white flex flex-col items-center justify-center">
        <p className="text-sm text-[#8C91A0]">No software selected.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-[#F5B014] text-black font-bold rounded-lg text-xs"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const apkDownloadLink = selectedApp.apkUrl || selectedApp.downloadUrl || selectedApp.goFileUrl || '';
  const hasKeyTiers = selectedApp.keyTiers && selectedApp.keyTiers.length > 0;
  const isDirectFree = !hasKeyTiers || selectedApp.keyTiers?.every((k) => k.isFree || k.price === 0);

  const handleDirectDownload = () => {
    if (!apkDownloadLink) {
      alert('APK download link is not configured for this application yet.');
      return;
    }
    window.open(apkDownloadLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="app-details-screen" className="min-h-screen bg-[#0A0B0E] pb-32 text-white">
      <TopHeader title="Details" showBack={true} onBack={goBack} />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-4 space-y-6">
        {/* ================= APP SUMMARY HEADER ================= */}
        <section className="flex items-start space-x-4 bg-[#14151D] border border-[#242635] rounded-3xl p-5 shadow-lg">
          <img
            src={selectedApp.iconUrl}
            alt={selectedApp.name}
            className="w-20 h-20 rounded-2xl object-cover border border-[#2D3042] shadow-md flex-shrink-0 bg-[#1A1C28]"
            referrerPolicy="no-referrer"
          />

          <div className="flex-1 min-w-0">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F5B014]/20 text-[#F5B014] text-[10px] font-extrabold tracking-wider uppercase mb-1">
              {selectedApp.badgeText || (selectedApp.published ? 'PUBLISHED' : 'DRAFT')}
            </span>

            <h2 className="text-lg font-bold text-white tracking-tight truncate">
              {selectedApp.name}
            </h2>
            <p className="text-xs text-[#8E93A4] font-medium truncate">
              {selectedApp.developer}
            </p>

            {/* Metadata Pills */}
            <div className="flex items-center space-x-3 mt-3 text-xs text-[#8E93A4]">
              {selectedApp.rating !== undefined && (
                <>
                  <div className="flex items-center space-x-1 text-[#F5B014] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{selectedApp.rating}</span>
                  </div>
                  <span>•</span>
                </>
              )}
              <div className="flex items-center space-x-1">
                <HardDrive className="w-3.5 h-3.5 text-[#8E93A4]" />
                <span>{selectedApp.size}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <FileCode className="w-3.5 h-3.5 text-[#8E93A4]" />
                <span>v{selectedApp.version}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SCREENSHOTS (If available in Firebase) ================= */}
        {selectedApp.screenshots && selectedApp.screenshots.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-[#8C91A0] uppercase tracking-wider px-1">
              Interface Preview ({selectedApp.screenshots.length})
            </h3>

            <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
              {selectedApp.screenshots.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedScreenshotIdx(idx)}
                  className="w-56 sm:w-64 h-32 sm:h-36 rounded-2xl overflow-hidden border border-[#232535] flex-shrink-0 cursor-pointer hover:border-[#F5B014]/60 transition-all shadow-md group relative bg-[#171922]"
                >
                  <img
                    src={img}
                    alt={`${selectedApp.name} screenshot ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                    <span className="text-[10px] font-semibold text-white">Tap to expand</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= ABOUT THIS APP ================= */}
        {selectedApp.description && (
          <section className="bg-[#14151D] border border-[#232533] rounded-2xl p-4.5 space-y-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-1 h-3.5 bg-[#F5B014] rounded-full" />
              <h3 className="text-sm font-bold text-white">About this app</h3>
            </div>
            <p className="text-xs text-[#AEB3C2] leading-relaxed whitespace-pre-line">
              {selectedApp.description}
            </p>
          </section>
        )}

        {/* ================= CORE FEATURES (If provided in Firebase) ================= */}
        {selectedApp.features && selectedApp.features.length > 0 && (
          <section className="bg-[#14151D] border border-[#232533] rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-1 h-3.5 bg-[#F5B014] rounded-full" />
              <h3 className="text-sm font-bold text-white">Features</h3>
            </div>

            <ul className="space-y-2.5">
              {selectedApp.features.map((feature, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-[#CED2DF]">
                  <CheckCircle2 className="w-4 h-4 text-[#F5B014] flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ================= CHANGELOG / WHAT'S NEW ================= */}
        {(selectedApp.changelog || (selectedApp.whatsNew && selectedApp.whatsNew.length > 0)) && (
          <section className="bg-[#14151D] border border-[#232533] rounded-2xl p-4.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-1 h-3.5 bg-[#F5B014] rounded-full" />
                <h3 className="text-sm font-bold text-white">Changelog</h3>
              </div>
              <span className="text-[11px] font-mono text-[#8C91A0]">
                v{selectedApp.version}
              </span>
            </div>

            {selectedApp.changelog ? (
              <p className="text-xs text-[#9DA2B3] whitespace-pre-line leading-relaxed">
                {selectedApp.changelog}
              </p>
            ) : (
              <ul className="space-y-1.5 pl-1">
                {selectedApp.whatsNew?.map((item, idx) => (
                  <li key={idx} className="text-xs text-[#9DA2B3] flex items-start space-x-2">
                    <span className="text-[#F5B014] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* ================= FILE & SECURITY SPECIFICATIONS ================= */}
        <section className="bg-[#14151D] border border-[#232533] rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-[#232533]">
            <span className="text-[#8C91A0]">Package Category</span>
            <span className="font-semibold text-white">{selectedApp.category}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-[#232533]">
            <span className="text-[#8C91A0]">File Size</span>
            <span className="font-semibold text-white">{selectedApp.size}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-[#232533]">
            <span className="text-[#8C91A0]">Developer</span>
            <span className="font-semibold text-white">{selectedApp.developer}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-[#8C91A0]">Publication Status</span>
            <span className="font-semibold text-[#10B981] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Verified Published APK
            </span>
          </div>
        </section>
      </main>

      {/* ================= STICKY BOTTOM ACTION BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0D11]/95 backdrop-blur-md border-t border-[#1C1E26] p-3.5 max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-[#8C91A0] uppercase font-bold tracking-wider">Download & Access</p>
          <p className="text-xs font-semibold text-[#F5B014] truncate">
            {isDirectFree ? 'Free Direct Download' : 'License Key / Access Required'}
          </p>
        </div>

        {isDirectFree && apkDownloadLink ? (
          <button
            id="btn-direct-download-apk"
            onClick={handleDirectDownload}
            className="flex-1 max-w-xs h-12 bg-[#F5B014] hover:bg-[#FFD54F] active:scale-98 text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(245,176,20,0.35)] transition-all"
          >
            <Download className="w-4 h-4 text-black" />
            <span>DOWNLOAD APK</span>
          </button>
        ) : hasKeyTiers ? (
          <button
            id="btn-select-key-tier"
            onClick={() => openKeySelection(selectedApp)}
            className="flex-1 max-w-xs h-12 bg-[#F5B014] hover:bg-[#FFD54F] active:scale-98 text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(245,176,20,0.35)] transition-all"
          >
            <KeyRound className="w-4 h-4 text-black" />
            <span>GET KEY / DOWNLOAD</span>
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
        ) : (
          <button
            id="btn-no-apk-link"
            disabled
            className="flex-1 max-w-xs h-12 bg-[#262835] text-[#717684] font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-not-allowed"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>APK LINK PENDING</span>
          </button>
        )}
      </div>

      {/* Fullscreen Screenshot Modal */}
      {selectedScreenshotIdx !== null && selectedApp.screenshots && (
        <div 
          onClick={() => setSelectedScreenshotIdx(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        >
          <img
            src={selectedApp.screenshots[selectedScreenshotIdx]}
            alt="Screenshot enlarged"
            className="max-w-full max-h-[85vh] rounded-xl object-contain border border-[#F5B014]/40"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
};
