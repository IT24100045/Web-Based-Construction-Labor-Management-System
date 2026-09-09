import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { Save, AlertCircle } from 'lucide-react';

const EditAttendanceForm = ({ record, onClose, laborers, sites, updateAttendanceRecord }) => {
  const [form, setForm] = useState(() => ({
    status: record.status || 'Present',
    regularHours: record.regularHours !== undefined ? String(record.regularHours) : '8',
    overtimeHours: record.overtimeHours !== undefined ? String(record.overtimeHours) : '0',
    otReason: record.otReason || '',
    supervisorNotes: record.supervisorNotes || ''
  }));

  const [errors, setErrors] = useState({});

  const laborer = laborers.find((l) => l.id === record.laborerId);
  const site = sites.find((s) => s.id === record.siteId);

  const handleStatusChange = (newStatus) => {
    let reg = '8';
    if (newStatus === 'Absent' || newStatus === 'Leave') reg = '0';
    else if (newStatus === 'Half-Day') reg = '4';

    setForm((prev) => ({
      ...prev,
      status: newStatus,
      regularHours: reg,
      overtimeHours: (newStatus === 'Absent' || newStatus === 'Leave') ? '0' : prev.overtimeHours
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errs = {};
    const reg = parseFloat(form.regularHours);
    const ot = parseFloat(form.overtimeHours);

    if (isNaN(reg) || reg < 0 || reg > 24) {
      errs.regularHours = 'Enter valid regular hours (0-24).';
    }
    if (isNaN(ot) || ot < 0 || ot > 24) {
      errs.overtimeHours = 'Enter valid overtime hours (0-24).';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    updateAttendanceRecord(record.id, {
      status: form.status,
      regularHours: reg,
      overtimeHours: ot,
      otReason: form.otReason,
      supervisorNotes: form.supervisorNotes
    });

    onClose();
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
              max="24"
              name="regularHours"
              value={form.regularHours}
              onChange={handleChange}
              className={`form-control ${errors.regularHours ? 'is-invalid' : ''}`}
              required
            />
            {errors.regularHours && (
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
              max="24"
              name="overtimeHours"
              value={form.overtimeHours}
              onChange={handleChange}
              className={`form-control ${errors.overtimeHours ? 'is-invalid' : ''}`}
              required
            />
            {errors.overtimeHours && (
              <span className="form-error-msg"><AlertCircle size={13} /> {errors.overtimeHours}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-ot-reason">Overtime Task / Reason</label>
          <input
            id="edit-ot-reason"
            type="text"
            name="otReason"
            placeholder="e.g. Scaffolding emergency repair..."
            value={form.otReason}
            onChange={handleChange}
            className="form-control"
          />
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
            className="form-control"
          />
        </div>

        <div className="modal-footer" style={{ margin: '16px -24px -24px -24px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            Save Attendance Correction
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
