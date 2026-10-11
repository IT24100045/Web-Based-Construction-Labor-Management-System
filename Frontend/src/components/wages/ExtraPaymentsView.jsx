import React, { useState, useMemo } from 'react';
import { useLabor } from '../../context/LaborContext';
import {
  Gift,
  Search,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Users,
  Eye,
  Trash2,
  Sparkles,
  Award,
  WalletCards,
  AlertCircle
} from 'lucide-react';
import StatCard from '../common/StatCard';
import RecordExtraPaymentModal from './RecordExtraPaymentModal';
import { EXTRA_PAYMENT_CATEGORIES } from '../../utils/constants';
import PaymentReceiptModal from './PaymentReceiptModal';

const ExtraPaymentsView = ({ onNavigateToWages }) => {
  const { extraPayments, laborers, sites, deletePaymentRecord } = useLabor();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSiteId, setSelectedSiteId] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');

  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedLaborer, setSelectedLaborer] = useState(null);
  const [receiptData, setReceiptData] = useState({ isOpen: false, payment: null, wage: null });

  // Calculate aggregates
  const totalExtraDisbursed = useMemo(() => {
    return extraPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  }, [extraPayments]);

  const totalBonuses = useMemo(() => {
    return extraPayments
      .filter((p) => {
        const cat = p.extraCategory || '';
        const notes = p.notes || '';
        return cat.toLowerCase().includes('bonus') || notes.toLowerCase().includes('bonus') || cat.toLowerCase().includes('incentive');
      })
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  }, [extraPayments]);

  const totalAdvances = useMemo(() => {
    return extraPayments
      .filter((p) => {
        const cat = p.extraCategory || '';
        const notes = p.notes || '';
        return cat.toLowerCase().includes('advance') || notes.toLowerCase().includes('advance');
      })
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  }, [extraPayments]);

  const uniqueBeneficiariesCount = useMemo(() => {
    const ids = new Set(extraPayments.map((p) => p.laborerId));
    return ids.size;
  }, [extraPayments]);

  // Filtered extra payments list
  const filteredPayments = useMemo(() => {
    return extraPayments.filter((p) => {
      const lab = laborers.find((l) => l.id === p.laborerId);
      const labName = lab ? lab.name.toLowerCase() : '';
      const labId = (p.laborerId || '').toLowerCase();
      const labRole = lab ? lab.role.toLowerCase() : '';
      const ref = (p.reference || '').toLowerCase();
      const approver = (p.approvedBy || '').toLowerCase();
      const notes = (p.notes || '').toLowerCase();
      const cat = (p.extraCategory || '').toLowerCase();

      const term = searchTerm.toLowerCase();
      const matchesSearch =
        labName.includes(term) ||
        labId.includes(term) ||
        labRole.includes(term) ||
        ref.includes(term) ||
        approver.includes(term) ||
        notes.includes(term) ||
        cat.includes(term);

      const matchesCat =
        selectedCategory === 'ALL' ||
        p.extraCategory === selectedCategory ||
        (p.notes && p.notes.includes(selectedCategory));

      const matchesSite =
        selectedSiteId === 'ALL' ||
        (lab && lab.assignedSiteId === selectedSiteId);

      const matchesMethod =
        selectedMethod === 'ALL' ||
        p.method === selectedMethod;

      return matchesSearch && matchesCat && matchesSite && matchesMethod;
    });
  }, [extraPayments, laborers, searchTerm, selectedCategory, selectedSiteId, selectedMethod]);

  const handleOpenRecordModal = (laborer = null) => {
    setSelectedLaborer(laborer);
    setIsRecordModalOpen(true);
  };

  const handleViewReceipt = (payment) => {
    const lab = laborers.find((l) => l.id === payment.laborerId);
    const assignedSite = sites.find((s) => s.id === lab?.assignedSiteId);
    setReceiptData({
      isOpen: true,
      payment,
      wage: { laborer: lab, assignedSite }
    });
  };

  const handleDelete = (payment) => {
    if (window.confirm(`Are you sure you want to mark extra payment "${payment.id}" (${payment.reference}) as deleted?`)) {
      deletePaymentRecord(payment.id);
    }
  };

  const getCategoryBadge = (category, notes = '') => {
    const cat = category || (notes.match(/\[Extra Payment(?::\s*([^\]]+))?\]/i)?.[1]) || 'Extra Allowance';

    if (cat.toLowerCase().includes('bonus') || cat.toLowerCase().includes('achievement')) {
      return (
        <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} /> {cat}
        </span>
      );
    }
    if (cat.toLowerCase().includes('advance')) {
      return (
        <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <WalletCards size={12} /> {cat}
        </span>
      );
    }
    if (cat.toLowerCase().includes('hazard') || cat.toLowerCase().includes('hardship')) {
      return (
        <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> {cat}
        </span>
      );
    }
    return (
      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Award size={12} /> {cat}
      </span>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Gift size={28} color="var(--emerald)" />
            Extra Labor Payments & Allowances
          </h1>
          <p>
            Track and disburse non-wage compensation including bonuses, salary advances, transport allowances, and hardship relief.
          </p>
        </div>
        <div className="page-actions">
          {onNavigateToWages && (
            <button
              className="btn btn-outline"
              onClick={onNavigateToWages}
              style={{ marginRight: '8px' }}
            >
              <DollarSign size={16} />
              View Standard Wages
            </button>
          )}

          <button
            className="btn"
            onClick={() => handleOpenRecordModal(null)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Gift size={18} />
            Make Extra Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<Gift size={24} />}
          label="Total Extra Disbursed"
          value={`Rs. ${totalExtraDisbursed.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext={`${extraPayments.length} special payment records`}
          color="emerald"
        />
        <StatCard
          icon={<Sparkles size={24} />}
          label="Total Bonuses Awarded"
          value={`Rs. ${totalBonuses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext="Performance & holiday incentives"
          color="amber"
        />
        <StatCard
          icon={<WalletCards size={24} />}
          label="Salary Advances"
          value={`Rs. ${totalAdvances.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext="Mid-month worker draws"
          color="purple"
        />
        <StatCard
          icon={<Users size={24} />}
          label="Beneficiary Workforce"
          value={uniqueBeneficiariesCount}
          subtext="Unique workers awarded"
          color="sky"
        />
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by worker name, EMP ID, voucher ref, supervisor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '190px' }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {EXTRA_PAYMENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
        >
          <option value="ALL">All Construction Sites</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '150px' }}
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
        >
          <option value="ALL">All Methods</option>
          <option value="Bank Transfer">Bank Wire</option>
          <option value="Cash">Cash Payout</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      {/* Extra Payments Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Voucher ID & Date</th>
              <th>Beneficiary Laborer</th>
              <th>Assigned Site</th>
              <th>Category</th>
              <th>Disbursed Amount</th>
              <th>Payment Method</th>
              <th>Authorized By</th>
              <th>Remarks / Purpose</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((p) => {
                const lab = laborers.find((l) => l.id === p.laborerId);
                const site = sites.find((s) => s.id === lab?.assignedSiteId);

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                        {p.id}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {p.date}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        {lab ? lab.name : p.laborerId}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--amber-primary)' }}>
                        {lab ? lab.role : 'Laborer'} &bull; <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{p.laborerId}</span>
                      </div>
                    </td>

                    <td>
                      {site ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                          <Building2 size={14} color="var(--sky)" />
                          <span>{site.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Central Pool</span>
                      )}
                    </td>

                    <td>
                      {getCategoryBadge(p.extraCategory, p.notes)}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--emerald)', fontSize: '0.98rem' }}>
                        Rs. {(parseFloat(p.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Ref: {p.reference}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-gray" style={{ fontSize: '0.76rem' }}>
                        <CreditCard size={12} style={{ marginRight: '4px' }} />
                        {p.method}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 500 }}>
                        {p.approvedBy}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Site Supervisor
                      </div>
                    </td>

                    <td style={{ maxWidth: '220px' }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={p.notes}
                      >
                        {p.notes || <span style={{ color: 'var(--text-muted)' }}>None recorded</span>}
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          className="btn-icon"
                          title="View Official Disbursement Voucher"
                          onClick={() => handleViewReceipt(p)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon text-rose"
                          title="Mark Extra Payment Deleted"
                          onClick={() => handleDelete(p)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <Gift size={36} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      No extra payment records found
                    </div>
                    <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto', color: 'var(--text-muted)' }}>
                      {searchTerm || selectedCategory !== 'ALL' || selectedSiteId !== 'ALL' || selectedMethod !== 'ALL'
                        ? 'Try modifying your search query or category filters.'
                        : 'Disburse special bonuses, allowances, or advances to workers by clicking "Make Extra Payment".'}
                    </p>
                    {extraPayments.length === 0 && (
                      <button
                        className="btn btn-primary"
                        style={{ marginTop: '8px' }}
                        onClick={() => handleOpenRecordModal(null)}
                      >
                        <Gift size={16} />
                        Record First Extra Payment
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Extra Payment Modal */}
      <RecordExtraPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setSelectedLaborer(null);
        }}
        laborer={selectedLaborer}
        onSuccessPayment={(saved, context) => {
          setReceiptData({
            isOpen: true,
            payment: saved,
            wage: context
          });
        }}
      />

      {/* Payment Receipt Voucher Modal */}
      <PaymentReceiptModal
        isOpen={receiptData.isOpen}
        onClose={() => setReceiptData({ isOpen: false, payment: null, wage: null })}
        payment={receiptData.payment}
        laborerWage={receiptData.wage}
      />
    </div>
  );
};

export default ExtraPaymentsView;
