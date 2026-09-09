import React from 'react';
import Modal from '../common/Modal';
import { Printer, CheckCircle2, Building2, HardHat } from 'lucide-react';

const PaymentReceiptModal = ({ isOpen, onClose, payment, laborerWage }) => {
  if (!isOpen || !payment) return null;

  const laborer = laborerWage?.laborer;
  const site = laborerWage?.assignedSite;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Payment Disbursement Voucher"
      maxWidth="680px"
    >
      <div className="payment-receipt">
        <div className="receipt-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
            <HardHat size={26} color="var(--amber-primary)" />
            <span className="receipt-logo">BUILDFORCE CONSTRUCTION</span>
          </div>
          <div className="receipt-tagline">Labor Payroll & Compensation Voucher</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            VOUCHER ID: {payment.id} &bull; ISSUED: {payment.date}
          </div>
        </div>

        <div className="receipt-details-grid">
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>RECIPIENT / TRADESMAN</div>
            <strong style={{ fontSize: '1rem', color: '#fff' }}>{laborer ? laborer.name : payment.laborerId}</strong>
            <div style={{ color: 'var(--amber-primary)', fontSize: '0.82rem' }}>{laborer ? laborer.role : ''}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              NIC: {laborer ? laborer.nic : 'N/A'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>SITE DEPLOYMENT</div>
            <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{site ? site.name : 'Central Field Operations'}</strong>
            <div style={{ color: 'var(--sky)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              {site ? site.code : 'PRJ-GEN'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              Method: <strong>{payment.method}</strong>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Shift Operations Summary
          </div>
          <div className="receipt-row">
            <span>Regular Shift Hours ({laborerWage?.totalRegularHours || 0} hrs @ Rs. {laborer?.hourlyRate.toFixed(2)}/hr)</span>
            <span className="currency">Rs. {(laborerWage?.regularWages || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="receipt-row">
            <span>Overtime Shift Hours ({laborerWage?.totalOvertimeHours || 0} hrs @ 1.5x Rs. {((laborer?.hourlyRate || 0) * 1.5).toFixed(2)}/hr)</span>
            <span className="currency">Rs. {(laborerWage?.overtimeWages || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="receipt-row" style={{ fontWeight: 700, color: '#fff' }}>
            <span>Total Gross Calculated Wages</span>
            <span className="currency">Rs. {(laborerWage?.grossWages || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="receipt-total-highlight">
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Disbursed Payment Amount
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ref: <span style={{ fontFamily: 'var(--font-mono)' }}>{payment.reference}</span>
            </div>
          </div>
          <div className="receipt-total-amount">
            Rs. {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        {payment.notes && (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', marginBottom: '14px' }}>
            <strong>Remarks:</strong> {payment.notes}
          </div>
        )}

        <div className="receipt-signature-block">
          <div className="signature-line">
            <div style={{ fontWeight: 600, color: '#fff' }}>{payment.approvedBy}</div>
            <div>Authorizing Site In-Charge</div>
          </div>
          <div className="signature-line">
            <div style={{ fontWeight: 600, color: '#fff' }}>{laborer?.name || 'Tradesman'}</div>
            <div>Laborer Signature / Stamp</div>
          </div>
        </div>
      </div>

      <div className="modal-footer" style={{ margin: '16px -24px -24px -24px' }}>
        <button type="button" className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Print Official Voucher
        </button>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
};

export default PaymentReceiptModal;
