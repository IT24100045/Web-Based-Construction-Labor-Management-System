import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { JOB_ROLES, SKILL_LEVELS } from '../../utils/mockData';
import { UserCheck, AlertCircle } from 'lucide-react';

const AddLaborerModal = ({ isOpen, onClose }) => {
  const { addLaborer, sites } = useLabor();

  const initialForm = {
    name: '',
    nic: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    role: 'Master Mason',
    skillLevel: 'Skilled Craftsman',
    hourlyRate: '1400.00',
    assignedSiteId: sites[0]?.id || ''
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value) => {
    let err = '';
    switch (field) {
      case 'name':
        if (!value.trim()) {
          err = 'Full name is required.';
        } else if (value.trim().length < 3) {
          err = 'Name must be at least 3 characters.';
        }
        break;
      case 'nic':
        if (!value.trim()) {
          err = 'NIC or Employee ID is required.';
        } else if (!/^[0-9]{9}[vVxX]?$|^[0-9]{12}$|^EMP-[0-9]{3,6}$/i.test(value.trim())) {
          err = 'Invalid format. Use 9 digits + V/X, 12 digits, or EMP-XXX.';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          err = 'Contact phone number is required.';
        } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(value.trim())) {
          err = 'Enter a valid telephone number (7-15 digits).';
        }
        break;
      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          err = 'Please enter a valid email address.';
        }
        break;
      case 'hourlyRate':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          err = 'Wage rate must be a valid positive number.';
        }
        break;
      case 'emergencyContact':
        if (!value.trim()) {
          err = 'Emergency contact is required for construction site safety compliance.';
        }
        break;
      default:
        break;
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });

    setTouched({
      name: true,
      nic: true,
      phone: true,
      email: true,
      address: true,
      emergencyContact: true,
      hourlyRate: true
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addLaborer(form);
    setForm(initialForm);
    setErrors({});
    setTouched({});
    onClose();
  };

  const getValidationClass = (field) => {
    if (!touched[field]) return '';
    return errors[field] ? 'is-invalid' : 'is-valid';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Laborer Profile" maxWidth="680px">
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '16px', background: 'rgba(245, 158, 11, 0.08)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.84rem', color: 'var(--amber-light)' }}>
          Please verify the laborer's National Identity Card (NIC) and safety emergency contact before site assignment.
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="laborer-name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="laborer-name"
              type="text"
              name="name"
              placeholder="e.g. Kusal Mendis"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${getValidationClass('name')}`}
              required
            />
            {touched.name && errors.name && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="laborer-nic">
              NIC / Employee ID <span className="required">*</span>
            </label>
            <input
              id="laborer-nic"
              type="text"
              name="nic"
              placeholder="e.g. 199245678901 or 924567890V"
              value={form.nic}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${getValidationClass('nic')}`}
              required
            />
            {touched.nic && errors.nic && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.nic}</span>
            )}
            {!errors.nic && <span className="form-hint">Accepted: 12-digit NIC, 9-digit+V, or EMP-XXX</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="laborer-phone">
              Contact Phone <span className="required">*</span>
            </label>
            <input
              id="laborer-phone"
              type="tel"
              name="phone"
              placeholder="+94 77 123 4567"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${getValidationClass('phone')}`}
              required
            />
            {touched.phone && errors.phone && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="laborer-email">
              Email Address <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional)</span>
            </label>
            <input
              id="laborer-email"
              type="email"
              name="email"
              placeholder="worker@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${getValidationClass('email')}`}
            />
            {touched.email && errors.email && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.email}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="laborer-role">
              Job Role / Trade <span className="required">*</span>
            </label>
            <select
              id="laborer-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="form-control"
            >
              {JOB_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="laborer-skill">
              Skill & Certification Level <span className="required">*</span>
            </label>
            <select
              id="laborer-skill"
              name="skillLevel"
              value={form.skillLevel}
              onChange={handleChange}
              className="form-control"
            >
              {SKILL_LEVELS.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="laborer-rate">
              Hourly Wage Rate (Rs. LKR) <span className="required">*</span>
            </label>
            <input
              id="laborer-rate"
              type="number"
              step="50.00"
              min="100.00"
              name="hourlyRate"
              placeholder="1400.00"
              value={form.hourlyRate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${getValidationClass('hourlyRate')}`}
              required
            />
            {touched.hourlyRate && errors.hourlyRate && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.hourlyRate}</span>
            )}
            <span className="form-hint">Standard OT multiplier is 1.5x regular rate (Rs. ${(parseFloat(form.hourlyRate || 0) * 1.5).toFixed(2)}/hr)</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="laborer-site">
              Assign to Site / Project
            </label>
            <select
              id="laborer-site"
              name="assignedSiteId"
              value={form.assignedSiteId}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">-- Unassigned (Available Pool) --</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="laborer-emergency">
            Emergency Contact Details <span className="required">*</span>
          </label>
          <input
            id="laborer-emergency"
            type="text"
            name="emergencyContact"
            placeholder="e.g. +94 70 777 6666 (S. Mendis - Brother)"
            value={form.emergencyContact}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${getValidationClass('emergencyContact')}`}
            required
          />
          {touched.emergencyContact && errors.emergencyContact && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.emergencyContact}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="laborer-address">
            Residential Address
          </label>
          <textarea
            id="laborer-address"
            name="address"
            rows="2"
            placeholder="Permanent or temporary residential address"
            value={form.address}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <UserCheck size={18} />
            Register Laborer
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLaborerModal;
