import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Mic, Star, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../navigation/TopHeader';

export const SearchScreen: React.FC = () => {
  const {
    apps,
    dynamicCategories,
    openAppDetails,
    searchQuery,
    setSearchQuery,
    searchCategoryFilter,
    setSearchCategoryFilter,
    searchPriceFilter,
    setSearchPriceFilter,
    searchRatingFilter,
    setSearchRatingFilter,
  } = useApp();

  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const handleVoiceSearch = () => {
    setIsVoiceListening(true);
    setTimeout(() => {
      setIsVoiceListening(false);
    }, 1500);
  };

  // Filter computation strictly on real published apps
  const filteredApps = apps.filter((app) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      q === '' ||
      (app.name && app.name.toLowerCase().includes(q)) ||
      (app.tagline && app.tagline.toLowerCase().includes(q)) ||
      (app.description && app.description.toLowerCase().includes(q)) ||
      (app.category && app.category.toLowerCase().includes(q));

    const matchesCategory =
      searchCategoryFilter === 'All' ||
      (app.category && app.category.toLowerCase() === searchCategoryFilter.toLowerCase());

    const isFree = !app.keyTiers || app.keyTiers.some((k) => k.isFree || k.price === 0);
    const matchesPrice =
      searchPriceFilter === 'all' ||
      (searchPriceFilter === 'free' && isFree) ||
      (searchPriceFilter === 'premium' && !isFree);

    const matchesRating =
      searchRatingFilter === 0 || (app.rating || 5) >= searchRatingFilter;

    return matchesQuery && matchesCategory && matchesPrice && matchesRating;
  });

  return (
    <div id="search-screen" className="min-h-screen bg-[#0A0B0E] pb-24 text-white">
      <TopHeader showSearch={false} />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-3 space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#8C91A0]" />
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search published apps..."
            className="w-full h-11 bg-[#14151D] border border-[#262838] focus:border-[#F5B014] focus:ring-1 focus:ring-[#F5B014] rounded-xl pl-10 pr-10 text-sm text-white placeholder-[#717684] outline-none transition-all"
          />
          <button
            id="btn-voice-search"
            onClick={handleVoiceSearch}
            className={`absolute right-3 p-1 rounded-md text-[#8C91A0] hover:text-[#F5B014] ${
              isVoiceListening ? 'text-[#F5B014] animate-pulse' : ''
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Group */}
        <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#232533] space-y-3.5">
          {/* Dynamic Category Filter */}
          <div>
            <label className="text-[10px] font-bold text-[#8C91A0] uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <select
              id="select-category-filter"
              value={searchCategoryFilter}
              onChange={(e) => setSearchCategoryFilter(e.target.value)}
              className="w-full h-9 bg-[#1B1D27] border border-[#2B2E3D] rounded-lg px-3 text-xs text-[#E0E2EC] outline-none focus:border-[#F5B014]"
            >
              <option value="All">All Categories ({apps.length})</option>
              {dynamicCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div>
            <label className="text-[10px] font-bold text-[#8C91A0] uppercase tracking-wider block mb-1.5">
              Price
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['all', 'free', 'premium'] as const).map((p) => {
                const isSelected = searchPriceFilter === p;
                return (
                  <button
                    key={p}
                    onClick={() => setSearchPriceFilter(p)}
                    className={`h-8 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      isSelected
                        ? 'bg-[#F5B014] text-black font-bold shadow-[0_0_8px_rgba(245,176,20,0.3)]'
                        : 'bg-[#1A1C26] text-[#8C91A0] hover:text-white border border-[#262837]'
                    }`}
                  >
                    {p === 'all' ? 'All' : p === 'free' ? 'Free' : 'Premium'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="text-[10px] font-bold text-[#8C91A0] uppercase tracking-wider block mb-1.5">
              Rating
            </label>
            <div className="flex items-center space-x-2">
              {[
                { label: 'Any', value: 0 },
                { label: '4.0+', value: 4.0 },
                { label: '4.5+', value: 4.5 },
                { label: '4.8+', value: 4.8 },
              ].map((r) => {
                const isSelected = searchRatingFilter === r.value;
                return (
                  <button
                    key={r.label}
                    onClick={() => setSearchRatingFilter(r.value)}
                    className={`flex-1 h-8 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
                      isSelected
                        ? 'bg-[#F5B014] text-black font-bold'
                        : 'bg-[#1A1C26] text-[#8C91A0] hover:text-white border border-[#262837]'
                    }`}
                  >
                    {r.value > 0 && <Star className="w-3 h-3 fill-current" />}
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-[#8C91A0]">
            Found {filteredApps.length} results
          </span>
          {(searchQuery || searchCategoryFilter !== 'All' || searchPriceFilter !== 'all' || searchRatingFilter !== 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchCategoryFilter('All');
                setSearchPriceFilter('all');
                setSearchRatingFilter(0);
              }}
              className="text-xs text-[#F5B014] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="space-y-2.5">
          {filteredApps.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-[#14151D] border border-[#232533] space-y-2">
              <Search className="w-8 h-8 text-[#555A6B] mx-auto" />
              <p className="text-sm font-bold text-white uppercase tracking-tight">No apps found</p>
              <p className="text-xs text-[#7A7F90]">
                {apps.length === 0 
                  ? 'No published applications are available in the system yet.' 
                  : 'Try adjusting your search terms or filters.'}
              </p>
            </div>
          ) : (
            filteredApps.map((app) => (
              <motion.div
                key={app.id}
                id={`search-app-${app.id}`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => openAppDetails(app)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14151D] border border-[#232533] hover:border-[#F5B014]/40 cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={app.iconUrl}
                    alt={app.name}
                    className="w-13 h-13 rounded-xl object-cover border border-[#2A2D3D] shadow-sm flex-shrink-0 bg-[#1A1C28]"
                    referrerPolicy="no-referrer"
                  />

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#F5B014] truncate transition-colors">
                      {app.name}
                    </h4>

                    <div className="flex items-center space-x-2 text-xs text-[#8E93A4] mt-0.5">
                      <span className="font-mono">v{app.version}</span>
                      <span>•</span>
                      <span>{app.size}</span>
                      {app.category && (
                        <>
                          <span>•</span>
                          <span>{app.category}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F5B014]">
                        {app.badgeText || (app.keyTiers && app.keyTiers.some((k) => k.isFree) ? 'FREE APK' : 'MOD')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#181A24] border border-[#2A2D3C] group-hover:border-[#F5B014] group-hover:bg-[#F5B014] flex items-center justify-center text-[#9FA4B2] group-hover:text-black flex-shrink-0 ml-2 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
