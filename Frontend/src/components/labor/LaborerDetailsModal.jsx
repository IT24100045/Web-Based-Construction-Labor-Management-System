import React from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import {
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  Edit2
} from 'lucide-react';

const LaborerDetailsModal = ({ isOpen, onClose, laborer, onOpenEdit, onRecordPayment }) => {
  const { sites, attendance, payments } = useLabor();

  if (!laborer) return null;

  const assignedSite = sites.find((s) => s.id === laborer.assignedSiteId);
  const laborerAttendance = attendance.filter((a) => a.laborerId === laborer.id);
  const laborerPayments = payments.filter((p) => p.laborerId === laborer.id);

  const totalRegHrs = laborerAttendance.reduce((sum, a) => sum + (a.regularHours || 0), 0);
  const totalOtHrs = laborerAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
  const grossWages = (totalRegHrs * laborer.hourlyRate) + (totalOtHrs * laborer.hourlyRate * 1.5);
  const totalPaid = laborerPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = Math.max(0, grossWages - totalPaid);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Laborer Profile & Operations Dossier"
      maxWidth="680px"
    >
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--amber-primary), #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#000',
            boxShadow: 'var(--shadow-amber)'
          }}
        >
          {laborer.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem' }}>{laborer.name}</h2>
            <span className={`badge ${laborer.status === 'Active' ? 'badge-emerald' : 'badge-amber'}`}>
              <span className="badge-dot" />
              {laborer.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <span><strong>EMP ID:</strong> {laborer.id}</span>
            <span><strong>Joined:</strong> {laborer.joinDate}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '22px' }}>
        {/* Trade & Rates */}
        <div className="card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--amber-light)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Briefcase size={16} /> Trade & Compensation
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Job Role:</span>
              <strong style={{ color: '#fff' }}>{laborer.role}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Skill Tier:</span>
              <span className="badge badge-sky">{laborer.skillLevel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Hourly Rate:</span>
              <strong style={{ color: 'var(--amber-primary)' }}>Rs. {laborer.hourlyRate.toFixed(2)} / hr</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>OT Rate (1.5x):</span>
              <strong style={{ color: 'var(--emerald)' }}>Rs. {(laborer.hourlyRate * 1.5).toFixed(2)} / hr</strong>
            </div>
          </div>
        </div>

        {/* Site Assignment */}
        <div className="card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--sky)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Building2 size={16} /> Construction Site Deployment
          </h4>
          {assignedSite ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{assignedSite.name}</strong>
                <div style={{ color: 'var(--amber-primary)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>{assignedSite.code}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <MapPin size={14} /> {assignedSite.location}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Supervisor: {assignedSite.manager}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic', padding: '12px 0' }}>
              Currently in standby reserve pool (Not allocated to any active site).
            </div>
          )}
        </div>
      </div>

      {/* Contact & Safety Emergency Details */}
      <div className="card" style={{ padding: '16px', marginBottom: '22px' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={16} /> Contact & Safety Emergency Verification
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.86rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Direct Mobile</div>
            <div style={{ color: '#fff', fontWeight: 600 }}>{laborer.phone}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Email</div>
            <div style={{ color: '#fff' }}>{laborer.email || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Safety Emergency Contact</div>
            <div style={{ color: 'var(--rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} /> {laborer.emergencyContact}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Residential Address</div>
            <div style={{ color: '#fff' }}>{laborer.address || 'Colombo, Sri Lanka'}</div>
          </div>
        </div>
      </div>

      {/* Labor Performance & Payroll Overview */}
      <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Logged Operations & Payroll Balance
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{totalRegHrs} hrs</span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Regular Hours</div>
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--amber-light)' }}>{totalOtHrs} hrs</span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Overtime Hours</div>
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald)' }}>Rs. {grossWages.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Gross Wages</div>
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: balance > 0 ? 'var(--rose)' : 'var(--emerald)' }}>
              Rs. {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Balance Due</div>
          </div>
        </div>
      </div>

      <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            onClose();
            onOpenEdit(laborer);
          }}
        >
          <Edit2 size={16} /> Edit Profile
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            onClose();
            onRecordPayment(laborer);
          }}
        >
          <DollarSign size={16} /> Disburse Payment
        </button>
      </div>
    </Modal>
  );
};

export default LaborerDetailsModal;
