import React, { useState, useMemo } from 'react';
import { useLabor } from '../../context/LaborContext';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  Edit2,
  Trash2,
  HardHat,
  DollarSign,
  Briefcase,
  LayoutGrid,
  List
} from 'lucide-react';
import StatCard from '../common/StatCard';
import AddSiteModal from './AddSiteModal';
import EditSiteModal from './EditSiteModal';
import SiteAllocationModal from './SiteAllocationModal';
import { PROJECT_TYPES } from '../../utils/mockData';

const RegisteredSitesView = () => {
  const { sites, laborers, deleteSite } = useLabor();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [allocatingSite, setAllocatingSite] = useState(null);

  // Statistics
  const totalSites = sites.length;
  const activeSites = sites.filter((s) => s.status === 'Active').length;
  const totalAssignedLaborers = laborers.filter((l) => l.assignedSiteId).length;
  const totalBudget = sites.reduce((sum, s) => sum + (s.budget || 0), 0);

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchesSearch =
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.manager.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'ALL' || site.type === selectedType;
      const matchesStatus = selectedStatus === 'ALL' || site.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sites, searchTerm, selectedType, selectedStatus]);

  const handleDelete = (site) => {
    const assignedCount = laborers.filter((l) => l.assignedSiteId === site.id).length;
    const warn = assignedCount > 0
      ? ` Warning: ${assignedCount} worker(s) are currently allocated to this site and will become unassigned.`
      : '';
    if (window.confirm(`Are you sure you want to delete site "${site.name}" (${site.code})?${warn}`)) {
      deleteSite(site.id);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="badge badge-emerald"><span className="badge-dot" />Active</span>;
      case 'Planning':
        return <span className="badge badge-amber"><span className="badge-dot" />Planning</span>;
      case 'Completed':
        return <span className="badge badge-sky"><span className="badge-dot" />Completed</span>;
      default:
        return <span className="badge badge-gray"><span className="badge-dot" />{status}</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Building2 size={28} color="var(--amber-primary)" />
            Site Allocation & Project Management
          </h1>
          <p>Supervise infrastructure projects, monitor site readiness, and dispatch workforce crews.</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus size={18} />
            Add New Site
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          icon={<Building2 size={24} />}
          label="Registered Construction Sites"
          value={totalSites}
          subtext="Active & planned sites"
          color="amber"
        />
        <StatCard
          icon={<HardHat size={24} />}
          label="Sites Under Active Works"
          value={activeSites}
          subtext="Field operations ongoing"
          color="emerald"
        />
        <StatCard
          icon={<Users size={24} />}
          label="Field Workforce Deployed"
          value={totalAssignedLaborers}
          subtext="Allocated across all sites"
          color="sky"
        />
        <StatCard
          icon={<DollarSign size={24} />}
          label="Total Project Value"
          value={`Rs. ${(totalBudget / 1000000).toFixed(1)}M`}
          subtext="Cumulative project budget"
          color="purple"
        />
      </div>

      {/* Search, Filter, and View Switcher */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by site name, code, location, client, or engineer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '160px' }}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="ALL">All Sectors</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '140px' }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="Active">Active</option>
          <option value="Planning">Planning</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>

        {/* View Toggle */}
        <div className="tab-switcher">
          <button
            className={`tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid Card View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`tab-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Data Table View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content: Grid or Table */}
      {viewMode === 'grid' ? (
        <div className="sites-grid">
          {filteredSites.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <Building2 size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: '1rem', fontWeight: 600 }}>No construction sites match your filter.</p>
            </div>
          ) : (
            filteredSites.map((site) => {
              const allocatedWorkers = laborers.filter((l) => l.assignedSiteId === site.id);

              return (
                <div key={site.id} className="site-card">
                  <div className="site-card-header">
                    <div>
                      <span className="site-code">{site.code}</span>
                      <h3 className="site-card-title">{site.name}</h3>
                      <div className="site-location">
                        <MapPin size={14} color="var(--amber-primary)" />
                        <span>{site.location}</span>
                      </div>
                    </div>
                    <div>{getStatusBadge(site.status)}</div>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '12px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {site.description || 'General construction works and civil contractor project.'}
                  </p>

                  <div className="site-meta-grid">
                    <div className="site-meta-item">
                      <span className="site-meta-label">Client</span>
                      <span className="site-meta-val">{site.client}</span>
                    </div>
                    <div className="site-meta-item">
                      <span className="site-meta-label">Sector</span>
                      <span className="site-meta-val">{site.type}</span>
                    </div>
                    <div className="site-meta-item">
                      <span className="site-meta-label">Duration</span>
                      <span className="site-meta-val" style={{ fontSize: '0.8rem' }}>
                        {site.startDate} &rarr; {site.endDate || 'Ongoing'}
                      </span>
                    </div>
                    <div className="site-meta-item">
                      <span className="site-meta-label">Budget</span>
                      <span className="site-meta-val" style={{ color: 'var(--amber-light)', fontFamily: 'var(--font-mono)' }}>
                        Rs. ${(site.budget || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                    <div className="site-workers-pill">
                      <Users size={16} />
                      <strong style={{ color: '#fff' }}>{allocatedWorkers.length}</strong>
                      <span>Workers Allocated</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Supervisor: <strong>{site.manager.split(' ')[1] || site.manager}</strong>
                    </span>
                  </div>

                  <div className="site-card-footer">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setAllocatingSite(site)}
                      title="Assign or reassign workforce crew"
                    >
                      <Users size={15} />
                      Allocate Crew
                    </button>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-icon"
                        title="Edit Site Details"
                        onClick={() => setEditingSite(site)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ color: 'var(--rose)' }}
                        title="Delete Site Record"
                        onClick={() => handleDelete(site)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Site & Project Code</th>
                <th>Location</th>
                <th>Client & Type</th>
                <th>Duration</th>
                <th>Budget</th>
                <th>Workforce</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map((site) => {
                const allocatedWorkers = laborers.filter((l) => l.assignedSiteId === site.id);

                return (
                  <tr key={site.id}>
                    <td>
                      <div>
                        <strong style={{ color: '#fff' }}>{site.name}</strong>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--amber-primary)' }}>
                          {site.code}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <MapPin size={14} color="var(--amber-primary)" />
                        <span>{site.location}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{site.client}</div>
                      <span className="badge badge-sky" style={{ fontSize: '0.7rem' }}>{site.type}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {site.startDate} &rarr; {site.endDate || 'TBD'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--amber-light)' }}>
                      Rs. ${(site.budget || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-amber">
                        <Users size={12} /> {allocatedWorkers.length} Workers
                      </span>
                    </td>
                    <td>{getStatusBadge(site.status)}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setAllocatingSite(site)}
                        >
                          <Users size={14} /> Allocate
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => setEditingSite(site)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ color: 'var(--rose)' }}
                          onClick={() => handleDelete(site)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Site Modal */}
      <AddSiteModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* Edit Site Modal */}
      <EditSiteModal
        isOpen={!!editingSite}
        onClose={() => setEditingSite(null)}
        site={editingSite}
      />

      {/* Site Allocation Modal */}
      <SiteAllocationModal
        isOpen={!!allocatingSite}
        onClose={() => setAllocatingSite(null)}
        site={allocatingSite}
      />
    </div>
  );
};

export default RegisteredSitesView;
