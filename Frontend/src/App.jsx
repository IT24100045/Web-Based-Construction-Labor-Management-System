import React, { useState, useEffect } from 'react';
import { LaborProvider } from './context/LaborContext';
import { AuthProvider, useAuth, getRoleMeta } from './context/AuthContext';
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

function MainApp({ activeTab: controlledTab, onTabChange }) {
  const { currentUser } = useAuth();
  const roleMeta = getRoleMeta(currentUser?.role);
  const allowedTabs = currentUser?.allowedTabs || roleMeta?.allowedTabs;

  // Derive effective activeTab during render without synchronous setState in effects
  const isAllowed = !allowedTabs || !Array.isArray(allowedTabs) || allowedTabs.includes(controlledTab);
  const activeTab = isAllowed
    ? (controlledTab || 'dashboard')
    : (currentUser?.defaultTab || roleMeta?.defaultTab || allowedTabs[0] || 'laborers');

  const setActiveTab = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
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
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
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
    const roleMeta = getRoleMeta(currentUser?.role);
    const allowed = currentUser?.allowedTabs || roleMeta?.allowedTabs;
    if (tabFromHash && allowed && !allowed.includes(tabFromHash)) {
      return currentUser?.defaultTab || roleMeta?.defaultTab || allowed[0];
    }
    if (tabFromHash) return tabFromHash;
    return currentUser?.defaultTab || roleMeta?.defaultTab || 'dashboard';
  });

  // Listen for browser Back/Forward navigation or hash changes
  useEffect(() => {
    const handleHashChange = () => {
      let tab = getTabFromHash();
      if (tab && isAuthenticated) {
        const roleMeta = getRoleMeta(currentUser?.role);
        const allowed = currentUser?.allowedTabs || roleMeta?.allowedTabs;
        if (allowed && !allowed.includes(tab)) {
          tab = currentUser?.defaultTab || roleMeta?.defaultTab || allowed[0];
          window.location.hash = `#${tab}`;
        }
        setActiveTab(tab);
        setCurrentView('app');
      } else if (!tab) {
        // Hash is empty, #home, #overview, #login-portal, etc. -> show HomePage
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, currentUser]);

  const navigateToApp = (tab) => {
    const roleMeta = getRoleMeta(currentUser?.role);
    const allowed = currentUser?.allowedTabs || roleMeta?.allowedTabs;
    let targetTab = tab || currentUser?.defaultTab || roleMeta?.defaultTab || activeTab || 'dashboard';
    if (allowed && !allowed.includes(targetTab)) {
      targetTab = currentUser?.defaultTab || roleMeta?.defaultTab || allowed[0];
    }
    setActiveTab(targetTab);
    setCurrentView('app');
    window.location.hash = `#${targetTab}`;
  };

  // Derive effective view: unauthenticated sessions always render the home page
  const isAppView = isAuthenticated && currentView === 'app';

  // If on HomePage (index page) or not authenticated
  if (!isAppView) {
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
