import React, { useState } from 'react';
import { Menu, Search, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getGmailAvatarUrl } from '../../services/firebase';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showSearch = true,
}) => {
  const { setScreen, goBack, setIsSidebarOpen } = useApp();
  const { user } = useAuth();
  const [imgErr, setImgErr] = useState(false);

  const userEmail = user?.email || 'akstarmodofficial732@gmail.com';
  const userDisplayName = user?.displayName || 'AK Star User';
  const avatarUrl = imgErr 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=F5B014&color=000000&bold=true`
    : (user?.photoURL || getGmailAvatarUrl(userEmail, userDisplayName));

  return (
    <header 
      id="top-header"
      className="sticky top-0 z-40 bg-[#0C0D11]/95 backdrop-blur-md border-b border-[#1A1C24] px-4 py-3 flex items-center justify-between transition-all"
    >
      <div className="flex items-center space-x-3">
        {showBack ? (
          <button
            id="btn-header-back"
            onClick={onBack || goBack}
            className="w-9 h-9 rounded-full bg-[#181A22] border border-[#2B2E3C] flex items-center justify-center text-[#E0E2EC] hover:text-[#F5B014] hover:border-[#F5B014]/50 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button
            id="btn-header-menu"
            onClick={() => setIsSidebarOpen(true)}
            className="w-9 h-9 rounded-full bg-[#14151C] hover:bg-[#1C1E28] flex items-center justify-center text-[#9FA4B2] hover:text-white active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {title ? (
          <h1 className="text-lg font-bold text-[#F5B014] tracking-wide font-sans">
            {title}
          </h1>
        ) : (
          <div 
            onClick={() => setScreen('home')}
            className="cursor-pointer flex items-center space-x-1.5"
          >
            <span className="text-lg font-extrabold tracking-wider text-[#F5B014] uppercase">
              AK STAR MOD
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2.5">
        {showSearch && (
          <button
            id="btn-header-search"
            onClick={() => setScreen('search')}
            className="w-9 h-9 rounded-full bg-[#14151C] hover:bg-[#1C1E28] flex items-center justify-center text-[#9FA4B2] hover:text-[#F5B014] active:scale-95 transition-all"
            aria-label="Search software"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        <button
          id="btn-header-profile"
          onClick={() => setScreen('profile')}
          className="relative p-0.5 rounded-full ring-1.5 ring-[#F5B014]/70 hover:ring-[#F5B014] transition-all overflow-hidden"
          aria-label="User Profile"
        >
          <img
            src={avatarUrl}
            alt="Profile Avatar"
            onError={() => setImgErr(true)}
            className="w-7 h-7 rounded-full object-cover bg-[#1C1E2A]"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </header>
  );
};
