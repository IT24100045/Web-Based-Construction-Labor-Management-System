import React from 'react';
import { useLabor } from '../../context/LaborContext';
import {
  Users,
  Building2,
  CalendarCheck,
  Receipt,
  ArrowUpRight,
  HardHat,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import StatCard from '../common/StatCard';

const OverviewDashboard = ({ onNavigate, onOpenAddLaborer, onOpenAddSite }) => {
  const { laborers, sites, attendance, getCalculatedWages } = useLabor();

  const totalLaborers = laborers.length;
  const assignedLaborers = laborers.filter((l) => l.assignedSiteId).length;
  const activeSites = sites.filter((s) => s.status === 'Active').length;

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === today);
  const presentToday = todayAttendance.filter((a) => a.status === 'Present' || a.status === 'Half-Day').length;
  const attendanceRate = totalLaborers > 0 ? ((presentToday / totalLaborers) * 100).toFixed(0) : 0;

  const calculatedWages = getCalculatedWages();
  const totalPayrollGross = calculatedWages.reduce((sum, w) => sum + w.grossWages, 0);
  const totalBalanceDue = calculatedWages.reduce((sum, w) => sum + w.balanceDue, 0);

  // Top overtime workers
  const overtimeWorkers = [...calculatedWages]
    .filter((w) => w.totalOvertimeHours > 0)
    .sort((a, b) => b.totalOvertimeHours - a.totalOvertimeHours)
    .slice(0, 4);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <HardHat size={30} color="var(--amber-primary)" />
            Construction Operations Command Center
          </h1>
          <p>Real-time oversight of site workforce deployments, daily muster shifts, and payroll disbursements.</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={onOpenAddSite}>
            <Building2 size={16} /> New Project Site
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('attendance')}>
            <CalendarCheck size={16} /> Mark Attendance
          </button>
          <button className="btn btn-primary btn-sm" onClick={onOpenAddLaborer}>
            <UserPlus size={16} /> Register Laborer
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          icon={<Users size={24} />}
          label="Total Workforce"
          value={totalLaborers}
          subtext={`${assignedLaborers} allocated to active sites`}
          color="amber"
        />
        <StatCard
          icon={<Building2 size={24} />}
          label="Active Site Projects"
          value={activeSites}
          subtext={`${sites.length} total registered sites`}
          color="sky"
        />
        <StatCard
          icon={<CalendarCheck size={24} />}
          label="Today's Attendance Rate"
          value={`${attendanceRate}%`}
          subtext={`${presentToday} of ${totalLaborers} workers on duty`}
          color="emerald"
        />
        <StatCard
          icon={<Receipt size={24} />}
          label="Outstanding Payroll"
          value={`Rs. ${totalBalanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext={`From Rs. ${totalPayrollGross.toLocaleString(undefined, { minimumFractionDigits: 2 })} total gross`}
          color={totalBalanceDue > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Active Sites Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Building2 size={18} color="var(--sky)" /> Active Construction Sites
            </h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate('sites')}
            >
              View All Sites <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sites.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '24px' }}>
                No construction sites registered yet. Click &ldquo;New Project Site&rdquo; above to add one.
              </p>
            ) : (
              sites.slice(0, 3).map((site) => {
                const siteWorkers = laborers.filter((l) => l.assignedSiteId === site.id);
                return (
                  <div
                    key={site.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'var(--bg-card-alt)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{site.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span style={{ color: 'var(--amber-primary)', fontFamily: 'var(--font-mono)' }}>{site.code}</span>
                        <span>&bull;</span>
                        <span>{site.location ? site.location.split(',')[0] : 'No location specified'}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-amber">
                        <Users size={12} /> {siteWorkers.length} Workers
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {site.manager ? (site.manager.split(' ')[1] || site.manager) : 'No manager'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Overtime Hotspots */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} color="var(--amber-primary)" /> Overtime Hours Hotspot
            </h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate('wages')}
            >
              Wage Breakdown <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {overtimeWorkers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '24px' }}>
                No overtime hours logged for current cycle.
              </p>
            ) : (
              overtimeWorkers.map((item) => (
                <div
                  key={item.laborer.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-card-alt)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="worker-avatar-cell">
                    <div className="worker-avatar" style={{ width: '32px', height: '32px', fontSize: '0.78rem' }}>
                      {item.laborer.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{item.laborer.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{item.laborer.role}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="ot-badge">
                      <Clock size={12} /> {item.totalOvertimeHours} hrs OT
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontFamily: 'var(--font-mono)', marginTop: '3px' }}>
                      +Rs. {item.overtimeWages.toFixed(2)} premium
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Launchpad */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          <TrendingUp size={18} color="var(--amber-primary)" /> Sprint 1 Operations Launchpad
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div
            onClick={() => onNavigate('laborers')}
            style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
          >
            <div style={{ color: 'var(--amber-primary)', marginBottom: '8px' }}><Users size={22} /></div>
            <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Labor Directory</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Search {totalLaborers} profiles, edit info, and verify NICs.
            </p>
          </div>

          <div
            onClick={() => onNavigate('sites')}
            style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
          >
            <div style={{ color: 'var(--sky)', marginBottom: '8px' }}><Building2 size={22} /></div>
            <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Site Allocation</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Allocate crews across {sites.length} construction sites.
            </p>
          </div>

          <div
            onClick={() => onNavigate('attendance')}
            style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
          >
            <div style={{ color: 'var(--emerald)', marginBottom: '8px' }}><CalendarCheck size={22} /></div>
            <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Daily Attendance</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Mark on-site muster rolls and capture overtime hours.
            </p>
          </div>

          <div
            onClick={() => onNavigate('wages')}
            style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
          >
            <div style={{ color: 'var(--purple)', marginBottom: '8px' }}><Receipt size={22} /></div>
            <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Wages & Payroll</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Calculate regular & OT earnings, disburse payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
