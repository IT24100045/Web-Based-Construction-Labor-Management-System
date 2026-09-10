import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth, SYSTEM_ROLES } from '../../context/AuthContext';
import { useLabor } from '../../context/LaborContext';
import { UserPlus, Eye, EyeOff, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const CreateUserModal = ({ isOpen, onClose }) => {
  const { createUser, usersList } = useAuth();
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
  const [touched, setTouched] = useState({});
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
    const cleanPrefix = prefix.replace(/[^a-zA-Z0-9]/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const generated = `${cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1)}${randNum}!`;
    setForm((prev) => ({ ...prev, password: generated }));
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validateField('password', generated) }));
    }
  };

  const validateField = (field, value, allValues = form) => {
    let err = '';
    const trimmed = (value || '').trim();

    switch (field) {
      case 'name':
        if (!trimmed) {
          err = 'Full name is required.';
        } else if (trimmed.length < 3) {
          err = 'Full name must be at least 3 characters.';
        } else if (trimmed.length > 60) {
          err = 'Full name cannot exceed 60 characters.';
        }
        break;
      case 'username':
        if (!trimmed) {
          err = 'Username is required.';
        } else if (trimmed.length < 3) {
          err = 'Username must be at least 3 characters.';
        } else if (trimmed.length > 30) {
          err = 'Username cannot exceed 30 characters.';
        } else if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
          err = 'Username can only contain letters, numbers, dots, and hyphens.';
        } else if (usersList && usersList.some((u) => u.username?.toLowerCase() === trimmed.toLowerCase())) {
          err = `Username "${trimmed.toLowerCase()}" is already registered.`;
        }
        break;
      case 'email':
        if (!trimmed) {
          err = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          err = 'Please enter a valid email address.';
        } else if (usersList && usersList.some((u) => u.email?.toLowerCase() === trimmed.toLowerCase())) {
          err = `Email "${trimmed.toLowerCase()}" is already registered.`;
        }
        break;
      case 'password':
        if (!value) {
          err = 'Password is required.';
        } else if (value.length < 6) {
          err = 'Password must be at least 6 characters.';
        } else if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
          err = 'Password must contain both letters and numbers.';
        }
        break;
      default:
        break;
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    if (errors.server) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.server;
        return next;
      });
    }

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, updated)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, form)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {};
    ['name', 'username', 'email', 'password'].forEach((f) => {
      const err = validateField(f, form[f], form);
      if (err) errs[f] = err;
    });

    setTouched({
      name: true,
      username: true,
      email: true,
      password: true
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser({
        ...form,
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        title: form.title.trim()
      });

      showToast(`User account "${form.username.trim().toLowerCase()}" created successfully.`);
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
      setTouched({});
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, server: err.message || 'Failed to create user account' }));
      showToast(err.message || 'Failed to create user account', 'error');
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
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errors.server}</span>
          </div>
        )}

        <div className="form-row">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="user-fullname">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="user-fullname"
              type="text"
              name="name"
              disabled={isSubmitting}
              className={`form-control ${touched.name ? (errors.name ? 'is-invalid' : 'is-valid') : ''}`}
              placeholder="e.g. Priyantha Jayasuriya"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.name && errors.name && (
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
              name="role"
              className="form-control"
              value={form.role}
              onChange={handleRoleChange}
              disabled={isSubmitting}
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
              name="title"
              disabled={isSubmitting}
              className="form-control"
              placeholder="e.g. Field Operations Lead"
              value={form.title}
              onChange={handleChange}
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
              name="username"
              disabled={isSubmitting}
              className={`form-control ${touched.username ? (errors.username ? 'is-invalid' : 'is-valid') : ''}`}
              placeholder="e.g. priyantha_sup"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.username && errors.username && (
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
              name="email"
              disabled={isSubmitting}
              className={`form-control ${touched.email ? (errors.email ? 'is-invalid' : 'is-valid') : ''}`}
              placeholder="name@jalenterprises.lk"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.email && errors.email && (
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
                disabled={isSubmitting}
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
                name="password"
                disabled={isSubmitting}
                className={`form-control ${touched.password ? (errors.password ? 'is-invalid' : 'is-valid') : ''}`}
                placeholder="Min 6 chars (letters + numbers)"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                disabled={isSubmitting}
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
            {touched.password && errors.password ? (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.password}</span>
            ) : (
              <span className="form-hint">At least 6 characters including letters and numbers</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-status">
              Account Status
            </label>
            <select
              id="user-status"
              name="status"
              className="form-control"
              value={form.status}
              onChange={handleChange}
              disabled={isSubmitting}
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
            {isSubmitting ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
