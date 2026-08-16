import React from 'react';
import { Home, LayoutGrid, Search, ShoppingBag, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenType } from '../../types';

export const BottomNavigation: React.FC = () => {
  const { currentScreen, setScreen, purchases } = useApp();

  // Highlight active tab
  const getActiveTab = (): 'home' | 'categories' | 'search' | 'purchases' | 'profile' => {
    if (currentScreen === 'home') return 'home';
    if (currentScreen === 'categories' || currentScreen === 'category-detail') return 'categories';
    if (currentScreen === 'search') return 'search';
    if (currentScreen === 'purchases' || currentScreen === 'payment-pending' || currentScreen === 'key-received') return 'purchases';
    if (currentScreen === 'profile') return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();
  const hasPending = purchases.some((p) => p.status === 'pending');

  const tabs: { id: 'home' | 'categories' | 'search' | 'purchases' | 'profile'; target: ScreenType; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    {
      id: 'home',
      target: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'categories',
      target: 'categories',
      label: 'Categories',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: 'search',
      target: 'search',
      label: 'Search',
      icon: <Search className="w-5 h-5" />,
    },
    {
      id: 'purchases',
      target: 'purchases',
      label: 'Purchases',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: hasPending,
    },
    {
      id: 'profile',
      target: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      id="bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0D11]/95 backdrop-blur-md border-t border-[#1C1E26] px-2 py-1 max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setScreen(tab.target)}
              className={`relative flex-1 py-1.5 flex flex-col items-center justify-center transition-all duration-200 ${
                isActive ? 'text-[#F5B014]' : 'text-[#828795] hover:text-[#B0B4C2]'
              }`}
            >
              {/* Active Top Gold Bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-[#F5B014] rounded-full shadow-[0_0_8px_#F5B014]" />
              )}

              {/* Icon & Badge */}
              <div className="relative">
                {tab.icon}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-[#F5B014] rounded-full ring-2 ring-[#0C0D11] animate-pulse" />
                )}
              </div>

              {/* Label */}
              <span className={`text-[11px] font-medium tracking-tight mt-1 ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
