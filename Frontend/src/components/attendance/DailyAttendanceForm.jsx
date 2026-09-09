import React, { useState } from 'react';
import { useLabor } from '../../context/LaborContext';
import {
  CalendarCheck,
  Building2,
  Calendar,
  Clock,
  Save,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

// Subcomponent keyed by siteId & date to initialize clean local state without useEffect
const DailyAttendanceSheet = ({
  site,
  siteId,
  date,
  siteWorkers,
  attendance,
  onSave
}) => {
  // Initialize state once per site/date selection
  const [attendanceSheet, setAttendanceSheet] = useState(() => {
    const sheet = {};
    siteWorkers.forEach((worker) => {
      const existing = attendance.find(
        (a) => a.laborerId === worker.id && a.date === date
      );

      if (existing) {
        sheet[worker.id] = {
          status: existing.status || 'Present',
          regularHours: existing.regularHours !== undefined ? existing.regularHours : 8,
          overtimeHours: existing.overtimeHours !== undefined ? existing.overtimeHours : 0,
          otReason: existing.otReason || '',
          supervisorNotes: existing.supervisorNotes || ''
        };
      } else {
        sheet[worker.id] = {
          status: 'Present',
          regularHours: 8,
          overtimeHours: 0,
          otReason: '',
          supervisorNotes: ''
        };
      }
    });
    return sheet;
  });

  const handleStatusChange = (workerId, newStatus) => {
    let reg = 8;
    if (newStatus === 'Absent' || newStatus === 'Leave') reg = 0;
    else if (newStatus === 'Half-Day') reg = 4;

    setAttendanceSheet((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        status: newStatus,
        regularHours: reg,
        overtimeHours: (newStatus === 'Absent' || newStatus === 'Leave') ? 0 : prev[workerId]?.overtimeHours || 0
      }
    }));
  };

  const handleFieldChange = (workerId, field, value) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        [field]: value
      }
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    siteWorkers.forEach((worker) => {
      let reg = status === 'Present' ? 8 : (status === 'Half-Day' ? 4 : 0);
      updated[worker.id] = {
        ...attendanceSheet[worker.id],
        status: status,
        regularHours: reg,
        overtimeHours: (status === 'Absent' || status === 'Leave') ? 0 : attendanceSheet[worker.id]?.overtimeHours || 0
      };
    });
    setAttendanceSheet(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const recordsToSave = siteWorkers.map((worker) => {
      const data = attendanceSheet[worker.id] || { status: 'Present', regularHours: 8, overtimeHours: 0 };
      return {
        laborerId: worker.id,
        siteId: siteId,
        date: date,
        status: data.status,
        regularHours: parseFloat(data.regularHours) || 0,
        overtimeHours: parseFloat(data.overtimeHours) || 0,
        otReason: data.otReason || '',
        supervisorNotes: data.supervisorNotes || ''
      };
    });

    onSave(recordsToSave);
  };

  // Metrics calculation
  const totalSiteWorkers = siteWorkers.length;
  const presentCount = siteWorkers.filter((w) => attendanceSheet[w.id]?.status === 'Present').length;
  const absentCount = siteWorkers.filter((w) => attendanceSheet[w.id]?.status === 'Absent').length;
  const halfDayCount = siteWorkers.filter((w) => attendanceSheet[w.id]?.status === 'Half-Day').length;
  const totalRegHours = siteWorkers.reduce((acc, w) => acc + (parseFloat(attendanceSheet[w.id]?.regularHours) || 0), 0);
  const totalOtHours = siteWorkers.reduce((acc, w) => acc + (parseFloat(attendanceSheet[w.id]?.overtimeHours) || 0), 0);

  if (siteWorkers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
        <AlertTriangle size={32} color="var(--amber-primary)" style={{ margin: '0 auto 8px' }} />
        <p style={{ fontWeight: 600 }}>No laborers are currently allocated to {site?.name || 'this site'}.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
          Go to <strong>Site Allocation & Projects</strong> to allocate laborers to this site first.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Batch Actions & Summary Bar */}
      <div className="attendance-summary-banner">
        <div className="summary-metric">
          <span className="summary-metric-num" style={{ color: '#fff' }}>{totalSiteWorkers}</span>
          <span className="summary-metric-label">Allocated Crew</span>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />
        <div className="summary-metric">
          <span className="summary-metric-num" style={{ color: 'var(--emerald)' }}>{presentCount}</span>
          <span className="summary-metric-label">Present</span>
        </div>
        <div className="summary-metric">
          <span className="summary-metric-num" style={{ color: 'var(--rose)' }}>{absentCount}</span>
          <span className="summary-metric-label">Absent</span>
        </div>
        <div className="summary-metric">
          <span className="summary-metric-num" style={{ color: 'var(--amber-light)' }}>{halfDayCount}</span>
          <span className="summary-metric-label">Half-Day</span>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />
        <div className="summary-metric">
          <span className="summary-metric-num" style={{ color: 'var(--sky)' }}>{totalRegHours} hrs</span>
          <span className="summary-metric-label">Regular Hours</span>
        </div>
        <div className="summary-metric">
          <span className="summary-metric-num" style={{ color: 'var(--amber-primary)' }}>{totalOtHours} hrs</span>
          <span className="summary-metric-label">Overtime Hours</span>
        </div>

        {/* Fast bulk actions */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleMarkAll('Present')}
          >
            <Check size={14} color="var(--emerald)" /> Mark All Present
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleMarkAll('Absent')}
          >
            <X size={14} color="var(--rose)" /> Mark All Absent
          </button>
        </div>
      </div>

      {/* Worker Attendance Sheet */}
      <form onSubmit={handleSubmit}>
        <div className="table-container" style={{ marginBottom: '18px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tradesman</th>
                <th>Trade Role</th>
                <th>Attendance Status</th>
                <th>Regular (Hrs)</th>
                <th>Overtime (Hrs)</th>
                <th>Overtime Task / Reason</th>
                <th>Supervisor Notes</th>
              </tr>
            </thead>
            <tbody>
              {siteWorkers.map((worker) => {
                const data = attendanceSheet[worker.id] || {
                  status: 'Present',
                  regularHours: 8,
                  overtimeHours: 0,
                  otReason: '',
                  supervisorNotes: ''
                };

                return (
                  <tr key={worker.id}>
                    <td>
                      <div className="worker-avatar-cell">
                        <div className="worker-avatar">{worker.name.charAt(0)}</div>
                        <div className="worker-name-block">
                          <span className="worker-name">{worker.name}</span>
                          <span className="worker-nic">{worker.nic}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{worker.role}</strong>
                    </td>

                    <td>
                      <div className="status-toggle-group">
                        <button
                          type="button"
                          className={`status-toggle-btn ${data.status === 'Present' ? 'active-present' : ''}`}
                          onClick={() => handleStatusChange(worker.id, 'Present')}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          className={`status-toggle-btn ${data.status === 'Half-Day' ? 'active-halfday' : ''}`}
                          onClick={() => handleStatusChange(worker.id, 'Half-Day')}
                        >
                          Half-Day
                        </button>
                        <button
                          type="button"
                          className={`status-toggle-btn ${data.status === 'Absent' ? 'active-absent' : ''}`}
                          onClick={() => handleStatusChange(worker.id, 'Absent')}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          className={`status-toggle-btn ${data.status === 'Leave' ? 'active-leave' : ''}`}
                          onClick={() => handleStatusChange(worker.id, 'Leave')}
                        >
                          Leave
                        </button>
                      </div>
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="16"
                        className="hours-input"
                        value={data.regularHours}
                        onChange={(e) => handleFieldChange(worker.id, 'regularHours', e.target.value)}
                        disabled={data.status === 'Absent' || data.status === 'Leave'}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="12"
                        className="hours-input"
                        style={{
                          color: parseFloat(data.overtimeHours) > 0 ? 'var(--amber-primary)' : 'var(--text-primary)',
                          borderColor: parseFloat(data.overtimeHours) > 0 ? 'var(--amber-primary)' : 'var(--border-subtle)'
                        }}
                        value={data.overtimeHours}
                        onChange={(e) => handleFieldChange(worker.id, 'overtimeHours', e.target.value)}
                        disabled={data.status === 'Absent' || data.status === 'Leave'}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        placeholder={parseFloat(data.overtimeHours) > 0 ? "e.g. Concrete pour overtime..." : "None"}
                        className="form-control"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minWidth: '180px' }}
                        value={data.otReason}
                        onChange={(e) => handleFieldChange(worker.id, 'otReason', e.target.value)}
                        disabled={data.status === 'Absent' || data.status === 'Leave'}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        placeholder="Supervisor remarks..."
                        className="form-control"
                        style={{ fontSize: '0.82rem', padding: '6px 10px', minWidth: '150px' }}
                        value={data.supervisorNotes}
                        onChange={(e) => handleFieldChange(worker.id, 'supervisorNotes', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            className="btn btn-primary"
          >
            <Save size={18} />
            Save Daily Attendance Sheet ({date})
          </button>
        </div>
      </form>
    </>
  );
};

const DailyAttendanceForm = () => {
  const { sites, laborers, attendance, recordAttendance } = useLabor();

  // Selected site and date
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Site laborers
  const siteWorkers = laborers.filter((l) => l.assignedSiteId === selectedSiteId);
  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  return (
    <div className="card" style={{ marginBottom: '32px' }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="card-title">
            <CalendarCheck size={22} color="var(--amber-primary)" />
            Daily Site Attendance & Overtime Logger
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '3px' }}>
            Record on-site presence, shifts, and authorized overtime hours for the construction crew.
          </p>
        </div>

        {/* Site & Date Selectors */}
        <div className="attendance-selectors">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} color="var(--amber-primary)" />
            <select
              className="form-control"
              style={{ minWidth: '220px' }}
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--sky)" />
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Keyed child component: cleanly resets state when selectedSiteId or selectedDate changes without useEffect cascading renders */}
      <DailyAttendanceSheet
        key={`${selectedSiteId}_${selectedDate}`}
        site={selectedSite}
        siteId={selectedSiteId}
        date={selectedDate}
        siteWorkers={siteWorkers}
        attendance={attendance}
        onSave={recordAttendance}
      />
    </div>
  );
};

export default DailyAttendanceForm;
