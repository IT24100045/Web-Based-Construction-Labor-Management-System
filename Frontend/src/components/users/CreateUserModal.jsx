import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth, SYSTEM_ROLES } from '../../context/AuthContext';
import { useLabor } from '../../context/LaborContext';
import { UserPlus, Lock, Mail, User, ShieldCheck, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

const CreateUserModal = ({ isOpen, onClose }) => {
  const { createUser } = useAuth();
  const { showToast } = useLabor();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'site_supervisor',
    title: 'Site Supervisor',
    status: 'Active'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    { value: 'admin', label: 'System Administrator' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'site_supervisor', label: 'Site Supervisor' },
    { value: 'hr_manager', label: 'HR Manager' },
    { value: 'payroll_officer', label: 'Payroll Officer' }
  ];

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    const defaultRoleObj = SYSTEM_ROLES.find((r) => r.id === selectedRole);
    setForm((prev) => ({
      ...prev,
      role: selectedRole,
      title: defaultRoleObj ? defaultRoleObj.title : prev.title
    }));
  };

  const generateRandomPassword = () => {
    const prefix = form.username.trim() || form.role || 'user';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const generated = `${prefix}${randNum}!`;
    setForm((prev) => ({ ...prev, password: generated }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.username.trim()) errs.username = 'Username is required.';
    else if (form.username.trim().length < 3) errs.username = 'Username must be at least 3 characters.';
    else if (!/^[a-zA-Z0-9._-]+$/.test(form.username.trim())) {
      errs.username = 'Username can only contain letters, numbers, dots, and hyphens.';
    }

    if (!form.email.trim()) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 4) errs.password = 'Password must be at least 4 characters.';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser({
        ...form,
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase()
      });
      showToast(`User account "${form.username}" created successfully.`);
      setForm({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'site_supervisor',
        title: 'Site Supervisor',
        status: 'Active'
      });
      setErrors({});
      onClose();
    } catch (err) {
      setErrors({ server: err.message });
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User Account" maxWidth="600px">
      <form onSubmit={handleSubmit} noValidate>
        {errors.server && (
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
            <AlertCircle size={15} />
            <span>{errors.server}</span>
          </div>
        )}

        <div className="form-row">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="user-fullname">
              Full Name <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="user-fullname"
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Priyantha Jayasuriya"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                required
              />
            </div>
            {errors.name && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.name}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="user-role">
              System Role / Permissions <span className="required">*</span>
            </label>
            <select
              id="user-role"
              className="form-control"
              value={form.role}
              onChange={handleRoleChange}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-title">
              Official Job Designation
            </label>
            <input
              id="user-title"
              type="text"
              className="form-control"
              placeholder="e.g. Field Operations Lead"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="user-username">
              Username <span className="required">*</span>
            </label>
            <input
              id="user-username"
              type="text"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder="e.g. priyantha_sup"
              value={form.username}
              onChange={(e) => {
                setForm({ ...form, username: e.target.value.toLowerCase() });
                if (errors.username) setErrors({ ...errors, username: null });
              }}
              required
            />
            {errors.username && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-email">
              Official Email <span className="required">*</span>
            </label>
            <input
              id="user-email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="name@jalenterprises.lk"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              required
            />
            {errors.email && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.email}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" htmlFor="user-password" style={{ margin: 0 }}>
                Password <span className="required">*</span>
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--amber-primary)',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600
                }}
              >
                <Sparkles size={12} />
                <span>Generate</span>
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="user-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter password (min 4 chars)"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-status">
              Account Status
            </label>
            <select
              id="user-status"
              className="form-control"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '24px', padding: 0, border: 'none' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <UserPlus size={16} />
            <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
