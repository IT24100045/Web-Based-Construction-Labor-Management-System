import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { Save, AlertCircle, Loader2 } from 'lucide-react';

const EditAttendanceForm = ({ record, onClose, laborers, sites, updateAttendanceRecord }) => {
  const [form, setForm] = useState(() => ({
    status: record.status || 'Present',
    regularHours: record.regularHours !== undefined ? String(record.regularHours) : '8',
    overtimeHours: record.overtimeHours !== undefined ? String(record.overtimeHours) : '0',
    otReason: record.otReason || '',
    supervisorNotes: record.supervisorNotes || ''
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const laborer = laborers.find((l) => l.id === record.laborerId);
  const site = sites.find((s) => s.id === record.siteId);

  const validate = (currentForm = form) => {
    const errs = {};
    const reg = parseFloat(currentForm.regularHours);
    const ot = parseFloat(currentForm.overtimeHours);

    if (currentForm.status === 'Absent' || currentForm.status === 'Leave') {
      if (!isNaN(reg) && reg > 0) {
        errs.regularHours = `Regular hours must be 0 for ${currentForm.status} status.`;
      }
      if (!isNaN(ot) && ot > 0) {
        errs.overtimeHours = `Overtime hours must be 0 for ${currentForm.status} status.`;
      }
    } else if (currentForm.status === 'Half-Day') {
      if (isNaN(reg) || reg <= 0 || reg > 6) {
        errs.regularHours = 'Half-day regular hours must be between 0.5 and 6.0 hrs.';
      }
    } else {
      // Present
      if (isNaN(reg) || reg <= 0 || reg > 12) {
        errs.regularHours = 'Regular shift hours must be between 1.0 and 12.0 hrs.';
      }
    }

    if (isNaN(ot) || ot < 0 || ot > 8) {
      errs.overtimeHours = 'Overtime hours must be between 0 and 8.0 hrs.';
    }

    if (!errs.regularHours && !errs.overtimeHours && reg + ot > 16) {
      errs.overtimeHours = 'Combined total shift (regular + overtime) cannot exceed 16 hours.';
    }

    if (ot > 0 && !currentForm.otReason.trim()) {
      errs.otReason = 'Please specify the overtime task or reason for overtime hours.';
    }

    return errs;
  };

  const handleStatusChange = (newStatus) => {
    let reg = '8';
    let ot = form.overtimeHours;
    if (newStatus === 'Absent' || newStatus === 'Leave') {
      reg = '0';
      ot = '0';
    } else if (newStatus === 'Half-Day') {
      reg = '4';
    }

    const updated = {
      ...form,
      status: newStatus,
      regularHours: reg,
      overtimeHours: ot,
      otReason: (newStatus === 'Absent' || newStatus === 'Leave') ? '' : form.otReason
    };

    setForm(updated);
    setErrors(validate(updated));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (serverError) setServerError('');

    if (touched[name] || touched.regularHours || touched.overtimeHours) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      regularHours: true,
      overtimeHours: true,
      otReason: true
    });

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const reg = parseFloat(form.regularHours);
    const ot = parseFloat(form.overtimeHours);

    setIsSubmitting(true);
    setServerError('');

    try {
      await updateAttendanceRecord(record.id, {
        status: form.status,
        regularHours: reg,
        overtimeHours: ot,
        otReason: form.otReason.trim(),
        supervisorNotes: form.supervisorNotes.trim()
      });
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to save attendance correction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '18px', background: 'var(--bg-card-alt)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Laborer</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{laborer ? laborer.name : record.laborerId}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--amber-primary)' }}>{laborer ? laborer.role : ''}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Date & Site</div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>{record.date}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--sky)' }}>{site ? site.name : record.siteId}</div>
        </div>
      </div>

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

        <div className="form-group">
          <label className="form-label">Attendance Status</label>
          <div className="status-toggle-group" style={{ width: '100%' }}>
            {['Present', 'Half-Day', 'Absent', 'Leave'].map((status) => (
              <button
                key={status}
                type="button"
                className={`status-toggle-btn ${form.status === status ? `active-${status.toLowerCase()}` : ''}`}
                style={{ flex: 1, padding: '10px' }}
                onClick={() => handleStatusChange(status)}
                disabled={isSubmitting}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-reg-hrs">
              Regular Hours <span className="required">*</span>
            </label>
            <input
              id="edit-reg-hrs"
              type="number"
              step="0.5"
              min="0"
              max="12"
              name="regularHours"
              value={form.regularHours}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`form-control ${touched.regularHours ? (errors.regularHours ? 'is-invalid' : 'is-valid') : ''}`}
              required
            />
            {touched.regularHours && errors.regularHours && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.regularHours}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-ot-hrs">
              Overtime Hours <span className="required">*</span>
            </label>
            <input
              id="edit-ot-hrs"
              type="number"
              step="0.5"
              min="0"
              max="8"
              name="overtimeHours"
              value={form.overtimeHours}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`form-control ${touched.overtimeHours ? (errors.overtimeHours ? 'is-invalid' : 'is-valid') : ''}`}
              required
            />
            {touched.overtimeHours && errors.overtimeHours && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.overtimeHours}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-ot-reason">
            Overtime Task / Reason {parseFloat(form.overtimeHours) > 0 && <span className="required">*</span>}
          </label>
          <input
            id="edit-ot-reason"
            type="text"
            name="otReason"
            placeholder="e.g. Scaffolding emergency repair, concrete pour overtime..."
            value={form.otReason}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            className={`form-control ${touched.otReason && errors.otReason ? 'is-invalid' : ''}`}
          />
          {touched.otReason && errors.otReason && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.otReason}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-sup-notes">Supervisor Correction Notes</label>
          <textarea
            id="edit-sup-notes"
            name="supervisorNotes"
            rows="2"
            placeholder="Document reason for attendance correction..."
            value={form.supervisorNotes}
            onChange={handleChange}
            disabled={isSubmitting}
            className="form-control"
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
                Saving Correction...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Attendance Correction
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

const EditAttendanceModal = ({ isOpen, onClose, record }) => {
  const { laborers, sites, updateAttendanceRecord } = useLabor();

  if (!isOpen || !record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Correct Attendance Record"
      maxWidth="620px"
    >
      <EditAttendanceForm
        key={record.id}
        record={record}
        onClose={onClose}
        laborers={laborers}
        sites={sites}
        updateAttendanceRecord={updateAttendanceRecord}
      />
    </Modal>
  );
};

export default EditAttendanceModal;
