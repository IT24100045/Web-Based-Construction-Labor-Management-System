import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { JOB_ROLES, SKILL_LEVELS } from '../../utils/mockData';
import { Save, AlertCircle } from 'lucide-react';

const EditLaborerForm = ({ laborer, sites, updateLaborer, onClose }) => {
  const [form, setForm] = useState(() => ({
    name: laborer.name || '',
    nic: laborer.nic || '',
    phone: laborer.phone || '',
    email: laborer.email || '',
    address: laborer.address || '',
    emergencyContact: laborer.emergencyContact || '',
    role: laborer.role || 'Master Mason',
    skillLevel: laborer.skillLevel || 'Skilled Craftsman',
    hourlyRate: laborer.hourlyRate ? String(laborer.hourlyRate) : '1400.00',
    status: laborer.status || 'Active',
    assignedSiteId: laborer.assignedSiteId || ''
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value) => {
    let err = '';
    switch (field) {
      case 'name':
        if (!value.trim()) err = 'Full name is required.';
        break;
      case 'nic':
        if (!value.trim()) err = 'NIC / Employee ID is required.';
        break;
      case 'phone':
        if (!value.trim()) err = 'Phone number is required.';
        break;
      case 'hourlyRate':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          err = 'Wage rate must be positive.';
        }
        break;
      case 'emergencyContact':
        if (!value.trim()) err = 'Emergency contact is required.';
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

    const newErrors = {};
    ['name', 'nic', 'phone', 'emergencyContact', 'hourlyRate'].forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) newErrors[f] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateLaborer(laborer.id, form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="edit-name">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="edit-name"
            type="text"
            name="name"
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

        <div className="form-group">
          <label className="form-label" htmlFor="edit-nic">
            NIC / Employee ID <span className="required">*</span>
          </label>
          <input
            id="edit-nic"
            type="text"
            name="nic"
            value={form.nic}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${touched.nic && errors.nic ? 'is-invalid' : ''}`}
            required
          />
          {touched.nic && errors.nic && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.nic}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="edit-phone">
            Contact Phone <span className="required">*</span>
          </label>
          <input
            id="edit-phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
            required
          />
          {touched.phone && errors.phone && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.phone}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-email">Email Address</label>
          <input
            id="edit-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="form-control"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="edit-role">Job Role</label>
          <select
            id="edit-role"
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
          <label className="form-label" htmlFor="edit-skill">Skill Level</label>
          <select
            id="edit-skill"
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
          <label className="form-label" htmlFor="edit-rate">Hourly Wage Rate (Rs. LKR) <span className="required">*</span></label>
          <input
            id="edit-rate"
            type="number"
            step="50.00"
            name="hourlyRate"
            value={form.hourlyRate}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${touched.hourlyRate && errors.hourlyRate ? 'is-invalid' : ''}`}
            required
          />
          {touched.hourlyRate && errors.hourlyRate && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.hourlyRate}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-status">Employment Status</label>
          <select
            id="edit-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="form-control"
          >
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="edit-site">Assigned Site</label>
          <select
            id="edit-site"
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

        <div className="form-group">
          <label className="form-label" htmlFor="edit-emergency">Emergency Contact <span className="required">*</span></label>
          <input
            id="edit-emergency"
            type="text"
            name="emergencyContact"
            value={form.emergencyContact}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${touched.emergencyContact && errors.emergencyContact ? 'is-invalid' : ''}`}
            required
          />
          {touched.emergencyContact && errors.emergencyContact && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.emergencyContact}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-address">Address</label>
        <textarea
          id="edit-address"
          name="address"
          rows="2"
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
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </form>
  );
};

const EditLaborerModal = ({ isOpen, onClose, laborer }) => {
  const { updateLaborer, sites } = useLabor();

  if (!isOpen || !laborer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Laborer Profile — ${laborer.name} (${laborer.id})`}
      maxWidth="680px"
    >
      <EditLaborerForm
        key={laborer.id}
        laborer={laborer}
        sites={sites}
        updateLaborer={updateLaborer}
        onClose={onClose}
      />
    </Modal>
  );
};

export default EditLaborerModal;
