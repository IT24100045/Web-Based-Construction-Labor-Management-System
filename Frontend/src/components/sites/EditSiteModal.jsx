import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { PROJECT_TYPES } from '../../utils/mockData';
import { Save, AlertCircle, Loader2 } from 'lucide-react';

const EditSiteForm = ({ site, updateSite, onClose, sites }) => {
  const [form, setForm] = useState(() => ({
    name: site.name || '',
    code: site.code || '',
    location: site.location || '',
    type: site.type || 'Commercial',
    client: site.client || '',
    startDate: site.startDate || '',
    endDate: site.endDate || '',
    budget: site.budget ? String(site.budget) : '',
    manager: site.manager || '',
    status: site.status || 'Active',
    description: site.description || ''
  }));

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
        } else if (
          sites.some(
            (s) => s.id !== site.id && s.name?.trim().toLowerCase() === trimmed.toLowerCase()
          )
        ) {
          err = 'Another site with this name already exists.';
        }
        break;
      case 'location':
        if (!trimmed) {
          err = 'Site location is required.';
        } else if (trimmed.length < 3) {
          err = 'Location must be at least 3 characters.';
        }
        break;
      case 'client':
        if (!trimmed) {
          err = 'Client / contracting entity is required.';
        } else if (trimmed.length < 2) {
          err = 'Client name must be at least 2 characters.';
        }
        break;
      case 'startDate':
        if (!value) {
          err = 'Commencement date is required.';
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
          err = 'Supervisor / Manager in-charge is required.';
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

    const errs = {};
    ['name', 'location', 'client', 'startDate', 'endDate', 'budget', 'manager'].forEach((f) => {
      const err = validateField(f, form[f], form);
      if (err) errs[f] = err;
    });

    setTouched({
      name: true,
      location: true,
      client: true,
      startDate: true,
      endDate: true,
      budget: true,
      manager: true
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      await updateSite(site.id, {
        ...form,
        name: form.name.trim(),
        location: form.location.trim(),
        client: form.client.trim(),
        manager: form.manager.trim(),
        budget: parseFloat(form.budget),
        description: form.description.trim()
      });
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to update site project. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          <label className="form-label" htmlFor="edit-site-name">
            Construction Site Name <span className="required">*</span>
          </label>
          <input
            id="edit-site-name"
            type="text"
            name="name"
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
          <label className="form-label" htmlFor="edit-site-code">Project Code</label>
          <input
            id="edit-site-code"
            type="text"
            name="code"
            value={form.code}
            className="form-control"
            disabled
            title="Project code cannot be changed"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-site-status">Site Status</label>
          <select
            id="edit-site-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={isSubmitting}
            className="form-control"
          >
            <option value="Active">Active (Under Construction)</option>
            <option value="Planning">Planning / Mobilization</option>
            <option value="On Hold">On Hold / Suspended</option>
            <option value="Completed">Completed / Handed Over</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="edit-site-loc">
            Site Location <span className="required">*</span>
          </label>
          <input
            id="edit-site-loc"
            type="text"
            name="location"
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
          <label className="form-label" htmlFor="edit-site-client">
            Client <span className="required">*</span>
          </label>
          <input
            id="edit-site-client"
            type="text"
            name="client"
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
          <label className="form-label" htmlFor="edit-site-start">
            Commencement Date <span className="required">*</span>
          </label>
          <input
            id="edit-site-start"
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
          <label className="form-label" htmlFor="edit-site-end">
            Completion Date <span className="required">*</span>
          </label>
          <input
            id="edit-site-end"
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
          <label className="form-label" htmlFor="edit-site-budget">
            Budget (Rs. LKR) <span className="required">*</span>
          </label>
          <input
            id="edit-site-budget"
            type="number"
            step="100000"
            min="1"
            name="budget"
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
          <label className="form-label" htmlFor="edit-site-mgr">
            Supervisor In-Charge <span className="required">*</span>
          </label>
          <input
            id="edit-site-mgr"
            type="text"
            name="manager"
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
        <label className="form-label" htmlFor="edit-site-desc">Project Details</label>
        <textarea
          id="edit-site-desc"
          name="description"
          rows="2"
          value={form.description}
          onChange={handleChange}
          disabled={isSubmitting}
          className="form-control"
        />
      </div>

      <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Saving Changes...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const EditSiteModal = ({ isOpen, onClose, site }) => {
  const { updateSite, sites } = useLabor();

  if (!isOpen || !site) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Construction Site — ${site.name}`}
      maxWidth="680px"
    >
      <EditSiteForm
        key={site.id}
        site={site}
        updateSite={updateSite}
        onClose={onClose}
        sites={sites}
      />
    </Modal>
  );
};

export default EditSiteModal;
