import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth, SYSTEM_ROLES, getRoleMeta } from '../../context/AuthContext';
import { useLabor } from '../../context/LaborContext';
import {
  ShieldCheck,
  Building2,
  HardHat,
  Users,
  Receipt,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const ChangeRoleModal = ({ isOpen, user, onClose }) => {
  const { updateUser } = useAuth();
  const { showToast } = useLabor();

  const [selectedRole, setSelectedRole] = useState(user?.role || 'site_supervisor');
  const [title, setTitle] = useState(user?.title || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null;

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
        return <Users size={size} />;
    }
  };

  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
    setError(null);
    // Auto-suggest designation title if current title matches standard role title
    const targetRole = SYSTEM_ROLES.find((r) => r.id === roleId);
    if (targetRole) {
      setTitle(targetRole.title);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (user.username === 'admin' && selectedRole !== 'admin') {
      const confirmed = window.confirm(
        'Warning: You are changing the role of the primary "admin" account. This will remove System Administrator permissions from this account. Are you sure?'
      );
      if (!confirmed) return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateUser(user.id, {
        role: selectedRole,
        title: title.trim() || undefined
      });
      const meta = getRoleMeta(selectedRole);
      showToast(`User @${user.username} role updated to ${meta.roleLabel} successfully.`);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setIsSaving(false);
    }
  };

  const currentRoleMeta = getRoleMeta(user.role);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change System Role & Permissions"
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        {/* User Summary Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: currentRoleMeta.badgeBg,
              color: currentRoleMeta.badgeColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            {getRoleIcon(user.role, 22)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{user.name}</strong>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                @{user.username}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user.email} &bull; Current Role: <span style={{ color: currentRoleMeta.badgeColor, fontWeight: 600 }}>{currentRoleMeta.roleLabel}</span>
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid var(--rose)',
              color: '#fda4af',
              fontSize: '0.82rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Role Options Selection */}
        <div style={{ marginBottom: '18px' }}>
          <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
            Assign Operational Role <span className="required">*</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SYSTEM_ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected
                      ? `2px solid ${role.badgeColor}`
                      : '1px solid var(--border-subtle)',
                    background: isSelected
                      ? `rgba(255, 255, 255, 0.05)`
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: role.badgeBg,
                      color: role.badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getRoleIcon(role.id, 16)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                        {role.roleLabel}
                      </span>
                      {user.role === role.id && (
                        <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                          Current
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      {role.tagline}
                    </div>
                  </div>

                  <div style={{ color: isSelected ? role.badgeColor : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {isSelected ? <CheckCircle2 size={18} /> : <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--border-medium)' }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Job Designation */}
        <div className="form-group" style={{ marginBottom: '22px' }}>
          <label className="form-label" htmlFor="edit-user-title">
            Official Job Title / Designation
          </label>
          <input
            id="edit-user-title"
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lead Project Manager - Western Province"
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Displayed on daily muster sheets, reports, and administrative logs.
          </span>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Updating...' : 'Save Role Change'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeRoleModal;
