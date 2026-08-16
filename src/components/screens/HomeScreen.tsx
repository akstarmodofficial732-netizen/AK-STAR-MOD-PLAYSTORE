import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Clapperboard, 
  Camera, 
  FileText, 
  Music, 
  Wrench, 
  Shield, 
  GraduationCap, 
  Share2,
  Sparkles,
  Download,
  Layers,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../navigation/TopHeader';
import { AppItem } from '../../types';

export const HomeScreen: React.FC = () => {
  const { 
    apps, 
    isLoadingApps, 
    appsError, 
    dynamicCategories, 
    openAppDetails, 
    setScreen, 
    setSelectedCategory 
  } = useApp();

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'video editing':
        return <Clapperboard className="w-5 h-5 text-[#F5B014]" />;
      case 'photo editing':
        return <Camera className="w-5 h-5 text-[#F5B014]" />;
      case 'productivity':
        return <FileText className="w-5 h-5 text-[#F5B014]" />;
      case 'music & audio':
      case 'audio':
        return <Music className="w-5 h-5 text-[#F5B014]" />;
      case 'tools':
        return <Wrench className="w-5 h-5 text-[#F5B014]" />;
      case 'utility':
      case 'security':
        return <Shield className="w-5 h-5 text-[#F5B014]" />;
      case 'education':
        return <GraduationCap className="w-5 h-5 text-[#F5B014]" />;
      case 'social':
        return <Share2 className="w-5 h-5 text-[#F5B014]" />;
      default:
        return <Layers className="w-5 h-5 text-[#F5B014]" />;
    }
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setScreen('category-detail');
  };

  // Extract featured and latest from real published applications only
  const featuredApps = apps.filter((a) => a.isEditorChoice || a.featured).slice(0, 2);
  const heroApps = featuredApps.length > 0 ? featuredApps : apps.slice(0, 2);
  const latestApps = apps.slice(heroApps.length);

  return (
    <div id="home-screen" className="min-h-screen bg-[#0A0B0E] pb-24 text-white">
      <TopHeader />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-4 space-y-6">
        {/* ================= LOADING STATE ================= */}
        {isLoadingApps && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-12 h-12 border-3 border-[#F5B014] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-white tracking-wide">Loading apps...</p>
            <p className="text-xs text-[#8C91A0]">Connecting to Firebase Firestore realtime channel</p>
          </div>
        )}

        {/* ================= ERROR STATE ================= */}
        {!isLoadingApps && appsError && (
          <div className="p-6 rounded-3xl bg-[#14151D] border border-[#EF4444]/40 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto" />
            <h3 className="text-sm font-bold text-white">Unable to load apps. Please try again.</h3>
            <p className="text-xs text-[#8C91A0]">{appsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 rounded-xl bg-[#F5B014] text-black font-extrabold text-xs inline-flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* ================= CLEAN EMPTY STATE (ZERO PUBLISHED APPS) ================= */}
        {!isLoadingApps && !appsError && apps.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 sm:p-12 rounded-3xl bg-[#14151D] border border-[#232533] text-center space-y-5 shadow-xl my-6"
          >
            <div className="w-18 h-18 rounded-3xl bg-[#1D1F2B] border border-[#2C2F40] flex items-center justify-center mx-auto text-[#F5B014]">
              <FolderOpen className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight uppercase">
                NO APPS AVAILABLE
              </h2>
              <p className="text-xs sm:text-sm text-[#8E93A4] max-w-sm mx-auto leading-relaxed">
                Apps will appear here when the administrator publishes them.
              </p>
            </div>

            <div className="pt-2">
              <button
                id="btn-goto-admin-publish"
                onClick={() => setScreen('admin')}
                className="px-6 py-3 rounded-2xl bg-[#F5B014] hover:bg-[#FFD54F] active:scale-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(245,176,20,0.3)] transition-all inline-flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>ADMIN PANEL: PUBLISH APK</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= REAL PUBLISHED APPS CONTENT ================= */}
        {!isLoadingApps && !appsError && apps.length > 0 && (
          <>
            {/* HERO / FEATURED CARDS */}
            {heroApps.length > 0 && (
              <section id="featured-hero-section" className="space-y-4">
                {heroApps.map((app, idx) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    onClick={() => openAppDetails(app)}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#171822] to-[#12131A] border border-[#262838] hover:border-[#F5B014]/60 p-5 cursor-pointer shadow-lg group transition-all duration-300"
                  >
                    {app.bannerUrl && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-35 transition-opacity duration-300 pointer-events-none"
                        style={{ backgroundImage: `url(${app.bannerUrl})` }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0C0D12] via-[#0C0D12]/80 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col justify-between h-36">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase mb-2 bg-[#F5B014]/20 text-[#F5B014] border border-[#F5B014]/30">
                          {app.badgeText || "FEATURED APK"}
                        </span>
                        <h2 className="text-xl font-bold text-white group-hover:text-[#F5B014] transition-colors truncate">
                          {app.name}
                        </h2>
                        <p className="text-xs text-[#9FA4B2] font-mono mt-1">
                          v{app.version} • {app.size}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-xs text-[#A1A5B5] max-w-[200px] sm:max-w-xs truncate">
                          {app.tagline || app.description}
                        </p>
                        
                        <div className="w-8 h-8 rounded-full bg-[#F5B014] flex items-center justify-center text-black font-bold shadow-md group-hover:scale-110 transition-transform">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </section>
            )}

            {/* DYNAMIC CATEGORIES (Only categories with real published apps) */}
            {dynamicCategories.length > 0 && (
              <section id="top-categories-section" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-1 h-4 bg-[#F5B014] rounded-full" />
                    <h3 className="text-xs font-bold text-[#8C91A0] tracking-wider uppercase">
                      Categories ({dynamicCategories.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setScreen('categories')}
                    className="text-xs font-semibold text-[#F5B014] hover:underline flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {dynamicCategories.map((cat) => (
                    <button
                      key={cat.id}
                      id={`btn-cat-${cat.id}`}
                      onClick={() => handleCategorySelect(cat.name)}
                      className="p-3.5 rounded-2xl bg-[#14151D] hover:bg-[#1C1E2A] border border-[#232533] hover:border-[#F5B014]/50 flex flex-col items-center justify-center text-center space-y-2 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#1B1D27] flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getCategoryIcon(cat.name)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-[#F5B014] transition-colors truncate max-w-[120px]">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-[#6C7180] font-mono">
                          {cat.count} {cat.count === 1 ? 'App' : 'Apps'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* LATEST RELEASES */}
            <section id="latest-releases-section" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-1 h-4 bg-[#F5B014] rounded-full" />
                  <h3 className="text-xs font-bold text-[#8C91A0] tracking-wider uppercase">
                    Published Applications ({apps.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    id={`app-card-${app.id}`}
                    onClick={() => openAppDetails(app)}
                    className="p-3.5 rounded-2xl bg-[#14151D] hover:bg-[#181A25] border border-[#232533] hover:border-[#F5B014]/40 flex items-center justify-between cursor-pointer transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={app.iconUrl}
                        alt={app.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#282B3B] flex-shrink-0 bg-[#1A1C28]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-xs">
                            {app.name}
                          </h4>
                          {app.badgeText && (
                            <span className="px-1.5 py-0.2 rounded bg-[#F5B014]/15 text-[#F5B014] text-[9px] font-extrabold uppercase border border-[#F5B014]/30">
                              {app.badgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8C91A0] truncate">
                          {app.developer} • {app.category}
                        </p>
                        <p className="text-[10px] text-[#6A6F80] font-mono mt-0.5">
                          v{app.version} • {app.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                      <button
                        className="w-9 h-9 rounded-xl bg-[#1F212D] hover:bg-[#F5B014] text-[#F5B014] hover:text-black flex items-center justify-center transition-all shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAppDetails(app);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};
