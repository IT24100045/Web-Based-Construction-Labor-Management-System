import React, { useState, useMemo } from 'react';
import { useLabor } from '../../context/LaborContext';
import {
  Search,
  UserPlus,
  Users,
  HardHat,
  DollarSign,
  Briefcase,
  Eye,
  Edit2,
  Trash2,
  Building2,
  Phone,
  Filter
} from 'lucide-react';
import StatCard from '../common/StatCard';
import AddLaborerModal from './AddLaborerModal';
import EditLaborerModal from './EditLaborerModal';
import LaborerDetailsModal from './LaborerDetailsModal';
import { JOB_ROLES } from '../../utils/mockData';

const getLaborerStatusBadge = (status) => {
  switch (status) {
    case 'Active':
    case 'Present':
      return <span className="badge badge-emerald"><span className="badge-dot" />{status}</span>;
    case 'Half-Day':
      return <span className="badge badge-amber"><span className="badge-dot" />{status}</span>;
    case 'Absent':
      return <span className="badge badge-rose"><span className="badge-dot" />{status}</span>;
    case 'On Leave':
    case 'Leave':
      return <span className="badge badge-purple"><span className="badge-dot" />{status}</span>;
    case 'Inactive':
    default:
      return <span className="badge badge-gray"><span className="badge-dot" />{status}</span>;
  }
};

const LaborerDirectory = ({ onRecordPaymentForLaborer }) => {
  const { laborers, sites, deleteLaborer } = useLabor();

  // Filters & search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLaborer, setEditingLaborer] = useState(null);
  const [viewingLaborer, setViewingLaborer] = useState(null);

  // Statistics
  const totalLaborers = laborers.length;
  const assignedLaborers = laborers.filter((l) => l.assignedSiteId).length;
  const availablePool = totalLaborers - assignedLaborers;
  const avgHourlyRate = totalLaborers > 0
    ? (laborers.reduce((acc, l) => acc + (l.hourlyRate || 0), 0) / totalLaborers).toFixed(2)
    : '0.00';

  // Filtered laborers
  const filteredLaborers = useMemo(() => {
    return laborers.filter((lab) => {
      const matchesSearch =
        lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lab.id && lab.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lab.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = selectedRole === 'ALL' || lab.role === selectedRole;
      const matchesSite =
        selectedSite === 'ALL' ||
        (selectedSite === 'UNASSIGNED' ? !lab.assignedSiteId : lab.assignedSiteId === selectedSite);
      const matchesStatus = selectedStatus === 'ALL' || lab.status === selectedStatus;

      return matchesSearch && matchesRole && matchesSite && matchesStatus;
    });
  }, [laborers, searchTerm, selectedRole, selectedSite, selectedStatus]);

  const handleDelete = async (lab) => {
    if (window.confirm(`Are you sure you want to remove laborer "${lab.name}" (${lab.id}) from the directory?`)) {
      try {
        await deleteLaborer(lab.id);
      } catch (err) {
        console.error('Failed to delete laborer:', err);
      }
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Users size={28} color="var(--amber-primary)" />
            Labor Management & Workforce Directory
          </h1>
          <p>Register, verify, allocate, and oversee construction tradesmen and field laborers.</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsAddOpen(true)}
          >
            <UserPlus size={18} />
            Add New Laborer
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          icon={<Users size={24} />}
          label="Total Registered Workforce"
          value={totalLaborers}
          subtext="Verified trade profiles"
          color="amber"
        />
        <StatCard
          icon={<HardHat size={24} />}
          label="Active On-Site Laborers"
          value={assignedLaborers}
          subtext={`${((assignedLaborers / (totalLaborers || 1)) * 100).toFixed(0)}% site deployment`}
          color="emerald"
        />
        <StatCard
          icon={<Briefcase size={24} />}
          label="Available Standby Pool"
          value={availablePool}
          subtext="Ready for site dispatch"
          color="sky"
        />
        <StatCard
          icon={<DollarSign size={24} />}
          label="Average Hourly Wage"
          value={`Rs. ${avgHourlyRate}/hr`}
          subtext="Base standard rate"
          color="purple"
        />
      </div>

      {/* Search & Filter Controls */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by worker name, EMP ID, phone, or trade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '170px' }}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="ALL">All Job Roles</option>
            {JOB_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Site Filter */}
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
        >
          <option value="ALL">All Construction Sites</option>
          <option value="UNASSIGNED">Unassigned Pool</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '130px' }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Present">Present</option>
          <option value="Half-Day">Half-Day</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
          <option value="On Leave">On Leave</option>
        </select>

        {(searchTerm || selectedRole !== 'ALL' || selectedSite !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedRole('ALL');
              setSelectedSite('ALL');
              setSelectedStatus('ALL');
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Laborer Directory Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tradesman / Laborer</th>
              <th>Trade & Skill Level</th>
              <th>Contact Details</th>
              <th>Assigned Site</th>
              <th>Base Rate</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLaborers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                  <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>No laborer profiles found.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try adjusting your search criteria or register a new laborer.</p>
                </td>
              </tr>
            ) : (
              filteredLaborers.map((lab) => {
                const assignedSite = sites.find((s) => s.id === lab.assignedSiteId);

                return (
                  <tr key={lab.id}>
                    <td>
                      <div className="worker-avatar-cell">
                        <div className="worker-avatar">
                          {lab.name.charAt(0)}
                        </div>
                        <div className="worker-name-block">
                          <span className="worker-name">{lab.name}</span>
                          <span className="worker-nic">EMP ID: {lab.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <strong style={{ color: '#fff' }}>{lab.role}</strong>
                        <div>
                          <span className="badge badge-sky" style={{ fontSize: '0.7rem', marginTop: '3px' }}>
                            {lab.skillLevel}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} color="var(--amber-primary)" />
                          <span>{lab.phone}</span>
                        </div>
                        {lab.email && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                            {lab.email}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      {assignedSite ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={15} color="var(--sky)" />
                          <div>
                            <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.86rem' }}>{assignedSite.name}</span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {assignedSite.code}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-gray">Standby Pool</span>
                      )}
                    </td>

                    <td>
                      <div className="currency" style={{ color: 'var(--amber-primary)', fontSize: '0.92rem' }}>
                        Rs. {lab.hourlyRate.toFixed(2)}/hr
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        OT: Rs. {(lab.hourlyRate * 1.5).toFixed(2)}/hr
                      </div>
                    </td>

                    <td>
                      {getLaborerStatusBadge(lab.status)}
                    </td>

                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          title="View Full Profile Dossier"
                          onClick={() => setViewingLaborer(lab)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit Laborer Information"
                          onClick={() => setEditingLaborer(lab)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ color: 'var(--rose)' }}
                          title="Delete / Remove Laborer"
                          onClick={() => handleDelete(lab)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Laborer Modal */}
      <AddLaborerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* Edit Laborer Modal */}
      <EditLaborerModal
        isOpen={!!editingLaborer}
        onClose={() => setEditingLaborer(null)}
        laborer={editingLaborer}
      />

      {/* Laborer Details Modal */}
      <LaborerDetailsModal
        isOpen={!!viewingLaborer}
        onClose={() => setViewingLaborer(null)}
        laborer={viewingLaborer}
        onOpenEdit={(lab) => setEditingLaborer(lab)}
        onRecordPayment={(lab) => {
          if (onRecordPaymentForLaborer) onRecordPaymentForLaborer(lab);
        }}
      />
    </div>
  );
};

export default LaborerDirectory;
