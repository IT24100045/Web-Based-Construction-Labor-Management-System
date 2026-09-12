import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabor } from '../../context/LaborContext';
import { CheckSquare, Square, HardHat, AlertCircle, Loader2 } from 'lucide-react';

const SiteAllocationContent = ({ site, onClose, laborers, sites, allocateLaborersToSite }) => {
  const [selectedLaborerIds, setSelectedLaborerIds] = useState(() =>
    laborers.filter((l) => l.assignedSiteId === site.id).map((l) => l.id)
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleLaborer = (id) => {
    if (isSaving) return;
    setSelectedLaborerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredLaborers = laborers.filter((l) =>
    l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.role.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (l.id && l.id.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const handleSelectAll = () => {
    if (isSaving) return;
    const allMatching = filteredLaborers.map((l) => l.id);
    const combined = Array.from(new Set([...selectedLaborerIds, ...allMatching]));
    setSelectedLaborerIds(combined);
  };

  const handleDeselectAll = () => {
    if (isSaving) return;
    setSelectedLaborerIds([]);
  };

  const reallocatedCount = laborers.filter(
    (l) => selectedLaborerIds.includes(l.id) && l.assignedSiteId && l.assignedSiteId !== site.id
  ).length;

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await allocateLaborersToSite(site.id, selectedLaborerIds);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save workforce allocations. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {error && (
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
          <span>{error}</span>
        </div>
      )}

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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {reallocatedCount > 0 ? `(${reallocatedCount} moved from other sites)` : 'Assigned Deployment'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filter workers by name, role, or EMP ID..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          disabled={isSaving}
          className="form-control"
          style={{ maxWidth: '320px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleSelectAll} disabled={isSaving}>
            Select All
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleDeselectAll} disabled={isSaving}>
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
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'background var(--transition-fast)',
                  opacity: isSaving ? 0.7 : 1
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
                      {lab.role} &bull; <span style={{ fontFamily: 'var(--font-mono)' }}>{lab.id}</span>
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
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Saving Allocation...
            </>
          ) : (
            <>
              <HardHat size={18} />
              Save Allocation ({selectedLaborerIds.length} Workers)
            </>
          )}
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
