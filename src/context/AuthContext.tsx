import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { 
  getStoredUser, 
  loginWithGoogle as authLoginGoogle, 
  loginWithCustomEmail as authLoginCustomEmail,
  logoutUser as authLogout, 
  createGuestOrMockUser,
  getGmailAvatarUrl,
  checkIsAdmin,
  auth,
  onAuthStateChanged 
} from '../services/firebase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<UserProfile>;
  loginWithEmail: (email: string, displayName?: string) => Promise<UserProfile>;
  exploreAsGuest: () => void;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Attach real Firebase Auth listener
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const userEmail = (firebaseUser.email || '').trim().toLowerCase();
          const userDisplayName = firebaseUser.displayName || (userEmail ? userEmail.split('@')[0] : 'Google User');
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: userDisplayName,
            email: userEmail,
            photoURL: firebaseUser.photoURL || getGmailAvatarUrl(userEmail, userDisplayName, firebaseUser.photoURL),
            isGuest: false,
            isAdmin: checkIsAdmin(userEmail),
            subscriptionStatus: 'Active Member',
            lastLoginAt: new Date().toISOString(),
          };
          setUser(profile);
          localStorage.setItem('ak_star_user', JSON.stringify(profile));
          setIsLoading(false);
        } else {
          // Firebase reports signed out
          const stored = getStoredUser();
          if (stored && stored.isGuest) {
            setUser(stored);
          } else {
            setUser(null);
            localStorage.removeItem('ak_star_user');
          }
          setIsLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      const stored = getStoredUser();
      setUser(stored);
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async (): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const profile = await authLoginGoogle();
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, displayName?: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const profile = authLoginCustomEmail(email, displayName);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const exploreAsGuest = () => {
    const guest = createGuestOrMockUser('Guest Explorer', true, 'guest@akstarmod.com');
    setUser(guest);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authLogout();
      setUser(null);
      localStorage.removeItem('ak_star_user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    if (user) {
      const merged = { ...user, ...updated };
      setUser(merged);
      localStorage.setItem('ak_star_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, loginWithEmail, exploreAsGuest, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

