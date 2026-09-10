import React, { useState } from 'react';
import {
  HardHat,
  Building2,
  Users,
  Receipt,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './HomePage.css';

const HomePage = ({ onLoginSuccess, onEnterWorkspace }) => {
  const { systemRoles, login, currentUser, isAuthenticated, logout } = useAuth();

  // Selected role for the login form card (defaults to Site Supervisor or Admin)
  const [selectedRoleKey, setSelectedRoleKey] = useState('site_supervisor');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);

  // Active role object
  const currentRole = systemRoles.find((r) => r.id === selectedRoleKey) || systemRoles[0];

  // When clicking on a role pill / tab
  const handleSelectRole = (role) => {
    setSelectedRoleKey(role.id);
    setLoginMessage(null);
  };

  const handleEnterWorkspace = (targetTab) => {
    const tab = targetTab || currentUser?.defaultTab || 'dashboard';
    if (onEnterWorkspace) {
      onEnterWorkspace(tab);
    }
  };

  // Form submit login
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginMessage(null);

    try {
      const identifier = emailInput.trim() || selectedRoleKey;
      const user = await login(identifier, passwordInput);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      if (onEnterWorkspace) {
        onEnterWorkspace(user?.defaultTab || 'dashboard');
      }
    } catch (err) {
      setLoginMessage({ type: 'error', text: err.message });
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (roleId, size = 18) => {
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

  const scrollToLogin = () => {
    const el = document.getElementById('login-portal');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      <div className="home-ambient-glow" />
      <div className="home-ambient-glow-2" />

      {/* --- Top Navigation Header --- */}
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-brand">
            <div className="home-brand-logo">
              <HardHat size={26} />
            </div>
            <div className="home-brand-text">
              <h1>J A L <span>ENTERPRISES</span></h1>
              <p>Labour Management System</p>
            </div>
          </div>

          <div className="home-header-actions">
            {isAuthenticated && currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="home-user-chip">
                  <div
                    className="home-user-avatar"
                    style={{
                      background: currentUser.badgeBg || 'rgba(245, 158, 11, 0.2)',
                      color: currentUser.badgeColor || 'var(--amber-primary)',
                      border: `1px solid ${currentUser.badgeColor || 'var(--amber-primary)'}40`
                    }}
                  >
                    {currentUser.avatar || 'JL'}
                  </div>
                  <div className="home-user-info">
                    <span className="home-user-name">{currentUser.name}</span>
                    <span className="home-user-role" style={{ color: currentUser.badgeColor || 'var(--amber-primary)' }}>
                      {currentUser.roleLabel}
                    </span>
                  </div>
                </div>
                <button
                  className="btn-home-cta"
                  onClick={() => handleEnterWorkspace()}
                  title="Open operations workspace dashboard"
                >
                  <LayoutDashboard size={15} />
                  <span>Enter Workspace</span>
                </button>
                <button
                  className="btn-home-logout"
                  onClick={logout}
                  title="Sign out of current account"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button className="btn-home-cta" onClick={scrollToLogin}>
                <Lock size={15} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <section className="home-hero" id="overview">
        <div className="home-hero-badge">
          <Sparkles size={14} />
          <span>Construction Industry Workforce Management • Sri Lanka</span>
        </div>

        <h1 className="home-hero-title">
          Precision Labour & Workforce Management for <span className="highlight">J A L Enterprises</span>
        </h1>

        <p className="home-hero-desc">
          An enterprise digital platform uniting Project Managers, Field Site Supervisors, 
          HR Officers, and Payroll Accountants. Streamlining dynamic worker allocations, real-time daily muster rolls, 
          transparent 1.5x overtime wage calculations, and verified disbursement vouchers.
        </p>

        <div className="home-hero-actions">
          {isAuthenticated && currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button className="btn-hero-primary" onClick={() => handleEnterWorkspace()}>
                <span>Enter {currentUser.roleLabel || 'Operations'} Workspace</span>
                <ArrowRight size={18} />
              </button>
              <button className="btn-hero-secondary" onClick={scrollToLogin}>
                <span>Switch Account / Portal</span>
              </button>
            </div>
          ) : (
            <button className="btn-hero-primary" onClick={scrollToLogin}>
              <span>Access Role Portal</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>

      {/* --- Role Login Portal Section --- */}
      <section className="home-portal-section" id="login-portal">
        <div className="section-header">
          <div className="section-badge">
            <Lock size={13} />
            <span>Enterprise Gateway</span>
          </div>
          <h2 className="section-title">Role-Based Access Portal</h2>
          <p className="section-subtitle">
            Choose your organizational designation to log in. Each role provides specialized workflows, 
            tailored operational tabs, and granular permissions designed for J A L Enterprises.
          </p>
        </div>

        <div className="portal-layout single-column">
          {/* Centered Login Form Card */}
          <div className="portal-login-card centered">
            {/* Active Session Detected Banner */}
            {isAuthenticated && currentUser && (
              <div className="home-active-session-banner">
                <div className="active-session-badge">
                  <span className="active-pulse-dot" />
                  <span>Active Session Detected</span>
                </div>
                <div className="active-session-body">
                  <p>
                    Logged in as <strong>{currentUser.name}</strong> &bull; {currentUser.roleLabel}
                  </p>
                  <button
                    type="button"
                    className="btn-resume-workspace"
                    onClick={() => handleEnterWorkspace()}
                  >
                    <span>Resume Workspace</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
                <div className="active-session-divider">
                  <span>or switch role / sign in with another designation below</span>
                </div>
              </div>
            )}

            <div className="login-card-header">
              <div
                className="login-card-badge"
                style={{
                  background: currentRole.badgeBg,
                  color: currentRole.badgeColor,
                  border: `1px solid ${currentRole.badgeColor}40`
                }}
              >
                {getRoleIcon(currentRole.id, 15)}
                <span>{currentRole.roleLabel} Portal</span>
              </div>
              <h3>Sign In to Workspace</h3>
              <p>Sign in with your credentials to access <strong>{currentRole.roleLabel}</strong> workspace</p>
            </div>

            {/* Role Switcher Pills / Tabs */}
            <div className="role-pills-row" title="Select your role">
              {systemRoles.map((role) => {
                const isActive = selectedRoleKey === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    className={`role-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectRole(role)}
                    style={
                      isActive
                        ? {
                            background: role.badgeBg,
                            borderColor: role.badgeColor,
                            color: role.badgeColor,
                            boxShadow: `0 0 12px ${role.badgeColor}30`
                          }
                        : {}
                    }
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {getRoleIcon(role.id, 14)}
                      <span>{role.roleLabel}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {loginMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  background: loginMessage.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  border: `1px solid ${loginMessage.type === 'error' ? 'var(--rose)' : 'var(--sky)'}`,
                  color: loginMessage.type === 'error' ? '#fda4af' : '#7dd3fc'
                }}
              >
                {loginMessage.text}
              </div>
            )}

            <form className="portal-form" onSubmit={handleSubmitLogin}>
              <div className="form-group-home">
                <label htmlFor="portal-email">
                  <span>Username or Email Address</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Required</span>
                </label>
                <div className="form-input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="portal-email"
                    type="text"
                    className="form-input-home"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter username or email address"
                    required
                  />
                </div>
              </div>

              <div className="form-group-home">
                <label htmlFor="portal-password">
                  <span>Access Password / Passcode</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Required</span>
                </label>
                <div className="form-input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="portal-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input-home"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter security password"
                    required
                  />
                  <button
                    type="button"
                    className="btn-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="login-options-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember session</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-submit-login"
                disabled={isSubmitting}
                style={{
                  background: `linear-gradient(135deg, ${currentRole.badgeColor} 0%, var(--amber-hover) 100%)`
                }}
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter {currentRole.roleLabel} Workspace</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="login-security-notice">
                <ShieldCheck size={14} color="var(--emerald)" />
                <span>Authorized J A L Enterprises Personnel Only &bull; SSL Secured</span>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="home-footer">
        <div className="footer-inner" style={{ justifyContent: 'center' }}>
          <div className="footer-left">
            <div className="home-brand-logo" style={{ width: '32px', height: '32px' }}>
              <HardHat size={18} />
            </div>
            <p>
              &copy; {new Date().getFullYear()} <span>J A L Enterprises</span>. All rights reserved. Construction Labour Management System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
