import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { PROJECT_TYPES } from '../../utils/mockData';
import { Building2, AlertCircle } from 'lucide-react';

const AddSiteModal = ({ isOpen, onClose }) => {
  const { addSite, sites } = useLabor();

  const [form, setForm] = useState({
    name: '',
    code: '',
    location: '',
    type: 'Commercial',
    client: '',
    startDate: '2026-09-08',
    endDate: '',
    budget: '50000000',
    manager: 'Eng. Nihal Samarasinghe',
    status: 'Active',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value, allValues = form) => {
    let err = '';
    switch (field) {
      case 'name':
        if (!value.trim()) err = 'Site name is required.';
        else if (value.trim().length < 3) err = 'Site name must be at least 3 characters.';
        break;
      case 'code':
        // Optional: auto-generated if left blank
        break;
      case 'location':
        if (!value.trim()) err = 'Site location / address is required.';
        break;
      case 'client':
        if (!value.trim()) err = 'Client name is required.';
        break;
      case 'startDate':
        if (!value) err = 'Start date is required.';
        break;
      case 'endDate':
        if (!value) {
          err = 'Expected completion date is required.';
        } else if (allValues.startDate && value < allValues.startDate) {
          err = 'Completion date must be after start date.';
        }
        break;
      case 'budget':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          err = 'Estimated budget must be a positive number.';
        }
        break;
      case 'manager':
        if (!value.trim()) err = 'Site supervisor/manager in-charge is required.';
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

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, updatedForm)
      }));
    }

    // Cross-validate end date if start date changes
    if (name === 'startDate' && touched.endDate) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(form).forEach((key) => {
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

    const generatedCode = form.code.trim() || `PRJ-${String(sites.length + 1).padStart(3, '0')}-2026`;
    addSite({ ...form, code: generatedCode });
    setForm({
      name: '',
      code: '',
      location: '',
      type: 'Commercial',
      client: '',
      startDate: '2026-09-08',
      endDate: '',
      budget: '50000000',
      manager: 'Eng. Nihal Samarasinghe',
      status: 'Active',
      description: ''
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Construction Site" maxWidth="680px">
      <form onSubmit={handleSubmit} noValidate>
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
              className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
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
              className={`form-control ${touched.code && errors.code ? 'is-invalid' : ''}`}
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
              className={`form-control ${touched.location && errors.location ? 'is-invalid' : ''}`}
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
              className={`form-control ${touched.client && errors.client ? 'is-invalid' : ''}`}
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
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="site-end-date">
              Expected Completion Date <span className="required">*</span>
            </label>
            <input
              id="site-end-date"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${touched.endDate && errors.endDate ? 'is-invalid' : ''}`}
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
              name="budget"
              placeholder="50000000"
              value={form.budget}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${touched.budget && errors.budget ? 'is-invalid' : ''}`}
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
              className={`form-control ${touched.manager && errors.manager ? 'is-invalid' : ''}`}
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
            className="form-control"
          />
        </div>

        <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Building2 size={18} />
            Register Site Project
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSiteModal;
