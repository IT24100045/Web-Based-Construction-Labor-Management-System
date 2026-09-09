import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { PROJECT_TYPES } from '../../utils/mockData';
import { Save, AlertCircle } from 'lucide-react';

const EditSiteForm = ({ site, updateSite, onClose }) => {
  const [form, setForm] = useState(() => ({
    name: site.name || '',
    code: site.code || '',
    location: site.location || '',
    type: site.type || 'Commercial',
    client: site.client || '',
    startDate: site.startDate || '',
    endDate: site.endDate || '',
    budget: site.budget ? String(site.budget) : '',
    manager: site.manager || '',
    status: site.status || 'Active',
    description: site.description || ''
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Site name is required.';
    if (!form.location.trim()) errs.location = 'Location is required.';
    if (!form.client.trim()) errs.client = 'Client is required.';
    if (!form.startDate) errs.startDate = 'Start date required.';
    if (!form.endDate) errs.endDate = 'End date required.';
    else if (form.startDate && form.endDate < form.startDate) {
      errs.endDate = 'End date cannot be prior to start date.';
    }
    if (!form.budget || isNaN(form.budget) || parseFloat(form.budget) <= 0) {
      errs.budget = 'Valid positive budget required.';
    }
    if (!form.manager.trim()) errs.manager = 'Manager in-charge required.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched({
        name: true,
        location: true,
        client: true,
        startDate: true,
        endDate: true,
        budget: true,
        manager: true
      });
      return;
    }

    updateSite(site.id, form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label" htmlFor="edit-site-name">
            Construction Site Name <span className="required">*</span>
          </label>
          <input
            id="edit-site-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
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
          <label className="form-label" htmlFor="edit-site-code">Project Code</label>
          <input
            id="edit-site-code"
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            className="form-control"
            disabled
            title="Project code cannot be changed"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-site-status">Site Status</label>
          <select
            id="edit-site-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="form-control"
          >
            <option value="Active">Active (Under Construction)</option>
            <option value="Planning">Planning / Mobilization</option>
            <option value="On Hold">On Hold / Suspended</option>
            <option value="Completed">Completed / Handed Over</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="edit-site-loc">
            Site Location <span className="required">*</span>
          </label>
          <input
            id="edit-site-loc"
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className={`form-control ${touched.location && errors.location ? 'is-invalid' : ''}`}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-site-client">
            Client <span className="required">*</span>
          </label>
          <input
            id="edit-site-client"
            type="text"
            name="client"
            value={form.client}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="edit-site-start">Commencement Date</label>
          <input
            id="edit-site-start"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-site-end">Completion Date</label>
          <input
            id="edit-site-end"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className={`form-control ${touched.endDate && errors.endDate ? 'is-invalid' : ''}`}
          />
          {touched.endDate && errors.endDate && (
            <span className="form-error-msg"><AlertCircle size={13} /> {errors.endDate}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="edit-site-budget">Budget (Rs. LKR)</label>
          <input
            id="edit-site-budget"
            type="number"
            step="100000"
            name="budget"
            value={form.budget}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-site-mgr">Supervisor In-Charge</label>
          <input
            id="edit-site-mgr"
            type="text"
            name="manager"
            value={form.manager}
            onChange={handleChange}
            className="form-control"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-site-desc">Project Details</label>
        <textarea
          id="edit-site-desc"
          name="description"
          rows="2"
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
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </form>
  );
};

const EditSiteModal = ({ isOpen, onClose, site }) => {
  const { updateSite } = useLabor();

  if (!isOpen || !site) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Construction Site — ${site.name}`}
      maxWidth="680px"
    >
      <EditSiteForm
        key={site.id}
        site={site}
        updateSite={updateSite}
        onClose={onClose}
      />
    </Modal>
  );
};

export default EditSiteModal;
