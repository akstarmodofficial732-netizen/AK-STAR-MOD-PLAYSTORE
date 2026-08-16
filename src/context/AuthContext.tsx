import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { 
  getStoredUser, 
  loginWithGoogle as authLoginGoogle, 
  logoutUser as authLogout, 
  createGuestOrMockUser,
  auth,
  onAuthStateChanged 
} from '../services/firebase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<UserProfile>;
  exploreAsGuest: () => void;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial user from storage or firebase auth
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setIsLoading(false);
    } else {
      // Default to guest for smooth exploration if not logged in
      setIsLoading(false);
    }

    // Attach firebase auth listener if initialized
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'AK Star User',
            email: firebaseUser.email || 'user@akstarmod.com',
            photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            isGuest: false,
            subscriptionStatus: 'Active Member',
            lastLoginAt: new Date().toISOString(),
          };
          setUser(profile);
          localStorage.setItem('ak_star_user', JSON.stringify(profile));
        }
      });
      return () => unsubscribe();
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

  const exploreAsGuest = () => {
    const guest = createGuestOrMockUser('Guest Explorer', true);
    setUser(guest);
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    if (user) {
      const merged = { ...user, ...updated };
      setUser(merged);
      localStorage.setItem('ak_star_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, exploreAsGuest, logout, updateUser }}>
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
