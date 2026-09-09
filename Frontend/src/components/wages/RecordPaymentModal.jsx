import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { DollarSign, AlertCircle } from 'lucide-react';

const RecordPaymentForm = ({
  selectedLaborerId,
  currentLaborerWage,
  onClose,
  recordPayment,
  onSuccessPayment
}) => {
  const [form, setForm] = useState(() => ({
    amount: currentLaborerWage && currentLaborerWage.balanceDue > 0 ? currentLaborerWage.balanceDue.toFixed(2) : '0.00',
    date: new Date().toISOString().split('T')[0],
    method: 'Bank Transfer',
    reference: `TXN-${Date.now().toString().slice(-6)}`,
    approvedBy: 'Eng. Nihal Samarasinghe (Chief Supervisor)',
    notes: 'Bi-weekly payroll settlement'
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value) => {
    let err = '';
    switch (field) {
      case 'amount':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          err = 'Payment amount must be greater than Rs. 0.00.';
        }
        break;
      case 'date':
        if (!value) err = 'Payment date is required.';
        break;
      case 'reference':
        if (!value.trim()) err = 'Transaction reference or voucher ID is required.';
        break;
      case 'approvedBy':
        if (!value.trim()) err = 'Authorizing official name required.';
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
      setForm((prev) => ({
        ...prev,
        amount: currentLaborerWage.balanceDue.toFixed(2)
      }));
    }
  };

  const handleSubmit = (e) => {
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

    const savedPayment = recordPayment({
      laborerId: selectedLaborerId,
      amount: parseFloat(form.amount),
      date: form.date,
      method: form.method,
      reference: form.reference,
      approvedBy: form.approvedBy,
      notes: form.notes
    });

    onClose();
    if (onSuccessPayment) {
      onSuccessPayment(savedPayment, currentLaborerWage);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="pay-amount">
              Payment Amount (Rs. LKR) <span className="required">*</span>
            </label>
            {currentLaborerWage && currentLaborerWage.balanceDue > 0 && (
              <button
                type="button"
                onClick={handleSetFullBalance}
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
            className={`form-control ${touched.amount && errors.amount ? 'is-invalid' : ''}`}
            required
          />
          {touched.amount && errors.amount && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.amount}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="pay-date">
            Disbursement Date <span className="required">*</span>
          </label>
          <input
            id="pay-date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${touched.date && errors.date ? 'is-invalid' : ''}`}
            required
          />
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
            className={`form-control ${touched.reference && errors.reference ? 'is-invalid' : ''}`}
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
          className={`form-control ${touched.approvedBy && errors.approvedBy ? 'is-invalid' : ''}`}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pay-notes">Payment Remarks / Cycle Notes</label>
        <textarea
          id="pay-notes"
          name="notes"
          rows="2"
          value={form.notes}
          onChange={handleChange}
          className="form-control"
          placeholder="e.g. Bi-weekly settlement including 12 hours overtime bonus"
        />
      </div>

      <div className="modal-footer" style={{ margin: '16px -24px -24px -24px' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          <DollarSign size={18} />
          Finalize & Record Payment
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
