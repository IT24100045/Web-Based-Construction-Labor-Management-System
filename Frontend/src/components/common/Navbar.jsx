import React, { useState, useEffect, useRef } from 'react';
import { Menu, Calendar, Clock, LogOut, ChevronDown, ShieldCheck, HardHat, Building2, Users, Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ activeTab, onToggleSidebar }) => {
  const { currentUser, systemRoles, switchRole, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabLabel = () => {
    switch (activeTab) {
      case 'users':
        return 'User Accounts & Security Roles';
      case 'laborers':
        return 'Labor Management & Directory';
      case 'sites':
        return 'Site Allocation & Projects';
      case 'attendance':
        return 'Daily Attendance & Overtime Tracker';
      case 'wages':
        return 'Calculated Wages & Payment Disbursements';
      default:
        return 'Executive Overview Dashboard';
    }
  };

  const getRoleIcon = (roleId, size = 15) => {
    switch (roleId) {
      case 'admin':
        return <ShieldCheck size={size} />;
      case 'project_manager':
        return <Building2 size={size} />;
      case 'site_supervisor':
        return <HardHat size={size} />;
      case 'hr_manager':
        return <Users size={size} />;
      case 'payroll_officer':
        return <Receipt size={size} />;
      default:
        return <HardHat size={size} />;
    }
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="top-navbar">
      <div className="nav-left">
        <button
          className="mobile-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--amber-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            J A L Enterprises /
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            {getTabLabel()}
          </div>
        </div>
      </div>

      <div className="nav-right" style={{ gap: '12px' }}>
        <div className="date-clock-badge">
          <Calendar size={14} color="var(--amber-primary)" />
          <span>{formattedDate}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <Clock size={14} color="var(--sky)" />
          <span>{formattedTime}</span>
        </div>

        {/* Active Role Profile Chip with Switcher Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(19, 31, 55, 0.85)',
              borderColor: currentUser?.badgeColor || 'var(--border-medium)'
            }}
            title="Active user & role switcher"
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: currentUser?.badgeBg || 'rgba(245, 158, 11, 0.2)',
                color: currentUser?.badgeColor || 'var(--amber-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}
            >
              {currentUser?.avatar || 'JL'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                {currentUser?.name?.split(' ')[0] || 'User'}
              </div>
              <div style={{ fontSize: '0.68rem', color: currentUser?.badgeColor || 'var(--amber-primary)' }}>
                {currentUser?.roleLabel || 'Officer'}
              </div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {showRoleDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                background: '#0d1527',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                padding: '8px',
                zIndex: 1000
              }}
            >
              <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Signed in as
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                  {currentUser?.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  {currentUser?.email}
                </div>
              </div>

              <div style={{ padding: '4px 10px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Switch Role / Persona:
              </div>

              {systemRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    switchRole(role.id);
                    setShowRoleDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: currentUser?.id === role.id ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                    color: currentUser?.id === role.id ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.78rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentUser?.id !== role.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (currentUser?.id !== role.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: role.badgeColor }}>
                      {getRoleIcon(role.id, 14)}
                    </span>
                    <span>{role.roleLabel}</span>
                  </div>
                  {currentUser?.id === role.id && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--amber-primary)', fontWeight: 700 }}>
                      Active
                    </span>
                  )}
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '6px', paddingTop: '6px' }}>
                <button
                  onClick={() => {
                    setShowRoleDropdown(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--rose)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={14} />
                  <span>Exit to JAL Portal (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
