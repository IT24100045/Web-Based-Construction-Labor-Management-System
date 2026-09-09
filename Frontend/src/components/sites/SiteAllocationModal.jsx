import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { CheckSquare, Square, HardHat } from 'lucide-react';

const SiteAllocationContent = ({ site, onClose, laborers, sites, allocateLaborersToSite }) => {
  const [selectedLaborerIds, setSelectedLaborerIds] = useState(() =>
    laborers.filter((l) => l.assignedSiteId === site.id).map((l) => l.id)
  );
  const [searchFilter, setSearchFilter] = useState('');

  const toggleLaborer = (id) => {
    setSelectedLaborerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredLaborers = laborers.filter((l) =>
    l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.role.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.nic.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSelectAll = () => {
    const allMatching = filteredLaborers.map((l) => l.id);
    const combined = Array.from(new Set([...selectedLaborerIds, ...allMatching]));
    setSelectedLaborerIds(combined);
  };

  const handleDeselectAll = () => {
    setSelectedLaborerIds([]);
  };

  const handleSave = () => {
    allocateLaborersToSite(site.id, selectedLaborerIds);
    onClose();
  };

  return (
    <>
      <div style={{ marginBottom: '16px', background: 'var(--bg-card-alt)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--amber-primary)', fontFamily: 'var(--font-mono)' }}>{site.code}</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{site.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Supervisor: {site.manager}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-light)' }}>
            {selectedLaborerIds.length} Workers
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Deployment</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filter workers by name, role, or NIC..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="form-control"
          style={{ maxWidth: '320px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleSelectAll}>
            Select All
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleDeselectAll}>
            Clear Selection
          </button>
        </div>
      </div>

      <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
        {filteredLaborers.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No laborers found matching search criteria.
          </div>
        ) : (
          filteredLaborers.map((lab) => {
            const isSelected = selectedLaborerIds.includes(lab.id);
            const otherSite = sites.find((s) => s.id === lab.assignedSiteId && s.id !== site.id);

            return (
              <div
                key={lab.id}
                onClick={() => toggleLaborer(lab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: isSelected ? 'var(--amber-primary)' : 'var(--text-muted)' }}>
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                      {lab.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {lab.role} &bull; <span style={{ fontFamily: 'var(--font-mono)' }}>{lab.nic}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {isSelected ? (
                    <span className="badge badge-emerald">Assigned Here</span>
                  ) : otherSite ? (
                    <span className="badge badge-amber" title={`Currently at ${otherSite.name}`}>
                      At: {otherSite.code}
                    </span>
                  ) : (
                    <span className="badge badge-gray">Available Pool</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="modal-footer" style={{ margin: '16px -24px -24px -24px' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          <HardHat size={18} />
          Save Allocation ({selectedLaborerIds.length} Workers)
        </button>
      </div>
    </>
  );
};

const SiteAllocationModal = ({ isOpen, onClose, site }) => {
  const { laborers, sites, allocateLaborersToSite } = useLabor();

  if (!isOpen || !site) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Workforce Site Allocation — ${site.name}`}
      maxWidth="720px"
    >
      <SiteAllocationContent
        key={site.id}
        site={site}
        onClose={onClose}
        laborers={laborers}
        sites={sites}
        allocateLaborersToSite={allocateLaborersToSite}
      />
    </Modal>
  );
};

export default SiteAllocationModal;
