/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, usersApi } from '../services/api';

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
    allowedTabs: ['dashboard', 'users', 'laborers', 'sites', 'attendance', 'wages'],
    responsibilities: [
      'Complete administrative control & system oversight',
      'Manage user accounts, roles, and security access',
      'Audit workforce attendance, wages, and payments',
      'Configure system master records and operational parameters'
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
    allowedTabs: ['laborers', 'sites', 'attendance'],
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
    allowedTabs: ['laborers', 'sites', 'attendance', 'wages'],
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
    allowedTabs: ['laborers', 'attendance', 'wages'],
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
    allowedTabs: ['attendance', 'wages'],
    responsibilities: [
      'Calculate gross wages with automated 1.5x overtime rates',
      'Process payment disbursements and log payment methods',
      'Generate official payment receipts and vouchers',
      'Track outstanding wage balances and financial history'
    ],
    tagline: 'Calculated wages, 1.5x OT rates & disbursement vouchers'
  }
];

export const getRoleMeta = (role) => {
  switch (role) {
    case 'admin':
      return {
        roleLabel: 'System Administrator',
        badgeColor: '#a855f7',
        badgeBg: 'rgba(168, 85, 247, 0.15)',
        defaultTab: 'dashboard',
        allowedTabs: ['dashboard', 'users', 'laborers', 'sites', 'attendance', 'wages']
      };
    case 'project_manager':
      return {
        roleLabel: 'Project Manager',
        badgeColor: '#38bdf8',
        badgeBg: 'rgba(56, 189, 248, 0.15)',
        defaultTab: 'sites',
        allowedTabs: ['laborers', 'sites', 'attendance']
      };
    case 'site_supervisor':
      return {
        roleLabel: 'Site Supervisor',
        badgeColor: '#f59e0b',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        defaultTab: 'attendance',
        allowedTabs: ['laborers', 'sites', 'attendance', 'wages']
      };
    case 'hr_manager':
      return {
        roleLabel: 'HR Manager',
        badgeColor: '#10b981',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        defaultTab: 'laborers',
        allowedTabs: ['laborers', 'attendance', 'wages']
      };
    case 'payroll_officer':
      return {
        roleLabel: 'Payroll Officer',
        badgeColor: '#f43f5e',
        badgeBg: 'rgba(244, 63, 94, 0.15)',
        defaultTab: 'wages',
        allowedTabs: ['attendance', 'wages']
      };
    default:
      return {
        roleLabel: 'Operations Officer',
        badgeColor: '#f59e0b',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        defaultTab: 'dashboard',
        allowedTabs: ['dashboard']
      };
  }
};

const getInitials = (name) => {
  if (!name) return 'JL';
  const parts = name.replace(/^(Eng\.|Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, '').trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

const AuthContext = createContext();

const STORAGE_KEY = 'jal_enterprises_auth_user';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) {
          const freshMeta = getRoleMeta(parsed.role);
          return {
            ...parsed,
            ...freshMeta,
            allowedTabs: freshMeta.allowedTabs,
            defaultTab: freshMeta.defaultTab
          };
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error restoring auth state from localStorage:', e);
    }
    return null;
  });

  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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

  // Load all users from DB if admin
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const list = await usersApi.getAll();
      setUsersList(list);
      return list;
    } catch (err) {
      console.error('Failed to fetch users from database:', err);
      return [];
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    let isMounted = true;
    usersApi.getAll().then((list) => {
      if (isMounted && Array.isArray(list)) {
        setUsersList(list);
      }
    }).catch((err) => {
      console.error('Failed to load initial users:', err);
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.role]);

  // Login handler supporting database authentication with fallback
  const login = async (identifier, password = '') => {
    const cleanId = (identifier || '').trim();

    try {
      // 1. Authenticate with backend TiDB database
      const response = await authApi.login({ identifier: cleanId, password });
      if (response && response.user) {
        const dbUser = response.user;
        const meta = getRoleMeta(dbUser.role);
        const sessionUser = {
          ...dbUser,
          ...meta,
          avatar: getInitials(dbUser.name),
          loginTimestamp: new Date().toISOString()
        };
        setCurrentUser(sessionUser);
        return sessionUser;
      }
    } catch (err) {
      console.warn('Backend DB auth attempt:', err.message);
      // If error is invalid credentials or suspended, rethrow so the user sees it
      if (err.message.includes('Invalid') || err.message.includes('suspended') || err.message.includes('inactive')) {
        throw err;
      }
    }

    // 2. Fallback: match by predefined demo role if backend is not reachable
    let matchedRole = SYSTEM_ROLES.find(
      (r) => r.id === cleanId || r.key === cleanId || r.email.toLowerCase() === cleanId.toLowerCase()
    );

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

  // Switch role helper
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

  // Create new user account (Admin feature)
  const createUser = async (userData) => {
    const created = await usersApi.create(userData);
    setUsersList((prev) => [...prev, created]);
    return created;
  };

  // Update user account
  const updateUser = async (id, userData) => {
    const updated = await usersApi.update(id, userData);
    setUsersList((prev) => prev.map((u) => (u.id === id ? updated : u)));
    if (currentUser && (currentUser.id === id || currentUser.username === updated.username)) {
      const meta = getRoleMeta(updated.role);
      setCurrentUser((prev) => ({
        ...prev,
        ...updated,
        ...meta
      }));
    }
    return updated;
  };

  // Delete user account
  const deleteUser = async (id) => {
    await usersApi.delete(id);
    setUsersList((prev) => prev.filter((u) => u.id !== id));
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined' && window.location.hash) {
      window.location.hash = '';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        systemRoles: SYSTEM_ROLES,
        usersList,
        isLoadingUsers,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
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
