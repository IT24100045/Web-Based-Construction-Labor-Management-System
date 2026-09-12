import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { JOB_ROLES, SKILL_LEVELS } from '../../utils/mockData';
import {
  validateLaborerField,
  validateLaborerForm,
  MIN_HOURLY_RATE,
  MAX_HOURLY_RATE
} from '../../utils/laborValidation';
import { Save, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

const EditLaborerForm = ({ laborer, sites, existingLaborers, updateLaborer, onClose }) => {
  const [form, setForm] = useState(() => ({
    name: laborer.name || '',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validationContext = {
    existingLaborers,
    currentLaborerId: laborer.id
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError(null);

    if (touched[name]) {
      const error = validateLaborerField(name, value, validationContext);
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateLaborerField(name, value, validationContext);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const { isValid, errors: validationErrors } = validateLaborerForm(form, validationContext);

    setTouched({
      name: true,
      phone: true,
      email: true,
      address: true,
      emergencyContact: true,
      hourlyRate: true,
      role: true,
      skillLevel: true,
      status: true
    });

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateLaborer(laborer.id, {
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        emergencyContact: form.emergencyContact.trim(),
        hourlyRate: parseFloat(form.hourlyRate) || 1200
      });

      onClose();
    } catch (err) {
      console.error('Failed to update laborer profile:', err);
      setSubmitError(err.message || 'Failed to update laborer profile. Please review fields and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getValidationClass = (field) => {
    if (!touched[field]) return '';
    return errors[field] ? 'is-invalid' : 'is-valid';
  };

  const otRate = (parseFloat(form.hourlyRate || 0) * 1.5).toFixed(2);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Top Banner with Laborer ID & Status context */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="var(--amber-primary)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Record ID: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{laborer.id}</strong>
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Joined: {laborer.joinDate || 'N/A'}
        </span>
      </div>

      {/* Submit Error Notice */}
      {submitError && (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{submitError}</span>
        </div>
      )}

      <div className="form-row">
        {/* Full Name */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="edit-name">
              Full Name <span className="required">*</span>
            </label>
            {touched.name && !errors.name && form.name.trim() && (
              <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} /> Valid Name
              </span>
            )}
          </div>
          <input
            id="edit-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${getValidationClass('name')}`}
            required
            maxLength={70}
          />
          {touched.name && errors.name && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.name}</span>
          )}
        </div>

        {/* Employee ID (Read-only) */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-empid">
            Employee ID
          </label>
          <input
            id="edit-empid"
            type="text"
            value={laborer.id}
            readOnly
            disabled
            className="form-control"
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--amber-light)',
              background: 'rgba(245, 158, 11, 0.08)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
              cursor: 'not-allowed'
            }}
          />
          <span className="form-hint">Unique system-assigned identifier (immutable)</span>
        </div>
      </div>

      <div className="form-row">
        {/* Contact Phone */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="edit-phone">
              Contact Phone <span className="required">*</span>
            </label>
            {touched.phone && !errors.phone && form.phone.trim() && (
              <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} /> Valid Phone
              </span>
            )}
          </div>
          <input
            id="edit-phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${getValidationClass('phone')}`}
            required
            maxLength={16}
          />
          {touched.phone && errors.phone ? (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.phone}</span>
          ) : (
            <span className="form-hint">Must contain 9 to 12 digits (e.g. 077 123 4567 or +94 77 123 4567)</span>
          )}
        </div>

        {/* Email Address */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-email">
            Email Address <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional)</span>
          </label>
          <input
            id="edit-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${getValidationClass('email')}`}
            maxLength={100}
          />
          {touched.email && errors.email && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.email}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        {/* Job Role */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-role">
            Job Role / Trade <span className="required">*</span>
          </label>
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

        {/* Skill Tier */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-skill">
            Skill & Certification Level <span className="required">*</span>
          </label>
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
        {/* Hourly Wage Rate */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="edit-rate">
              Hourly Wage Rate (Rs. LKR) <span className="required">*</span>
            </label>
            {parseFloat(form.hourlyRate) >= MIN_HOURLY_RATE && (
              <span style={{ fontSize: '0.72rem', color: 'var(--amber-primary)', fontWeight: 600 }}>
                OT (1.5&times;): Rs. {otRate}/hr
              </span>
            )}
          </div>
          <input
            id="edit-rate"
            type="number"
            step="25.00"
            min={MIN_HOURLY_RATE}
            max={MAX_HOURLY_RATE}
            name="hourlyRate"
            value={form.hourlyRate}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${getValidationClass('hourlyRate')}`}
            required
          />
          {touched.hourlyRate && errors.hourlyRate ? (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.hourlyRate}</span>
          ) : (
            <span className="form-hint">Standard rate: Rs. {MIN_HOURLY_RATE} - Rs. {MAX_HOURLY_RATE} / hour</span>
          )}
        </div>

        {/* Employment Status */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-status">
            Employment Status <span className="required">*</span>
          </label>
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
          <span className="form-hint">Controls availability for daily roll call and assignments</span>
        </div>
      </div>

      <div className="form-row">
        {/* Site Allocation */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-site">Assigned Construction Site</label>
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

        {/* Emergency Contact */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="edit-emergency">
              Emergency Contact & Relation <span className="required">*</span>
            </label>
            {touched.emergencyContact && !errors.emergencyContact && form.emergencyContact.trim() && (
              <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} /> Valid Contact
              </span>
            )}
          </div>
          <input
            id="edit-emergency"
            type="text"
            name="emergencyContact"
            value={form.emergencyContact}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${getValidationClass('emergencyContact')}`}
            required
            maxLength={120}
          />
          {touched.emergencyContact && errors.emergencyContact ? (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.emergencyContact}</span>
          ) : (
            <span className="form-hint">Provide full name, relation, and verified contact phone number</span>
          )}
        </div>
      </div>

      {/* Residential Address */}
      <div className="form-group">
        <label className="form-label" htmlFor="edit-address">
          Residential Address <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional)</span>
        </label>
        <textarea
          id="edit-address"
          name="address"
          rows="2"
          value={form.address}
          onChange={handleChange}
          className="form-control"
          maxLength={255}
        />
      </div>

      <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={18} />
          <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
};

const EditLaborerModal = ({ isOpen, onClose, laborer }) => {
  const { updateLaborer, sites, laborers } = useLabor();

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
        existingLaborers={laborers}
        updateLaborer={updateLaborer}
        onClose={onClose}
      />
    </Modal>
  );
};

export default EditLaborerModal;
