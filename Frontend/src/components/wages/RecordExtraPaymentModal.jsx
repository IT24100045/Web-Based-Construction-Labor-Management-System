import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { useAuth, SYSTEM_ROLES } from '../../context/AuthContext';
import { usersApi } from '../../services/api';
import { EXTRA_PAYMENT_CATEGORIES } from '../../utils/constants';
import { Gift, AlertCircle, Loader2 } from 'lucide-react';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const RecordExtraPaymentForm = ({
  laborer,
  onClose,
  onSuccessPayment
}) => {
  const todayStr = getTodayDateString();
  const { laborers, sites, recordExtraPayment } = useLabor();
  const { usersList, systemRoles } = useAuth();

  const [form, setForm] = useState(() => ({
    laborerId: laborer?.id || (laborers.length > 0 ? laborers[0].id : ''),
    category: 'Bonus / Performance Incentive',
    amount: '',
    date: todayStr,
    method: 'Bank Transfer',
    reference: `EXT-${Date.now().toString().slice(-6)}`,
    approvedBy: '',
    notes: ''
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [supervisors, setSupervisors] = useState([]);
  const [isLoadingSupervisors, setIsLoadingSupervisors] = useState(false);

  // Load site supervisors for authorization dropdown
  useEffect(() => {
    let isMounted = true;
    const loadSupervisors = async () => {
      setIsLoadingSupervisors(true);
      try {
        const users = await usersApi.getAll();
        if (isMounted && Array.isArray(users)) {
          const supervisorUsers = users.filter((u) =>
            u.role?.toLowerCase() === 'site_supervisor' && u.status?.toLowerCase() !== 'inactive'
          );
          if (supervisorUsers.length > 0) {
            setSupervisors(supervisorUsers);
            setForm((prev) => (!prev.approvedBy ? { ...prev, approvedBy: supervisorUsers[0].name } : prev));
            setIsLoadingSupervisors(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not load supervisors from API:', err);
      }

      if (isMounted) {
        const authSupUsers = (usersList || []).filter((u) =>
          u.role?.toLowerCase() === 'site_supervisor' && u.status?.toLowerCase() !== 'inactive'
        );
        if (authSupUsers.length > 0) {
          setSupervisors(authSupUsers);
          setForm((prev) => (!prev.approvedBy ? { ...prev, approvedBy: authSupUsers[0].name } : prev));
        } else {
          const defaultSup = (systemRoles || SYSTEM_ROLES || []).find((r) =>
            r.key === 'site_supervisor' || r.id === 'site_supervisor'
          );
          const defaultList = [
            {
              id: defaultSup?.id || 'default-supervisor',
              name: defaultSup?.name || 'Eng. N. Samarasinghe',
              title: defaultSup?.title || 'Chief Site Supervisor'
            }
          ];
          setSupervisors(defaultList);
          setForm((prev) => (!prev.approvedBy ? { ...prev, approvedBy: defaultList[0].name } : prev));
        }
        setIsLoadingSupervisors(false);
      }
    };

    loadSupervisors();

    return () => {
      isMounted = false;
    };
  }, [usersList, systemRoles]);

  const selectedLaborer = laborers.find((l) => l.id === form.laborerId);
  const assignedSite = sites.find((s) => s.id === selectedLaborer?.assignedSiteId);

  const validateField = (field, value) => {
    let err = '';
    const trimmed = (value || '').trim();

    switch (field) {
      case 'laborerId':
        if (!trimmed) {
          err = 'Please select a beneficiary laborer.';
        }
        break;
      case 'category':
        if (!trimmed) {
          err = 'Please select an extra payment category.';
        }
        break;
      case 'amount':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          err = 'Extra payment amount must be greater than Rs. 0.00.';
        } else if (parseFloat(value) > 5000000) {
          err = 'Amount exceeds maximum single disbursement threshold (Rs. 5,000,000).';
        }
        break;
      case 'date':
        if (!value) {
          err = 'Disbursement date is required.';
        } else if (value > todayStr) {
          err = 'Disbursement date cannot be scheduled in the future.';
        }
        break;
      case 'reference':
        if (!trimmed) {
          err = 'Transaction reference or voucher ID is required.';
        } else if (trimmed.length < 3) {
          err = 'Reference must be at least 3 characters.';
        }
        break;
      case 'approvedBy':
        if (!trimmed) {
          err = 'Please select an authorizing site supervisor.';
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
    if (serverError) setServerError('');

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    ['laborerId', 'category', 'amount', 'date', 'reference', 'approvedBy'].forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) newErrors[f] = err;
    });

    setTouched({
      laborerId: true,
      category: true,
      amount: true,
      date: true,
      reference: true,
      approvedBy: true
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const saved = await recordExtraPayment({
        laborerId: form.laborerId,
        amount: parseFloat(form.amount),
        date: form.date,
        method: form.method,
        reference: form.reference.trim(),
        approvedBy: form.approvedBy.trim(),
        notes: form.notes.trim(),
        extraCategory: form.category
      });

      if (onSuccessPayment) {
        onSuccessPayment(saved, { laborer: selectedLaborer, assignedSite });
      }

      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to record extra payment.');
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

      {/* Selected Laborer Information Banner */}
      <div
        style={{
          marginBottom: '18px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px'
        }}
      >
        <div className="form-group" style={{ marginBottom: selectedLaborer ? '10px' : '0' }}>
          <label className="form-label" htmlFor="extra-laborer-select" style={{ color: '#fef3c7' }}>
            Beneficiary Laborer <span className="required">*</span>
          </label>
          <select
            id="extra-laborer-select"
            name="laborerId"
            value={form.laborerId}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            className={`form-control ${touched.laborerId ? (errors.laborerId ? 'is-invalid' : 'is-valid') : ''}`}
            required
          >
            <option value="">-- Select Laborer --</option>
            {laborers.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.id} - {lab.name} ({lab.role})
              </option>
            ))}
          </select>
          {touched.laborerId && errors.laborerId && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.laborerId}</span>
          )}
        </div>

        {selectedLaborer && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Site: </span>
              <strong style={{ color: '#fff' }}>{assignedSite ? assignedSite.name : 'Central Pool / Unassigned'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Trade / Skill: </span>
              <strong style={{ color: 'var(--amber-primary)' }}>{selectedLaborer.role} ({selectedLaborer.skillLevel || 'Skilled'})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Daily Base Rate: </span>
              <strong style={{ color: 'var(--emerald)' }}>Rs. {((parseFloat(selectedLaborer.hourlyRate) || 1200) * 8).toLocaleString()} / day</strong>
            </div>
          </div>
        )}
      </div>

      {/* Category and Amount */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="extra-category">
            Extra Payment Category <span className="required">*</span>
          </label>
          <select
            id="extra-category"
            name="category"
            value={form.category}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            className={`form-control ${touched.category ? (errors.category ? 'is-invalid' : 'is-valid') : ''}`}
            required
          >
            {EXTRA_PAYMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {touched.category && errors.category && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.category}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="extra-amount">
            Payment Amount (Rs. LKR) <span className="required">*</span>
          </label>
          <input
            id="extra-amount"
            type="number"
            step="100"
            min="1"
            name="amount"
            placeholder="e.g. 5000.00"
            value={form.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            className={`form-control ${touched.amount ? (errors.amount ? 'is-invalid' : 'is-valid') : ''}`}
            required
          />
          {touched.amount && errors.amount && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.amount}</span>
          )}
        </div>
      </div>

      {/* Date and Method */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="extra-date">
            Disbursement Date <span className="required">*</span>
          </label>
          <input
            id="extra-date"
            type="date"
            name="date"
            max={todayStr}
            value={form.date}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            className={`form-control ${touched.date ? (errors.date ? 'is-invalid' : 'is-valid') : ''}`}
            required
          />
          {touched.date && errors.date && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.date}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="extra-method">Disbursement Method</label>
          <select
            id="extra-method"
            name="method"
            value={form.method}
            onChange={handleChange}
            disabled={isSubmitting}
            className="form-control"
          >
            <option value="Bank Transfer">Bank Wire Transfer</option>
            <option value="Cash">Cash Payout (On-Site Voucher)</option>
            <option value="Cheque">Corporate Account Payee Cheque</option>
          </select>
        </div>
      </div>

      {/* Reference and Authorized Supervisor */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="extra-ref">
            Transaction / Cheque Reference <span className="required">*</span>
          </label>
          <input
            id="extra-ref"
            type="text"
            name="reference"
            placeholder="e.g. EXT-TXN-984321"
            value={form.reference}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            className={`form-control ${touched.reference ? (errors.reference ? 'is-invalid' : 'is-valid') : ''}`}
            required
          />
          {touched.reference && errors.reference && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.reference}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="extra-approved">
            Authorized By (Site Supervisor) <span className="required">*</span>
          </label>
          <select
            id="extra-approved"
            name="approvedBy"
            value={form.approvedBy}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting || isLoadingSupervisors}
            className={`form-control ${touched.approvedBy ? (errors.approvedBy ? 'is-invalid' : 'is-valid') : ''}`}
            required
          >
            <option value="">
              {isLoadingSupervisors ? 'Loading supervisors...' : '-- Select Site Supervisor --'}
            </option>
            {supervisors.map((sup) => (
              <option key={sup.id || sup.name} value={sup.name}>
                {sup.name} {sup.title ? `(${sup.title})` : ''}
              </option>
            ))}
            {form.approvedBy && !supervisors.some((s) => s.name === form.approvedBy) && (
              <option value={form.approvedBy}>{form.approvedBy}</option>
            )}
          </select>
          {touched.approvedBy && errors.approvedBy && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.approvedBy}</span>
          )}
        </div>
      </div>

      {/* Purpose / Remarks */}
      <div className="form-group">
        <label className="form-label" htmlFor="extra-notes">Purpose & Compensation Remarks</label>
        <textarea
          id="extra-notes"
          name="notes"
          rows="2"
          value={form.notes}
          onChange={handleChange}
          disabled={isSubmitting}
          className="form-control"
          placeholder="e.g. Night foundation concrete pour bonus approved by Chief Site Supervisor"
        />
      </div>

      <div className="modal-footer" style={{ margin: '16px -24px -24px -24px' }}>
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn"
          disabled={isSubmitting}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Recording Extra Payment...
            </>
          ) : (
            <>
              <Gift size={18} />
              Finalize Extra Payment
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const RecordExtraPaymentModal = ({ isOpen, onClose, laborer, onSuccessPayment }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Extra Labor Payment (Bonus / Allowance / Advance)"
      maxWidth="680px"
    >
      <RecordExtraPaymentForm
        laborer={laborer}
        onClose={onClose}
        onSuccessPayment={onSuccessPayment}
      />
    </Modal>
  );
};

export default RecordExtraPaymentModal;
