import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import { useAuth, getRoleMeta } from '../../context/AuthContext';
import { useLabor } from '../../context/LaborContext';
import { usersApi } from '../../services/api';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

const evaluatePasswordStrength = (pwd, currentPwd) => {
  if (!pwd) {
    return {
      score: 0,
      label: 'No password',
      color: 'var(--text-muted)',
      badgeBg: 'rgba(255, 255, 255, 0.05)',
      activeSegments: 0,
      checks: {
        minLength: false,
        hasLetter: false,
        hasNumber: false,
        hasUpper: false,
        hasSpecial: false,
        isDifferent: true
      }
    };
  }

  const checks = {
    minLength: pwd.length >= 6,
    hasLetter: /[a-zA-Z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasUpper: /[A-Z]/.test(pwd),
    hasSpecial: /[^a-zA-Z0-9]/.test(pwd),
    isDifferent: !currentPwd || pwd !== currentPwd
  };

  let points = 0;
  if (checks.minLength) points += 1;
  if (pwd.length >= 8) points += 1;
  if (checks.hasLetter && checks.hasNumber) points += 1;
  if (checks.hasUpper) points += 1;
  if (checks.hasSpecial) points += 1;

  let label = 'Weak';
  let color = '#f43f5e';
  let badgeBg = 'rgba(244, 63, 94, 0.15)';
  let activeSegments = 1;

  if (points >= 5) {
    label = 'Very Strong';
    color = '#10b981';
    badgeBg = 'rgba(16, 185, 129, 0.18)';
    activeSegments = 4;
  } else if (points >= 4) {
    label = 'Strong';
    color = '#10b981';
    badgeBg = 'rgba(16, 185, 129, 0.15)';
    activeSegments = 4;
  } else if (points >= 3) {
    label = 'Good';
    color = '#38bdf8';
    badgeBg = 'rgba(56, 189, 248, 0.15)';
    activeSegments = 3;
  } else if (points >= 2) {
    label = 'Fair';
    color = '#f59e0b';
    badgeBg = 'rgba(245, 158, 11, 0.15)';
    activeSegments = 2;
  } else {
    label = 'Weak';
    color = '#f43f5e';
    badgeBg = 'rgba(244, 63, 94, 0.15)';
    activeSegments = 1;
  }

  return { points, label, color, badgeBg, activeSegments, checks };
};

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { showToast } = useLabor();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const strength = useMemo(
    () => evaluatePasswordStrength(newPassword, currentPassword),
    [newPassword, currentPassword]
  );

  if (!isOpen || !currentUser) return null;

  const handleResetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (!strength.checks.hasLetter || !strength.checks.hasNumber) {
      setError('New password must contain both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await usersApi.changePassword(currentUser.id, {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim()
      });

      showToast('Password updated successfully. Use your new password on next sign-in.', 'success');
      handleClose();
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.message || 'Failed to update password. Please verify your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleMeta = getRoleMeta(currentUser.role);
  const passwordsMatch = confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Account Password"
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* User Account Context Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: currentUser.badgeBg || 'rgba(245, 158, 11, 0.15)',
              color: currentUser.badgeColor || 'var(--amber-primary)',
              border: `1px solid ${currentUser.badgeColor || 'var(--amber-primary)'}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)'
            }}
          >
            {currentUser.avatar || 'JL'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.74rem', color: currentUser.badgeColor || 'var(--amber-primary)', fontWeight: 600 }}>
              {currentUser.roleLabel || roleMeta?.roleLabel || 'Authorized Officer'} &bull; <span style={{ color: 'var(--text-muted)' }}>{currentUser.email}</span>
            </div>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Current Password Field */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="current-pw">
            Current Password <span className="required">*</span>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="current-pw"
              type={showCurrentPw ? 'text' : 'password'}
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              autoFocus
              style={{ paddingRight: '38px' }}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              tabIndex="-1"
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title={showCurrentPw ? 'Hide password' : 'Show password'}
            >
              {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password Field */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="new-pw">
            New Password <span className="required">*</span>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="new-pw"
              type={showNewPw ? 'text' : 'password'}
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              minLength={6}
              style={{ paddingRight: '38px' }}
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              tabIndex="-1"
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title={showNewPw ? 'Hide password' : 'Show password'}
            >
              {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Modern Password Complexity & Strength Meter Card */}
          {newPassword && (
            <div
              style={{
                marginTop: '10px',
                padding: '12px 14px',
                background: 'rgba(13, 21, 39, 0.7)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Strength Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Password Strength
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: strength.color,
                    background: strength.badgeBg,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${strength.color}40`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {strength.label}
                </span>
              </div>

              {/* 4-Segment Strength Progress Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[1, 2, 3, 4].map((seg) => {
                  const isActive = seg <= strength.activeSegments;
                  return (
                    <div
                      key={seg}
                      style={{
                        height: '4px',
                        borderRadius: '2px',
                        background: isActive ? strength.color : 'rgba(255, 255, 255, 0.08)',
                        boxShadow: isActive ? `0 0 6px ${strength.color}60` : 'none',
                        transition: 'background 0.25s ease, box-shadow 0.25s ease'
                      }}
                    />
                  );
                })}
              </div>

              {/* Interactive Complexity Requirements Checklist */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px 12px',
                  marginTop: '4px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                {/* Rule 1: Min 6 characters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {strength.checks.minLength ? (
                    <CheckCircle2 size={13} color="#10b981" style={{ flexShrink: 0 }} />
                  ) : (
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(255, 255, 255, 0.25)',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: strength.checks.minLength ? '#e2e8f0' : 'var(--text-muted)',
                      fontWeight: strength.checks.minLength ? 600 : 400,
                      transition: 'color 0.15s ease'
                    }}
                  >
                    At least 6 characters
                  </span>
                </div>

                {/* Rule 2: Letters & numbers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {strength.checks.hasLetter && strength.checks.hasNumber ? (
                    <CheckCircle2 size={13} color="#10b981" style={{ flexShrink: 0 }} />
                  ) : (
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(255, 255, 255, 0.25)',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: strength.checks.hasLetter && strength.checks.hasNumber ? '#e2e8f0' : 'var(--text-muted)',
                      fontWeight: strength.checks.hasLetter && strength.checks.hasNumber ? 600 : 400,
                      transition: 'color 0.15s ease'
                    }}
                  >
                    Letters & numbers
                  </span>
                </div>

                {/* Rule 3: Uppercase letter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {strength.checks.hasUpper ? (
                    <CheckCircle2 size={13} color="#10b981" style={{ flexShrink: 0 }} />
                  ) : (
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(255, 255, 255, 0.25)',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: strength.checks.hasUpper ? '#e2e8f0' : 'var(--text-muted)',
                      fontWeight: strength.checks.hasUpper ? 600 : 400,
                      transition: 'color 0.15s ease'
                    }}
                  >
                    Uppercase letter (A-Z)
                  </span>
                </div>

                {/* Rule 4: Special symbol */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {strength.checks.hasSpecial ? (
                    <CheckCircle2 size={13} color="#10b981" style={{ flexShrink: 0 }} />
                  ) : (
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(255, 255, 255, 0.25)',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: strength.checks.hasSpecial ? '#e2e8f0' : 'var(--text-muted)',
                      fontWeight: strength.checks.hasSpecial ? 600 : 400,
                      transition: 'color 0.15s ease'
                    }}
                  >
                    Special symbol (@, #, $)
                  </span>
                </div>
              </div>

              {/* Warning if same as current password */}
              {currentPassword && newPassword && currentPassword === newPassword && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.72rem',
                    color: '#f87171',
                    padding: '6px 10px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    borderRadius: '4px',
                    border: '1px solid rgba(244, 63, 94, 0.2)'
                  }}
                >
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  <span>New password cannot be identical to your current password</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="confirm-pw">
            Confirm New Password <span className="required">*</span>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="confirm-pw"
              type={showConfirmPw ? 'text' : 'password'}
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              minLength={6}
              style={{
                paddingRight: '38px',
                borderColor: passwordsMatch
                  ? 'rgba(16, 185, 129, 0.5)'
                  : passwordsMismatch
                  ? 'rgba(244, 63, 94, 0.5)'
                  : undefined
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPw(!showConfirmPw)}
              tabIndex="-1"
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title={showConfirmPw ? 'Hide password' : 'Show password'}
            >
              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Real-time Match Feedback */}
          {passwordsMatch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#34d399', marginTop: '6px' }}>
              <CheckCircle2 size={13} color="#10b981" />
              <span>Passwords match</span>
            </div>
          )}
          {passwordsMismatch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#fda4af', marginTop: '6px' }}>
              <AlertCircle size={13} color="#f43f5e" />
              <span>Passwords do not match</span>
            </div>
          )}
        </div>

        {/* Security Requirement Hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          <ShieldCheck size={13} color="var(--amber-primary)" />
          <span>New password takes effect immediately for this account.</span>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || (confirmPassword && !passwordsMatch)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <KeyRound size={15} />
            <span>{isSubmitting ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;

