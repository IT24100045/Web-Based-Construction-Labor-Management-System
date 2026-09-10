import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { JOB_ROLES, SKILL_LEVELS } from '../../utils/mockData';
import {
  validateLaborerField,
  validateLaborerForm,
  identifyNicFormat,
  MIN_HOURLY_RATE,
  MAX_HOURLY_RATE
} from '../../utils/laborValidation';
import { UserCheck, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

const AddLaborerModal = ({ isOpen, onClose }) => {
  const { addLaborer, sites, laborers } = useLabor();

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const nicMeta = identifyNicFormat(form.nic);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto format NIC to uppercase
    const formattedValue = name === 'nic' ? value.toUpperCase().trim() : value;

    setForm((prev) => ({ ...prev, [name]: formattedValue }));
    if (submitError) setSubmitError(null);

    if (touched[name]) {
      const error = validateLaborerField(name, formattedValue, { existingLaborers: laborers });
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === 'nic' ? value.toUpperCase().trim() : value;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateLaborerField(name, formattedValue, { existingLaborers: laborers });
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate entire form against existing laborers list
    const { isValid, errors: validationErrors } = validateLaborerForm(form, { existingLaborers: laborers });

    setTouched({
      name: true,
      nic: true,
      phone: true,
      email: true,
      address: true,
      emergencyContact: true,
      hourlyRate: true,
      role: true,
      skillLevel: true
    });

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await addLaborer({
        ...form,
        name: form.name.trim(),
        nic: form.nic.trim().toUpperCase(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        emergencyContact: form.emergencyContact.trim(),
        hourlyRate: parseFloat(form.hourlyRate) || 1200
      });

      setForm(initialForm);
      setErrors({});
      setTouched({});
      setSubmitError(null);
      onClose();
    } catch (err) {
      console.error('Failed to register laborer:', err);
      setSubmitError(err.message || 'Failed to register laborer. Please review the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setErrors({});
    setTouched({});
    setSubmitError(null);
    onClose();
  };

  const getValidationClass = (field) => {
    if (!touched[field]) return '';
    return errors[field] ? 'is-invalid' : 'is-valid';
  };

  const otRate = (parseFloat(form.hourlyRate || 0) * 1.5).toFixed(2);

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Register New Laborer Profile" maxWidth="680px">
      <form onSubmit={handleSubmit} noValidate>
        {/* Compliance Notice */}
        <div style={{ marginBottom: '16px', background: 'rgba(245, 158, 11, 0.08)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.84rem', color: 'var(--amber-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} style={{ flexShrink: 0 }} />
          <span>Please verify the laborer's National Identity Card (NIC) and emergency contact for occupational site compliance.</span>
        </div>

        {/* Server / Form Submit Error Notice */}
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
              <label className="form-label" htmlFor="laborer-name">
                Full Name <span className="required">*</span>
              </label>
              {touched.name && !errors.name && form.name.trim() && (
                <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle2 size={12} /> Valid Name
                </span>
              )}
            </div>
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
              maxLength={70}
            />
            {touched.name && errors.name && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.name}</span>
            )}
            {!touched.name && <span className="form-hint">Legal name as stated on identification document</span>}
          </div>

          {/* NIC / Employee ID */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="laborer-nic">
                NIC / Employee ID <span className="required">*</span>
              </label>
              {nicMeta && nicMeta.valid && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontWeight: 600
                  }}
                >
                  {nicMeta.label}
                </span>
              )}
            </div>
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
              maxLength={15}
            />
            {touched.nic && errors.nic ? (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.nic}</span>
            ) : (
              <span className="form-hint">Accepted: 12-digit Smart NIC, 9-digit+V/X, or EMP-XXX</span>
            )}
          </div>
        </div>

        <div className="form-row">
          {/* Contact Phone */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="laborer-phone">
                Contact Phone <span className="required">*</span>
              </label>
              {touched.phone && !errors.phone && form.phone.trim() && (
                <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle2 size={12} /> Valid Phone
                </span>
              )}
            </div>
            <input
              id="laborer-phone"
              type="tel"
              name="phone"
              placeholder="e.g. +94 77 123 4567 or 0771234567"
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

          {/* Skill Tier */}
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
          {/* Hourly Wage Rate */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="laborer-rate">
                Hourly Wage Rate (Rs. LKR) <span className="required">*</span>
              </label>
              {parseFloat(form.hourlyRate) >= MIN_HOURLY_RATE && (
                <span style={{ fontSize: '0.72rem', color: 'var(--amber-primary)', fontWeight: 600 }}>
                  OT (1.5&times;): Rs. {otRate}/hr
                </span>
              )}
            </div>
            <input
              id="laborer-rate"
              type="number"
              step="25.00"
              min={MIN_HOURLY_RATE}
              max={MAX_HOURLY_RATE}
              name="hourlyRate"
              placeholder="1400.00"
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

          {/* Site Allocation */}
          <div className="form-group">
            <label className="form-label" htmlFor="laborer-site">
              Assign to Construction Site
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
            <span className="form-hint">Can be assigned or transferred at any time</span>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="laborer-emergency">
              Emergency Contact & Relation <span className="required">*</span>
            </label>
            {touched.emergencyContact && !errors.emergencyContact && form.emergencyContact.trim() && (
              <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} /> Valid Contact
              </span>
            )}
          </div>
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
            maxLength={120}
          />
          {touched.emergencyContact && errors.emergencyContact ? (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.emergencyContact}</span>
          ) : (
            <span className="form-hint">Provide full name, relation, and verified contact phone number</span>
          )}
        </div>

        {/* Residential Address */}
        <div className="form-group">
          <label className="form-label" htmlFor="laborer-address">
            Residential Address <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional)</span>
          </label>
          <textarea
            id="laborer-address"
            name="address"
            rows="2"
            placeholder="Permanent or temporary residence address"
            value={form.address}
            onChange={handleChange}
            className="form-control"
            maxLength={255}
          />
        </div>

        <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
          <button type="button" className="btn btn-outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <UserCheck size={18} />
            <span>{isSubmitting ? 'Registering Laborer...' : 'Register Laborer'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLaborerModal;
