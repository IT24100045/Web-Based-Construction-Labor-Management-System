import React, { useState } from 'react';
import { LaborProvider } from './context/LaborContext';
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
import './App.css';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global quick modals
  const [isAddLaborerOpen, setIsAddLaborerOpen] = useState(false);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [quickPaymentLaborer, setQuickPaymentLaborer] = useState(null);
  const [receiptData, setReceiptData] = useState({ isOpen: false, payment: null, wage: null });

  const renderActiveTab = () => {
    switch (activeTab) {
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
          onOpenAddLaborer={() => setIsAddLaborerOpen(true)}
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

function App() {
  return (
    <LaborProvider>
      <MainApp />
    </LaborProvider>
  );
}

export default App;
