import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FolderOpen, ArrowLeft, PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../navigation/TopHeader';
import { AppItem } from '../../types';

export const CategoriesScreen: React.FC = () => {
  const { 
    apps, 
    dynamicCategories,
    selectedCategory, 
    setSelectedCategory, 
    openAppDetails, 
    goBack,
    setScreen
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [filterSort, setFilterSort] = useState<'newest' | 'top-rated' | 'price-low' | 'free'>('top-rated');

  useEffect(() => {
    if (selectedCategory) {
      setActiveTab(selectedCategory);
    } else if (dynamicCategories.length > 0) {
      setActiveTab('All');
    }
  }, [selectedCategory, dynamicCategories]);

  // Filter real published apps by category and sort
  const filteredApps = apps.filter((a) => {
    if (!activeTab || activeTab === 'All') return true;
    return a.category?.toLowerCase() === activeTab.toLowerCase();
  }).sort((a, b) => {
    if (filterSort === 'top-rated') {
      const rateA = a.rating || 5;
      const rateB = b.rating || 5;
      return rateB - rateA;
    }
    if (filterSort === 'free') {
      const aIsFree = a.keyTiers ? a.keyTiers.some((k) => k.isFree || k.price === 0) : true;
      const bIsFree = b.keyTiers ? b.keyTiers.some((k) => k.isFree || k.price === 0) : true;
      return (bIsFree ? 1 : 0) - (aIsFree ? 1 : 0);
    }
    return 0; // newest
  });

  return (
    <div id="categories-screen" className="min-h-screen bg-[#0A0B0E] pb-24 text-white">
      <TopHeader 
        title={activeTab === 'All' ? 'Categories' : activeTab} 
        showBack={true} 
        onBack={goBack} 
      />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-3 space-y-4">
        {dynamicCategories.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#14151D] border border-[#232533] text-center space-y-4 shadow-lg my-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1D1F2B] border border-[#2C2F40] flex items-center justify-center mx-auto text-[#F5B014]">
              <FolderOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                NO CATEGORIES AVAILABLE
              </h3>
              <p className="text-xs text-[#8C91A0] max-w-xs mx-auto">
                Categories will automatically appear once the administrator publishes applications.
              </p>
            </div>
            <button
              onClick={() => setScreen('admin')}
              className="px-5 py-2.5 rounded-xl bg-[#F5B014] text-black font-extrabold text-xs shadow-md inline-flex items-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Admin: Publish App</span>
            </button>
          </div>
        ) : (
          <>
            {/* Category Carousel Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab('All');
                  setSelectedCategory(null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'All'
                    ? 'bg-[#F5B014] text-black shadow-[0_0_12px_rgba(245,176,20,0.4)]'
                    : 'bg-[#161822] text-[#9EA3B2] hover:text-white border border-[#262838]'
                }`}
              >
                All ({apps.length})
              </button>

              {dynamicCategories.map((cat) => {
                const isSelected = activeTab.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveTab(cat.name);
                      setSelectedCategory(cat.name);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[#F5B014] text-black shadow-[0_0_12px_rgba(245,176,20,0.4)]'
                        : 'bg-[#161822] text-[#9EA3B2] hover:text-white border border-[#262838]'
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                );
              })}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setFilterSort('newest')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filterSort === 'newest'
                    ? 'bg-[#F5B014] text-black'
                    : 'bg-[#181922] text-[#8C91A0] hover:text-white border border-[#272938]'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setFilterSort('top-rated')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filterSort === 'top-rated'
                    ? 'bg-[#F5B014] text-black shadow-[0_0_10px_rgba(245,176,20,0.3)]'
                    : 'bg-[#181922] text-[#8C91A0] hover:text-white border border-[#272938]'
                }`}
              >
                Top Rated
              </button>
              <button
                onClick={() => setFilterSort('free')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filterSort === 'free'
                    ? 'bg-[#F5B014] text-black'
                    : 'bg-[#181922] text-[#8C91A0] hover:text-white border border-[#272938]'
                }`}
              >
                Free APKs
              </button>
            </div>

            {/* Real Published Apps List */}
            <div className="space-y-3 pt-2">
              {filteredApps.length === 0 ? (
                <div className="text-center py-16 px-4 bg-[#14151D] rounded-2xl border border-[#232533]">
                  <p className="text-sm text-[#9FA4B2]">No applications found in this category.</p>
                </div>
              ) : (
                filteredApps.map((app) => {
                  const isFree = !app.keyTiers || app.keyTiers.some((k) => k.isFree || k.price === 0);
                  const badgeLabel = app.badgeText || (isFree ? 'Free APK' : 'Mod Key');

                  return (
                    <motion.div
                      key={app.id}
                      id={`cat-app-${app.id}`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => openAppDetails(app)}
                      className="flex items-center justify-between p-4 rounded-2xl bg-[#14151D] border border-[#232533] hover:border-[#F5B014]/40 cursor-pointer transition-all shadow-sm group"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <img
                          src={app.iconUrl}
                          alt={app.name}
                          className="w-14 h-14 rounded-xl object-cover border border-[#2A2D3D] shadow-sm flex-shrink-0 bg-[#191B27]"
                          referrerPolicy="no-referrer"
                        />

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#F5B014] transition-colors truncate">
                            {app.name}
                          </h4>
                          <p className="text-xs text-[#8E93A4] truncate max-w-[170px] sm:max-w-xs">
                            {app.tagline || app.description}
                          </p>

                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-[11px] font-mono text-[#8C91A2]">
                              v{app.version}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              badgeLabel.toLowerCase().includes('free')
                                ? 'bg-[#10B981]/20 text-[#34D399]'
                                : 'bg-[#F5B014]/20 text-[#F5B014]'
                            }`}>
                              {badgeLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        id={`btn-view-${app.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openAppDetails(app);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-[#F5B014] hover:bg-[#FFD54F] active:scale-95 text-black font-extrabold text-xs shadow-md flex-shrink-0 ml-2 transition-all"
                      >
                        View
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
