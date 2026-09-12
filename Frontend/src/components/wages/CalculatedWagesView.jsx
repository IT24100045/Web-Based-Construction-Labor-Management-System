import React, { useState } from 'react';
import { useLabor } from '../../context/LaborContext';
import {
  Receipt,
  DollarSign,
  CreditCard,
  Search,
  Building2,
  Clock,
  TrendingUp,
  FileCheck,
  Eye,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import StatCard from '../common/StatCard';
import RecordPaymentModal from './RecordPaymentModal';
import PaymentReceiptModal from './PaymentReceiptModal';

const CalculatedWagesView = () => {
  const { sites, payments, getCalculatedWages } = useLabor();

  const [activeTab, setActiveTab] = useState('wages'); // 'wages' | 'history'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedLaborerForPay, setSelectedLaborerForPay] = useState(null);
  const [receiptModalData, setReceiptModalData] = useState({ isOpen: false, payment: null, wage: null });

  // Calculate wages dynamically from attendance and laborer rates
  const calculatedWages = getCalculatedWages();

  // Financial aggregates
  const totalGrossPayroll = calculatedWages.reduce((sum, w) => sum + w.grossWages, 0);
  const totalRegularPay = calculatedWages.reduce((sum, w) => sum + w.regularWages, 0);
  const totalOvertimePay = calculatedWages.reduce((sum, w) => sum + w.overtimeWages, 0);
  const totalPaidOut = calculatedWages.reduce((sum, w) => sum + w.totalPaid, 0);
  const totalOutstandingDue = calculatedWages.reduce((sum, w) => sum + w.balanceDue, 0);

  // Filtered wages
  const filteredWages = calculatedWages.filter((w) => {
    const matchesSearch =
      w.laborer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.laborer.id && w.laborer.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      w.laborer.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSite =
      selectedSiteId === 'ALL' ||
      (selectedSiteId === 'UNASSIGNED' ? !w.laborer.assignedSiteId : w.laborer.assignedSiteId === selectedSiteId);

    const matchesStatus = selectedStatus === 'ALL' || w.paymentStatus === selectedStatus;

    return matchesSearch && matchesSite && matchesStatus;
  });

  const handleOpenPayment = (laborer) => {
    setSelectedLaborerForPay(laborer);
    setIsRecordPaymentOpen(true);
  };

  const handlePaymentSuccess = (newPayment, currentWage) => {
    setReceiptModalData({
      isOpen: true,
      payment: newPayment,
      wage: currentWage
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="badge badge-emerald"><span className="badge-dot" />Paid in Full</span>;
      case 'Partial':
        return <span className="badge badge-amber"><span className="badge-dot" />Partial Payment</span>;
      default:
        return <span className="badge badge-rose"><span className="badge-dot" />Pending Payout</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Receipt size={28} color="var(--amber-primary)" />
            Calculated Wages & Payment Management
          </h1>
          <p>
            Audit shift wages, calculate 1.5x overtime compensations, and record finalized payroll disbursements.
          </p>
        </div>
        <div className="page-actions">
          <div className="tab-switcher" style={{ marginRight: '8px' }}>
            <button
              className={`tab-btn ${activeTab === 'wages' ? 'active' : ''}`}
              onClick={() => setActiveTab('wages')}
            >
              <DollarSign size={15} style={{ marginRight: '4px' }} />
              Calculated Wages
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={15} style={{ marginRight: '4px' }} />
              Disbursement History ({payments.length})
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => handleOpenPayment(null)}
          >
            <CreditCard size={18} />
            Record Payment
          </button>
        </div>
      </div>

      {/* KPI Financial Overview */}
      <div className="stats-grid">
        <StatCard
          icon={<DollarSign size={24} />}
          label="Total Calculated Payroll"
          value={`Rs. ${totalGrossPayroll.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext="Regular + 1.5x overtime"
          color="amber"
        />
        <StatCard
          icon={<Clock size={24} />}
          label="Total Regular Wages"
          value={`Rs. ${totalRegularPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext="Base standard shifts"
          color="sky"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Overtime Premium Pay"
          value={`Rs. ${totalOvertimePay.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext="1.5x contractual rate"
          color="emerald"
        />
        <StatCard
          icon={<CreditCard size={24} />}
          label="Outstanding Balance Due"
          value={`Rs. ${totalOutstandingDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext={`Rs. ${totalPaidOut.toLocaleString(undefined, { minimumFractionDigits: 2 })} disbursed`}
          color={totalOutstandingDue > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {activeTab === 'wages' ? (
        <>
          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={18} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by worker name, EMP ID, or trade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '180px' }}
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
            >
              <option value="ALL">All Construction Sites</option>
              <option value="UNASSIGNED">Unassigned Pool</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '160px' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="Paid">Paid in Full</option>
              <option value="Partial">Partial Payment</option>
              <option value="Pending">Pending Payout</option>
            </select>
          </div>

          {/* Detailed Calculated Wages Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Laborer & Trade</th>
                  <th>Assigned Site</th>
                  <th>Regular Hours</th>
                  <th>Regular Rate</th>
                  <th>Regular Wages</th>
                  <th>OT Hours</th>
                  <th>OT Rate (1.5x)</th>
                  <th>OT Wages</th>
                  <th>Total Gross Wage</th>
                  <th>Disbursed</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWages.length === 0 ? (
                  <tr>
                    <td colSpan="13" style={{ textAlign: 'center', padding: '42px', color: 'var(--text-muted)' }}>
                      No wage calculation records match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWages.map((item) => {
                    const { laborer, assignedSite } = item;

                    return (
                      <tr key={laborer.id}>
                        <td>
                          <div className="worker-avatar-cell">
                            <div className="worker-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                              {laborer.name.charAt(0)}
                            </div>
                            <div className="worker-name-block">
                              <span className="worker-name" style={{ fontSize: '0.88rem' }}>{laborer.name}</span>
                              <span className="worker-nic">{laborer.role}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {assignedSite ? (
                            <span style={{ fontSize: '0.82rem', color: '#fff' }}>{assignedSite.name}</span>
                          ) : (
                            <span className="badge badge-gray">Unassigned</span>
                          )}
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {item.totalRegularHours} hrs
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          Rs. {item.hourlyRate.toFixed(2)}/hr
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          Rs. {item.regularWages.toFixed(2)}
                        </td>

                        <td>
                          {item.totalOvertimeHours > 0 ? (
                            <span className="ot-badge">{item.totalOvertimeHours} hrs</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>0 hrs</span>
                          )}
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber-light)' }}>
                          Rs. {item.overtimeRate.toFixed(2)}/hr
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--amber-light)' }}>
                          Rs. {item.overtimeWages.toFixed(2)}
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                          Rs. {item.grossWages.toFixed(2)}
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald)' }}>
                          Rs. {item.totalPaid.toFixed(2)}
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: item.balanceDue > 0 ? 'var(--rose)' : 'var(--emerald)' }}>
                          Rs. {item.balanceDue.toFixed(2)}
                        </td>

                        <td>{getStatusBadge(item.paymentStatus)}</td>

                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                              onClick={() => handleOpenPayment(laborer)}
                              title="Disburse payment to laborer"
                            >
                              <DollarSign size={13} /> Pay
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
        </>
      ) : (
        /* Payment Disbursement History */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Voucher ID</th>
                <th>Disbursement Date</th>
                <th>Laborer</th>
                <th>Payment Method</th>
                <th>Reference ID</th>
                <th>Disbursed Amount</th>
                <th>Authorized Officer</th>
                <th>Remarks</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '42px', color: 'var(--text-muted)' }}>
                    No finalized payments recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const laborer = calculatedWages.find((w) => w.laborer.id === p.laborerId)?.laborer;
                  const wage = calculatedWages.find((w) => w.laborer.id === p.laborerId);

                  return (
                    <tr key={p.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--amber-primary)' }}>
                          {p.id}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{p.date}</td>
                      <td>
                        <strong style={{ color: '#fff' }}>{laborer ? laborer.name : p.laborerId}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{laborer ? laborer.role : ''}</div>
                      </td>
                      <td>
                        <span className="badge badge-sky">{p.method}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{p.reference}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--emerald)', fontSize: '0.95rem' }}>
                          Rs. {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{p.approvedBy}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px' }}>{p.notes || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setReceiptModalData({ isOpen: true, payment: p, wage })}
                            title="View Payment Voucher" /* Sprint 2: Restore "View / Print Payment Voucher" when printing is enabled */
                          >
                            <FileCheck size={14} /> Voucher
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
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setSelectedLaborerForPay(null);
        }}
        laborer={selectedLaborerForPay}
        onSuccessPayment={handlePaymentSuccess}
      />

      {/* Payment Receipt / Voucher Modal */}
      <PaymentReceiptModal
        isOpen={receiptModalData.isOpen}
        onClose={() => setReceiptModalData({ isOpen: false, payment: null, wage: null })}
        payment={receiptModalData.payment}
        laborerWage={receiptModalData.wage}
      />
    </div>
  );
};

export default CalculatedWagesView;
