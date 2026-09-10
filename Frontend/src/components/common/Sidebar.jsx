import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Receipt,
  HardHat,
  RefreshCw,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useLabor } from '../../context/LaborContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { laborers, sites, refreshAllData, isLoading } = useLabor();
  const { currentUser, logout, usersList } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      icon: <LayoutDashboard size={19} />,
      badge: null
    },
    ...(currentUser?.role === 'admin'
      ? [
          {
            id: 'users',
            label: 'User Accounts',
            icon: <ShieldCheck size={19} />,
            badge: usersList.length || 'Admin'
          }
        ]
      : []),
    {
      id: 'laborers',
      label: 'Labor Directory',
      icon: <Users size={19} />,
      badge: laborers.length
    },
    {
      id: 'sites',
      label: 'Sites & Allocation',
      icon: <Building2 size={19} />,
      badge: sites.length
    },
    {
      id: 'attendance',
      label: 'Attendance & Overtime',
      icon: <CalendarCheck size={19} />,
      badge: 'Daily'
    },
    {
      id: 'wages',
      label: 'Wages & Payments',
      icon: <Receipt size={19} />,
      badge: 'Payroll'
    }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth <= 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon">
            <HardHat size={24} />
          </div>
          <div className="brand-info">
            <h2>J A L</h2>
            <span>Enterprises</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Operations</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <div className="nav-item-content">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="nav-section-title" style={{ marginTop: '16px' }}>Database</div>
          <button
            className="nav-item"
            onClick={refreshAllData}
            title="Sync live records from TiDB Cloud database"
            disabled={isLoading}
          >
            <div className="nav-item-content">
              <RefreshCw size={17} className={isLoading ? 'spin-icon' : ''} />
              <span style={{ fontSize: '0.85rem' }}>{isLoading ? 'Syncing TiDB...' : 'Sync Cloud DB'}</span>
            </div>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="supervisor-badge">
            <div
              className="supervisor-avatar"
              style={{
                background: currentUser?.badgeBg || 'var(--amber-bg)',
                color: currentUser?.badgeColor || 'var(--amber-primary)',
                border: `1px solid ${currentUser?.badgeColor || 'var(--amber-primary)'}40`
              }}
            >
              {currentUser?.avatar || 'JL'}
            </div>
            <div className="supervisor-info">
              <span className="supervisor-name">{currentUser?.name || 'Authorized Officer'}</span>
              <span className="supervisor-role">{currentUser?.title || 'System Operator'}</span>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{
                width: '100%',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                padding: '8px 12px',
                borderColor: 'var(--border-medium)',
                background: 'rgba(7, 11, 20, 0.6)',
                color: 'var(--rose)'
              }}
              title="Sign out of current account"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
