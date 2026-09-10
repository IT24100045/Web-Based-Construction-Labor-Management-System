import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { DollarSign, AlertCircle, Info, Loader2 } from 'lucide-react';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const RecordPaymentForm = ({
  selectedLaborerId,
  currentLaborerWage,
  onClose,
  recordPayment,
  onSuccessPayment
}) => {
  const todayStr = getTodayDateString();

  const [form, setForm] = useState(() => ({
    amount: currentLaborerWage && currentLaborerWage.balanceDue > 0 ? currentLaborerWage.balanceDue.toFixed(2) : '0.00',
    date: todayStr,
    method: 'Bank Transfer',
    reference: `TXN-${Date.now().toString().slice(-6)}`,
    approvedBy: 'Eng. Nihal Samarasinghe (Chief Supervisor)',
    notes: 'Bi-weekly payroll settlement'
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateField = (field, value) => {
    let err = '';
    const trimmed = (value || '').trim();

    switch (field) {
      case 'amount':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          err = 'Payment amount must be greater than Rs. 0.00.';
        } else if (parseFloat(value) > 10000000) {
          err = 'Payment amount exceeds maximum transaction threshold (Rs. 10,000,000).';
        }
        break;
      case 'date':
        if (!value) {
          err = 'Payment disbursement date is required.';
        } else if (value > todayStr) {
          err = 'Disbursement date cannot be scheduled in the future.';
        }
        break;
      case 'reference':
        if (!trimmed) {
          err = 'Transaction reference or receipt voucher ID is required.';
        } else if (trimmed.length < 3) {
          err = 'Reference must be at least 3 characters.';
        }
        break;
      case 'approvedBy':
        if (!trimmed) {
          err = 'Authorizing official or finance officer name is required.';
        } else if (trimmed.length < 3) {
          err = 'Authorizer name must be at least 3 characters.';
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

  const handleSetFullBalance = () => {
    if (currentLaborerWage) {
      const fullBal = currentLaborerWage.balanceDue.toFixed(2);
      setForm((prev) => ({
        ...prev,
        amount: fullBal
      }));
      if (touched.amount) {
        setErrors((prev) => ({ ...prev, amount: validateField('amount', fullBal) }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    ['amount', 'date', 'reference', 'approvedBy'].forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) newErrors[f] = err;
    });

    setTouched({ amount: true, date: true, reference: true, approvedBy: true });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const savedPayment = await recordPayment({
        laborerId: selectedLaborerId,
        amount: parseFloat(form.amount),
        date: form.date,
        method: form.method,
        reference: form.reference.trim(),
        approvedBy: form.approvedBy.trim(),
        notes: form.notes.trim()
      });

      onClose();
      if (onSuccessPayment) {
        onSuccessPayment(savedPayment, currentLaborerWage);
      }
    } catch (err) {
      setServerError(err.message || 'Failed to record payment. Please check server logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const numAmount = parseFloat(form.amount) || 0;
  const isOverBalance = currentLaborerWage && currentLaborerWage.balanceDue > 0 && numAmount > currentLaborerWage.balanceDue;

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
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="form-label" htmlFor="pay-amount" style={{ margin: 0 }}>
              Payment Amount (Rs. LKR) <span className="required">*</span>
            </label>
            {currentLaborerWage && currentLaborerWage.balanceDue > 0 && (
              <button
                type="button"
                onClick={handleSetFullBalance}
                disabled={isSubmitting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--amber-primary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Pay Full Balance (Rs. {currentLaborerWage.balanceDue.toFixed(2)})
              </button>
            )}
          </div>
          <input
            id="pay-amount"
            type="number"
            step="1.00"
            min="1.00"
            name="amount"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            className={`form-control ${touched.amount ? (errors.amount ? 'is-invalid' : 'is-valid') : ''}`}
            required
          />
          {touched.amount && errors.amount ? (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.amount}</span>
          ) : isOverBalance ? (
            <span style={{ fontSize: '0.74rem', color: 'var(--amber-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Info size={12} /> Note: Payment exceeds current outstanding due of Rs. {currentLaborerWage.balanceDue.toFixed(2)} (Advance).
            </span>
          ) : null}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="pay-date">
            Disbursement Date <span className="required">*</span>
          </label>
          <input
            id="pay-date"
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
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="pay-method">Payment Method</label>
          <select
            id="pay-method"
            name="method"
            value={form.method}
            onChange={handleChange}
            disabled={isSubmitting}
            className="form-control"
          >
            <option value="Bank Transfer">Bank Wire Transfer</option>
            <option value="Cash">Cash Payroll Disbursement</option>
            <option value="Cheque">Bank Cheque</option>
            <option value="Digital Wallet">Mobile / Digital Wallet</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="pay-ref">
            Transaction / Cheque Ref <span className="required">*</span>
          </label>
          <input
            id="pay-ref"
            type="text"
            name="reference"
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
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pay-approved">
          Authorized By (Supervisor / Finance) <span className="required">*</span>
        </label>
        <input
          id="pay-approved"
          type="text"
          name="approvedBy"
          value={form.approvedBy}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          className={`form-control ${touched.approvedBy ? (errors.approvedBy ? 'is-invalid' : 'is-valid') : ''}`}
          required
        />
        {touched.approvedBy && errors.approvedBy && (
          <span className="form-error-msg"><AlertCircle size={13} /> {errors.approvedBy}</span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pay-notes">Payment Remarks / Cycle Notes</label>
        <textarea
          id="pay-notes"
          name="notes"
          rows="2"
          value={form.notes}
          onChange={handleChange}
          disabled={isSubmitting}
          className="form-control"
          placeholder="e.g. Bi-weekly settlement including 12 hours overtime bonus"
        />
      </div>

      <div className="modal-footer" style={{ margin: '16px -24px -24px -24px' }}>
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Recording Payment...
            </>
          ) : (
            <>
              <DollarSign size={18} />
              Finalize & Record Payment
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const RecordPaymentWrapper = ({ laborer, onClose, onSuccessPayment }) => {
  const { laborers, recordPayment, getCalculatedWages } = useLabor();
  const [selectedLaborerId, setSelectedLaborerId] = useState(
    () => laborer?.id || (laborers.length > 0 ? laborers[0].id : '')
  );

  const calculatedWages = getCalculatedWages();
  const currentLaborerWage = calculatedWages.find((w) => w.laborer.id === selectedLaborerId);

  return (
    <div>
      {/* Worker Selection & Balance Card */}
      <div style={{ marginBottom: '20px', background: 'var(--bg-card-alt)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label" htmlFor="pay-laborer-select">
            Select Laborer <span className="required">*</span>
          </label>
          <select
            id="pay-laborer-select"
            className="form-control"
            value={selectedLaborerId}
            onChange={(e) => setSelectedLaborerId(e.target.value)}
          >
            {laborers.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name} — {lab.role} ({lab.nic})
              </option>
            ))}
          </select>
        </div>

        {currentLaborerWage && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Regular Pay</div>
              <strong style={{ color: '#fff' }}>Rs. {currentLaborerWage.regularWages.toFixed(2)}</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Overtime Pay</div>
              <strong style={{ color: 'var(--amber-light)' }}>Rs. {currentLaborerWage.overtimeWages.toFixed(2)}</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Already Paid</div>
              <strong style={{ color: 'var(--emerald)' }}>Rs. {currentLaborerWage.totalPaid.toFixed(2)}</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Outstanding Due</div>
              <strong style={{ color: currentLaborerWage.balanceDue > 0 ? 'var(--rose)' : 'var(--emerald)' }}>
                Rs. {currentLaborerWage.balanceDue.toFixed(2)}
              </strong>
            </div>
          </div>
        )}
      </div>

      <RecordPaymentForm
        key={selectedLaborerId}
        selectedLaborerId={selectedLaborerId}
        currentLaborerWage={currentLaborerWage}
        onClose={onClose}
        recordPayment={recordPayment}
        onSuccessPayment={onSuccessPayment}
      />
    </div>
  );
};

const RecordPaymentModal = ({ isOpen, onClose, laborer, onSuccessPayment }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Finalized Labor Payment"
      maxWidth="680px"
    >
      <RecordPaymentWrapper
        key={laborer?.id || 'default'}
        laborer={laborer}
        onClose={onClose}
        onSuccessPayment={onSuccessPayment}
      />
    </Modal>
  );
};

export default RecordPaymentModal;
