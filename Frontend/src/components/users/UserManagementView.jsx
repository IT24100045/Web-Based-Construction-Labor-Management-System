import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  Lock,
  RefreshCw,
  Building2,
  Users,
  HardHat,
  Receipt,
  UserCheck,
  AlertTriangle,
  Mail,
  User
} from 'lucide-react';
import { useAuth, getRoleMeta } from '../../context/AuthContext';
import { useLabor } from '../../context/LaborContext';
import StatCard from '../common/StatCard';
import CreateUserModal from './CreateUserModal';
import ChangeRoleModal from './ChangeRoleModal';

const UserManagementView = () => {
  const { currentUser, usersList, isLoadingUsers, fetchUsers, updateUser, deleteUser } = useAuth();
  const { showToast } = useLabor();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToEditRole, setUserToEditRole] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersList, searchTerm, roleFilter, statusFilter]);

  const roleCounts = useMemo(() => {
    return {
      all: usersList.length,
      admin: usersList.filter((u) => u.role === 'admin').length,
      project_manager: usersList.filter((u) => u.role === 'project_manager').length,
      site_supervisor: usersList.filter((u) => u.role === 'site_supervisor').length,
      hr_manager: usersList.filter((u) => u.role === 'hr_manager').length,
      payroll_officer: usersList.filter((u) => u.role === 'payroll_officer').length
    };
  }, [usersList]);

  const getRoleIcon = (role, size = 16) => {
    switch (role) {
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
        return <User size={size} />;
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateUser(user.id, { status: newStatus });
      showToast(`User "${user.username}" status updated to ${newStatus}.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    if (currentUser?.id === userToDelete.id || currentUser?.username === userToDelete.username) {
      showToast('You cannot delete your own currently active account.', 'error');
      setUserToDelete(null);
      return;
    }
    try {
      await deleteUser(userToDelete.id);
      showToast(`User "${userToDelete.username}" deleted successfully.`);
      setUserToDelete(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ShieldCheck size={28} color="var(--amber-primary)" />
            User Accounts & Security Roles
          </h1>
          <p>
            Create and manage authorized staff accounts, assign operational roles, and configure system credentials for J A L Enterprises.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={fetchUsers}
            disabled={isLoadingUsers}
            title="Refresh accounts from TiDB Cloud"
          >
            <RefreshCw size={16} className={isLoadingUsers ? 'spin-icon' : ''} />
            <span>Sync Accounts</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <UserPlus size={18} />
            <span>Create New Account</span>
          </button>
        </div>
      </div>

      {/* 5 Operational Role Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard
          icon={<ShieldCheck size={24} />}
          label="Administrators"
          value={roleCounts.admin}
          subtext="Full System Control"
          color="purple"
        />
        <StatCard
          icon={<Building2 size={24} />}
          label="Project Managers"
          value={roleCounts.project_manager}
          subtext="Sites & Workforce"
          color="sky"
        />
        <StatCard
          icon={<HardHat size={24} />}
          label="Site Supervisors"
          value={roleCounts.site_supervisor}
          subtext="Field Attendance & OT"
          color="amber"
        />
        <StatCard
          icon={<Users size={24} />}
          label="HR Managers"
          value={roleCounts.hr_manager}
          subtext="Personnel & Labor Roster"
          color="emerald"
        />
        <StatCard
          icon={<Receipt size={24} />}
          label="Payroll Officers"
          value={roleCounts.payroll_officer}
          subtext="Wage Disbursal & Slips"
          color="rose"
        />
      </div>

      {/* Search & Filtering Controls */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, username, email, designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: 1
              }}
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="ALL">All Roles ({roleCounts.all})</option>
            <option value="admin">System Administrator ({roleCounts.admin})</option>
            <option value="project_manager">Project Manager ({roleCounts.project_manager})</option>
            <option value="site_supervisor">Site Supervisor ({roleCounts.site_supervisor})</option>
            <option value="hr_manager">HR Manager ({roleCounts.hr_manager})</option>
            <option value="payroll_officer">Payroll Officer ({roleCounts.payroll_officer})</option>
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-control"
          style={{ width: 'auto', minWidth: '140px' }}
        >
          <option value="ALL">All Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Users Accounts Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Officer / User</th>
                <th>Username & Email</th>
                <th>System Role</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <p>No user accounts match the current search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const meta = getRoleMeta(user.role);
                  const isCurrentAdmin = user.username === 'admin';
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: meta.badgeBg,
                              color: meta.badgeColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            {getRoleIcon(user.role, 18)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{user.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {user.id}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                            @{user.username}
                          </strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {user.email}
                          </div>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => setUserToEditRole(user)}
                          title="Click to change role"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: meta.badgeBg,
                            color: meta.badgeColor,
                            border: `1px solid ${meta.badgeColor}35`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {meta.roleLabel}
                        </button>
                      </td>

                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {user.title || 'Staff Officer'}
                      </td>

                      <td>
                        <span
                          className={`badge ${user.status === 'Active' ? 'badge-emerald' : 'badge-danger'}`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            onClick={() => setUserToEditRole(user)}
                            title="Change User Role & Permissions"
                          >
                            <UserCheck size={13} />
                            <span>Change Role</span>
                          </button>

                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleToggleStatus(user)}
                            disabled={isCurrentAdmin}
                            title={user.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                          >
                            {user.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '5px 8px' }}
                            onClick={() => setUserToDelete(user)}
                            disabled={isCurrentAdmin}
                            title={isCurrentAdmin ? 'Primary admin account cannot be deleted' : 'Delete Account'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Change Role Modal */}
      {userToEditRole && (
        <ChangeRoleModal
          isOpen={!!userToEditRole}
          user={userToEditRole}
          onClose={() => setUserToEditRole(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="modal-backdrop" onClick={() => setUserToDelete(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose)' }}>
                <AlertTriangle size={20} />
                <h3 style={{ margin: 0 }}>Delete User Account</h3>
              </div>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete the account for{' '}
                <strong style={{ color: '#fff' }}>{userToDelete.name}</strong> (@{userToDelete.username})?
                This user will immediately lose access to the system.
              </p>
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setUserToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={confirmDeleteUser}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
