import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { PROJECT_TYPES } from '../../utils/mockData';
import { Building2, AlertCircle, Loader2 } from 'lucide-react';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialFormState = {
  name: '',
  code: '',
  location: '',
  type: 'Commercial',
  client: '',
  startDate: getTodayDateString(),
  endDate: '',
  budget: '50000000',
  manager: 'Eng. Nihal Samarasinghe',
  status: 'Active',
  description: ''
};

const AddSiteModal = ({ isOpen, onClose }) => {
  const { addSite, sites } = useLabor();

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateField = (field, value, allValues = form) => {
    let err = '';
    const trimmed = (value || '').trim();

    switch (field) {
      case 'name':
        if (!trimmed) {
          err = 'Site name is required.';
        } else if (trimmed.length < 3) {
          err = 'Site name must be at least 3 characters.';
        } else if (trimmed.length > 100) {
          err = 'Site name cannot exceed 100 characters.';
        } else if (sites.some((s) => s.name?.trim().toLowerCase() === trimmed.toLowerCase())) {
          err = 'A site with this name already exists in the system.';
        }
        break;
      case 'code':
        if (trimmed) {
          if (!/^[A-Za-z0-9\-_/]{3,30}$/.test(trimmed)) {
            err = 'Code must be 3-30 alphanumeric characters, hyphens, or slashes.';
          } else if (sites.some((s) => s.code?.trim().toLowerCase() === trimmed.toLowerCase())) {
            err = 'A project with this site code is already registered.';
          }
        }
        break;
      case 'location':
        if (!trimmed) {
          err = 'Site location / address is required.';
        } else if (trimmed.length < 3) {
          err = 'Location must be at least 3 characters.';
        }
        break;
      case 'client':
        if (!trimmed) {
          err = 'Client / contracting entity name is required.';
        } else if (trimmed.length < 2) {
          err = 'Client name must be at least 2 characters.';
        }
        break;
      case 'startDate':
        if (!value) {
          err = 'Project commencement date is required.';
        }
        break;
      case 'endDate':
        if (!value) {
          err = 'Expected completion date is required.';
        } else if (allValues.startDate && value < allValues.startDate) {
          err = 'Completion date must be on or after commencement date.';
        }
        break;
      case 'budget':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          err = 'Estimated budget must be a positive number greater than 0.';
        } else if (parseFloat(value) > 100000000000) {
          err = 'Budget cannot exceed Rs. 100 Billion.';
        }
        break;
      case 'manager':
        if (!trimmed) {
          err = 'Site supervisor/manager in-charge is required.';
        } else if (trimmed.length < 3) {
          err = 'Manager name must be at least 3 characters.';
        }
        break;
      default:
        break;
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    if (serverError) setServerError('');

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, updatedForm)
      }));
    }

    // Cross-validate end date if start date changes
    if (name === 'startDate' && (touched.endDate || form.endDate)) {
      setErrors((prev) => ({
        ...prev,
        endDate: validateField('endDate', updatedForm.endDate, updatedForm)
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

    const newErrors = {};
    ['name', 'code', 'location', 'client', 'startDate', 'endDate', 'budget', 'manager'].forEach((key) => {
      const err = validateField(key, form[key], form);
      if (err) newErrors[key] = err;
    });

    setTouched({
      name: true,
      code: true,
      location: true,
      client: true,
      startDate: true,
      endDate: true,
      budget: true,
      manager: true
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const generatedCode = form.code.trim() || `PRJ-${String(sites.length + 1).padStart(3, '0')}-${new Date().getFullYear()}`;

    setIsSubmitting(true);
    setServerError('');

    try {
      await addSite({
        ...form,
        name: form.name.trim(),
        code: generatedCode,
        location: form.location.trim(),
        client: form.client.trim(),
        manager: form.manager.trim(),
        budget: parseFloat(form.budget),
        description: form.description.trim()
      });

      setForm(initialFormState);
      setErrors({});
      setTouched({});
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to register site project. Please check server logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      setErrors({});
      setTouched({});
      setServerError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title="Register New Construction Site" maxWidth="680px">
      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid var(--rose)',
              color: '#fda4af',
              fontSize: '0.84rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        <div className="form-row">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="site-name">
              Construction Site Name <span className="required">*</span>
            </label>
            <input
              id="site-name"
              type="text"
              name="name"
              placeholder="e.g. Metro Rail Link Extension Phase II"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`form-control ${touched.name ? (errors.name ? 'is-invalid' : 'is-valid') : ''}`}
              required
            />
            {touched.name && errors.name && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.name}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="site-code">
              Project Code
            </label>
            <input
              id="site-code"
              type="text"
              name="code"
              placeholder={`e.g. PRJ-${String(sites.length + 1).padStart(3, '0')}-2026`}
              value={form.code}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`form-control ${touched.code ? (errors.code ? 'is-invalid' : 'is-valid') : ''}`}
            />
            {touched.code && errors.code && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.code}</span>
            )}
            {!errors.code && <span className="form-hint">Leave blank to auto-generate code</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="site-type">Project Sector / Type</label>
            <select
              id="site-type"
              name="type"
              value={form.type}
              onChange={handleChange}
              disabled={isSubmitting}
              className="form-control"
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="site-location">
              Site Location / Address <span className="required">*</span>
            </label>
            <input
              id="site-location"
              type="text"
              name="location"
              placeholder="e.g. 450 Galle Face Terrace, Colombo 03"
              value={form.location}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`form-control ${touched.location ? (errors.location ? 'is-invalid' : 'is-valid') : ''}`}
              required
            />
            {touched.location && errors.location && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.location}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="site-client">
              Client / Contracting Entity <span className="required">*</span>
            </label>
            <input
              id="site-client"
              type="text"
              name="client"
              placeholder="e.g. Urban Transport Authority"
              value={form.client}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`form-control ${touched.client ? (errors.client ? 'is-invalid' : 'is-valid') : ''}`}
              required
            />
            {touched.client && errors.client && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.client}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="site-start-date">
              Project Commencement Date <span className="required">*</span>
            </label>
            <input
              id="site-start-date"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`form-control ${touched.startDate ? (errors.startDate ? 'is-invalid' : 'is-valid') : ''}`}
              required
            />
            {touched.startDate && errors.startDate && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.startDate}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="site-end-date">
              Expected Completion Date <span className="required">*</span>
            </label>
            <input
              id="site-end-date"
              type="date"
              name="endDate"
              min={form.startDate || undefined}
              value={form.endDate}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`form-control ${touched.endDate ? (errors.endDate ? 'is-invalid' : 'is-valid') : ''}`}
              required
            />
            {touched.endDate && errors.endDate && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.endDate}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="site-budget">
              Allocated Budget (Rs. LKR) <span className="required">*</span>
            </label>
            <input
              id="site-budget"
              type="number"
              step="100000"
              min="1"
              name="budget"
              placeholder="50000000"
              value={form.budget}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`form-control ${touched.budget ? (errors.budget ? 'is-invalid' : 'is-valid') : ''}`}
              required
            />
            {touched.budget && errors.budget && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.budget}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="site-manager">
              Supervisor / Manager In-Charge <span className="required">*</span>
            </label>
            <input
              id="site-manager"
              type="text"
              name="manager"
              placeholder="Eng. Nihal Samarasinghe"
              value={form.manager}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`form-control ${touched.manager ? (errors.manager ? 'is-invalid' : 'is-valid') : ''}`}
              required
            />
            {touched.manager && errors.manager && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.manager}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="site-desc">Project Details & Structural Scope</label>
          <textarea
            id="site-desc"
            name="description"
            rows="2"
            placeholder="Key civil engineering details, phase milestones, site hazards, or safety guidelines..."
            value={form.description}
            onChange={handleChange}
            disabled={isSubmitting}
            className="form-control"
          />
        </div>

        <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
          <button type="button" className="btn btn-outline" onClick={handleModalClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Registering Project...
              </>
            ) : (
              <>
                <Building2 size={18} />
                Register Site Project
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSiteModal;
