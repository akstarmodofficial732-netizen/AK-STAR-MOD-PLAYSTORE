import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/screens/SplashScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { CategoriesScreen } from './components/screens/CategoriesScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { AppDetailsScreen } from './components/screens/AppDetailsScreen';
import { KeySelectionScreen } from './components/screens/KeySelectionScreen';
import { PaymentScreen } from './components/screens/PaymentScreen';
import { PaymentPendingScreen } from './components/screens/PaymentPendingScreen';
import { KeyReceivedScreen } from './components/screens/KeyReceivedScreen';
import { MyPurchasesScreen } from './components/screens/MyPurchasesScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { AdminScreen } from './components/screens/AdminScreen';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { SidebarDrawer } from './components/navigation/SidebarDrawer';
import { SupportModal } from './components/modals/SupportModal';

const AppContent: React.FC = () => {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return <LoginScreen />;
      case 'home':
        return <HomeScreen />;
      case 'categories':
      case 'category-detail':
        return <CategoriesScreen />;
      case 'search':
        return <SearchScreen />;
      case 'app-details':
        return <AppDetailsScreen />;
      case 'key-selection':
        return <KeySelectionScreen />;
      case 'payment':
        return <PaymentScreen />;
      case 'payment-pending':
        return <PaymentPendingScreen />;
      case 'key-received':
        return <KeyReceivedScreen />;
      case 'purchases':
        return <MyPurchasesScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'admin':
        return <AdminScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Show bottom navigation on primary browse screens
  const showBottomNav = [
    'home',
    'categories',
    'category-detail',
    'search',
    'purchases',
    'profile',
    'admin',
  ].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col font-sans selection:bg-[#F5B014] selection:text-black">
      <div className="flex-1 w-full">
        {renderScreen()}
      </div>

      {showBottomNav && <BottomNavigation />}
      <SidebarDrawer />
      <SupportModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
