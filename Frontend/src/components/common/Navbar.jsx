import React, { useState, useEffect } from 'react';
import { Menu, Plus, Calendar, Clock, Bell, UserPlus } from 'lucide-react';

const Navbar = ({ activeTab, onOpenAddLaborer, onToggleSidebar }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTabLabel = () => {
    switch (activeTab) {
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            BuildForce Hub /
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            {getTabLabel()}
          </div>
        </div>
      </div>

      <div className="nav-right">
        <div className="system-status-indicator" title="Live connection to TiDB Cloud (JAL)">
          <div className="pulse-dot" />
          <span>TiDB Cloud Connected</span>
        </div>

        <div className="date-clock-badge">
          <Calendar size={14} color="var(--amber-primary)" />
          <span>{formattedDate}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <Clock size={14} color="var(--sky)" />
          <span>{formattedTime}</span>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenAddLaborer}
          title="Quick add new laborer"
        >
          <UserPlus size={16} />
          <span>Add Laborer</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
