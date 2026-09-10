import React, { useState } from 'react';
import { LaborProvider } from './context/LaborContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import Toast from './components/common/Toast';
import OverviewDashboard from './components/dashboard/OverviewDashboard';
import LaborerDirectory from './components/labor/LaborerDirectory';
import RegisteredSitesView from './components/sites/RegisteredSitesView';
import AttendanceModule from './components/attendance/AttendanceModule';
import CalculatedWagesView from './components/wages/CalculatedWagesView';
import AddLaborerModal from './components/labor/AddLaborerModal';
import AddSiteModal from './components/sites/AddSiteModal';
import RecordPaymentModal from './components/wages/RecordPaymentModal';
import PaymentReceiptModal from './components/wages/PaymentReceiptModal';
import HomePage from './components/home/HomePage';
import UserManagementView from './components/users/UserManagementView';
import './App.css';

const APP_TABS = ['dashboard', 'users', 'laborers', 'sites', 'attendance', 'wages'];

const getTabFromHash = () => {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  return APP_TABS.includes(hash) ? hash : null;
};

function MainApp({ activeTab: controlledTab, onTabChange, onReturnToHome }) {
  const [internalTab, setInternalTab] = useState(controlledTab || 'dashboard');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global quick modals
  const [isAddLaborerOpen, setIsAddLaborerOpen] = useState(false);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [quickPaymentLaborer, setQuickPaymentLaborer] = useState(null);
  const [receiptData, setReceiptData] = useState({ isOpen: false, payment: null, wage: null });

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementView />;
      case 'laborers':
        return (
          <LaborerDirectory
            onRecordPaymentForLaborer={(lab) => setQuickPaymentLaborer(lab)}
          />
        );
      case 'sites':
        return <RegisteredSitesView />;
      case 'attendance':
        return <AttendanceModule />;
      case 'wages':
        return <CalculatedWagesView />;
      case 'dashboard':
      default:
        return (
          <OverviewDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddLaborer={() => setIsAddLaborerOpen(true)}
            onOpenAddSite={() => setIsAddSiteOpen(true)}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onReturnToHome={onReturnToHome}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onReturnToHome={onReturnToHome}
        />

        <main style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column' }}>
          {renderActiveTab()}
        </main>
      </div>

      {/* Global Toast System */}
      <Toast />

      {/* Global Quick Add Laborer Modal */}
      <AddLaborerModal
        isOpen={isAddLaborerOpen}
        onClose={() => setIsAddLaborerOpen(false)}
      />

      {/* Global Quick Add Site Modal */}
      <AddSiteModal
        isOpen={isAddSiteOpen}
        onClose={() => setIsAddSiteOpen(false)}
      />

      {/* Global Quick Payment Modal */}
      <RecordPaymentModal
        isOpen={!!quickPaymentLaborer}
        onClose={() => setQuickPaymentLaborer(null)}
        laborer={quickPaymentLaborer}
        onSuccessPayment={(savedPayment, currentWage) => {
          setReceiptData({
            isOpen: true,
            payment: savedPayment,
            wage: currentWage
          });
        }}
      />

      {/* Global Payment Receipt Voucher Modal */}
      <PaymentReceiptModal
        isOpen={receiptData.isOpen}
        onClose={() => setReceiptData({ isOpen: false, payment: null, wage: null })}
        payment={receiptData.payment}
        laborerWage={receiptData.wage}
      />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, currentUser } = useAuth();

  // Determine initial view:
  // On the index page ('/' or empty/internal hash), always load 'home' (HomePage).
  // Only load 'app' on mount if URL hash explicitly targets an app tab AND user is authenticated.
  const [currentView, setCurrentView] = useState(() => {
    const tabFromHash = getTabFromHash();
    if (tabFromHash && isAuthenticated) {
      return 'app';
    }
    return 'home';
  });

  const [activeTab, setActiveTab] = useState(() => {
    const tabFromHash = getTabFromHash();
    if (tabFromHash) return tabFromHash;
    return currentUser?.defaultTab || 'dashboard';
  });

  // Listen for browser Back/Forward navigation or hash changes
  React.useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      if (tab && isAuthenticated) {
        setActiveTab(tab);
        setCurrentView('app');
      } else if (!tab) {
        // Hash is empty, #home, #overview, #login-portal, etc. -> show HomePage
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  // If user logs out while in MainApp, smoothly return to HomePage
  React.useEffect(() => {
    if (!isAuthenticated && currentView === 'app') {
      setCurrentView('home');
      if (window.location.hash && APP_TABS.includes(window.location.hash.replace(/^#\/?/, ''))) {
        window.location.hash = '';
      }
    }
  }, [isAuthenticated, currentView]);

  const navigateToApp = (tab) => {
    const targetTab = tab || currentUser?.defaultTab || activeTab || 'dashboard';
    setActiveTab(targetTab);
    setCurrentView('app');
    window.location.hash = `#${targetTab}`;
  };

  const navigateToHome = () => {
    setCurrentView('home');
    const tab = getTabFromHash();
    if (tab) {
      window.location.hash = '';
    }
  };

  // If on HomePage (index page)
  if (currentView === 'home') {
    return (
      <>
        <HomePage
          onEnterWorkspace={navigateToApp}
          onLoginSuccess={(user) => navigateToApp(user?.defaultTab || 'dashboard')}
        />
        <Toast />
      </>
    );
  }

  // Otherwise render workspace MainApp
  return (
    <MainApp
      key={currentUser?.id || 'main-app'}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        window.location.hash = `#${tab}`;
      }}
      onReturnToHome={navigateToHome}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <LaborProvider>
        <AppContent />
      </LaborProvider>
    </AuthProvider>
  );
}

export default App;
