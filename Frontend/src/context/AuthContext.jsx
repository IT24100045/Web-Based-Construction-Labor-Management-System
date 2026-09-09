/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

// Enterprise Roles for J A L Enterprises Labour Management System
export const SYSTEM_ROLES = [
  {
    id: 'admin',
    key: 'admin',
    name: 'Eng. J.A. Liyanage',
    title: 'Managing Director & System Admin',
    roleLabel: 'System Administrator',
    email: 'admin@jalenterprises.lk',
    avatar: 'JL',
    badgeColor: '#a855f7',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    defaultTab: 'dashboard',
    allowedTabs: ['dashboard', 'laborers', 'sites', 'attendance', 'wages'],
    responsibilities: [
      'Complete administrative control & system oversight',
      'Manage enterprise operational analytics & sites',
      'Audit workforce attendance, wages, and payments',
      'Configure system master records and security'
    ],
    tagline: 'Enterprise-wide management & operations'
  },
  {
    id: 'project_manager',
    key: 'project_manager',
    name: 'Sunil Fernando',
    title: 'Senior Project Manager',
    roleLabel: 'Project Manager',
    email: 'pm@jalenterprises.lk',
    avatar: 'SF',
    badgeColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    defaultTab: 'sites',
    allowedTabs: ['dashboard', 'sites', 'laborers', 'wages'],
    responsibilities: [
      'Register and monitor construction project sites',
      'Allocate skilled trades and general workforce to sites',
      'Track project budgets, timelines, and manpower needs',
      'Approve wage statements and site progress'
    ],
    tagline: 'Construction sites, budgets & workforce allocation'
  },
  {
    id: 'site_supervisor',
    key: 'site_supervisor',
    name: 'Eng. N. Samarasinghe',
    title: 'Chief Site Supervisor',
    roleLabel: 'Site Supervisor',
    email: 'supervisor@jalenterprises.lk',
    avatar: 'NS',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    defaultTab: 'attendance',
    allowedTabs: ['dashboard', 'attendance', 'sites', 'laborers'],
    responsibilities: [
      'Log daily muster roll and worker check-ins',
      'Record regular and overtime (OT) hours with justification',
      'Inspect trade work and on-site task completion',
      'Ensure health, safety, and labor regulations compliance'
    ],
    tagline: 'Field muster roll, daily attendance & overtime logging'
  },
  {
    id: 'hr_manager',
    key: 'hr_manager',
    name: 'Kamal Weerasinghe',
    title: 'Head of Human Resources',
    roleLabel: 'HR Manager',
    email: 'hr@jalenterprises.lk',
    avatar: 'KW',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    defaultTab: 'laborers',
    allowedTabs: ['dashboard', 'laborers', 'sites'],
    responsibilities: [
      'Onboard and register new construction laborers',
      'Maintain verified NIC, contact, and emergency records',
      'Classify skill levels and establish trade hourly rates',
      'Manage workforce directory and worker documentation'
    ],
    tagline: 'Workforce onboarding, skill certification & directory'
  },
  {
    id: 'payroll_officer',
    key: 'payroll_officer',
    name: 'Anoma Jayawardena',
    title: 'Senior Payroll & Accounts Officer',
    roleLabel: 'Payroll Officer',
    email: 'payroll@jalenterprises.lk',
    avatar: 'AJ',
    badgeColor: '#f43f5e',
    badgeBg: 'rgba(244, 63, 94, 0.15)',
    defaultTab: 'wages',
    allowedTabs: ['dashboard', 'wages', 'laborers'],
    responsibilities: [
      'Calculate gross wages with automated 1.5x overtime rates',
      'Process payment disbursements and log payment methods',
      'Generate official payment receipts and vouchers',
      'Track outstanding wage balances and financial history'
    ],
    tagline: 'Calculated wages, 1.5x OT rates & disbursement vouchers'
  }
];

const AuthContext = createContext();

const STORAGE_KEY = 'jal_enterprises_auth_user';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error restoring auth state from localStorage:', e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error storing auth state in localStorage:', e);
    }
  }, [currentUser]);

  // Login handler supporting either role ID or user object or email/password
  const login = async (roleOrEmail, _password = '') => {
    // 1. Direct role match by id / key
    let matchedRole = SYSTEM_ROLES.find(
      (r) => r.id === roleOrEmail || r.key === roleOrEmail
    );

    // 2. Match by email
    if (!matchedRole) {
      matchedRole = SYSTEM_ROLES.find(
        (r) => r.email.toLowerCase() === (roleOrEmail || '').toLowerCase().trim()
      );
    }

    // 3. Fallback: default to admin if not found but requested login
    if (!matchedRole) {
      matchedRole = SYSTEM_ROLES[0];
    }

    const sessionUser = {
      ...matchedRole,
      loginTimestamp: new Date().toISOString()
    };

    setCurrentUser(sessionUser);
    return sessionUser;
  };

  // Quick switch role utility (for testing / demo switcher)
  const switchRole = (roleId) => {
    const target = SYSTEM_ROLES.find((r) => r.id === roleId);
    if (target) {
      const updated = {
        ...target,
        loginTimestamp: new Date().toISOString()
      };
      setCurrentUser(updated);
      return updated;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        systemRoles: SYSTEM_ROLES,
        login,
        logout,
        switchRole
      }}
    >
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
