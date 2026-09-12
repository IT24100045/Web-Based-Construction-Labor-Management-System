import React, { useState, useMemo } from 'react';
import { useLabor } from '../../context/LaborContext';
import {
  CalendarCheck,
  Search,
  Filter,
  Calendar,
  Building2,
  Users,
  Clock,
  Edit2,
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';
import StatCard from '../common/StatCard';
import EditAttendanceModal from './EditAttendanceModal';

const AttendanceViewer = () => {
  const { attendance, laborers, sites, deleteAttendanceRecord } = useLabor();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLaborerId, setSelectedLaborerId] = useState('ALL');
  const [selectedSiteId, setSelectedSiteId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  // Modal
  const [editingRecord, setEditingRecord] = useState(null);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return attendance.filter((rec) => {
      const laborer = laborers.find((l) => l.id === rec.laborerId);
      const site = sites.find((s) => s.id === rec.siteId);

      const matchesSearch =
        (laborer && laborer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (laborer && laborer.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (site && site.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rec.otReason && rec.otReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rec.date.includes(searchTerm);

      const matchesLaborer = selectedLaborerId === 'ALL' || rec.laborerId === selectedLaborerId;
      const matchesSite = selectedSiteId === 'ALL' || rec.siteId === selectedSiteId;
      const matchesStatus = selectedStatus === 'ALL' || rec.status === selectedStatus;
      const matchesDate = !filterDate || rec.date === filterDate;

      return matchesSearch && matchesLaborer && matchesSite && matchesStatus && matchesDate;
    });
  }, [attendance, laborers, sites, searchTerm, selectedLaborerId, selectedSiteId, selectedStatus, filterDate]);

  // Aggregate metrics
  const totalLogs = filteredRecords.length;
  const presentCount = filteredRecords.filter((r) => r.status === 'Present' || r.status === 'Half-Day').length;
  const presentRate = totalLogs > 0 ? ((presentCount / totalLogs) * 100).toFixed(1) : 0;
  const totalRegHrs = filteredRecords.reduce((sum, r) => sum + (r.regularHours || 0), 0);
  const totalOtHrs = filteredRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

  const handleDelete = (rec) => {
    const lab = laborers.find((l) => l.id === rec.laborerId);
    if (window.confirm(`Delete attendance log for ${lab ? lab.name : rec.laborerId} on ${rec.date}?`)) {
      deleteAttendanceRecord(rec.id);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Laborer ID', 'Laborer Name', 'Role', 'Site Code', 'Site Name', 'Status', 'Regular Hours', 'Overtime Hours', 'OT Reason', 'Supervisor Notes'];
    const rows = filteredRecords.map((r) => {
      const lab = laborers.find((l) => l.id === r.laborerId);
      const s = sites.find((site) => site.id === r.siteId);
      return [
        r.date,
        r.laborerId,
        `"${lab ? lab.name : ''}"`,
        `"${lab ? lab.role : ''}"`,
        s ? s.code : '',
        `"${s ? s.name : ''}"`,
        r.status,
        r.regularHours,
        r.overtimeHours,
        `"${r.otReason || ''}"`,
        `"${r.supervisorNotes || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JAL_Enterprises_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="badge badge-emerald"><span className="badge-dot" />Present</span>;
      case 'Half-Day':
        return <span className="badge badge-amber"><span className="badge-dot" />Half-Day</span>;
      case 'Absent':
        return <span className="badge badge-rose"><span className="badge-dot" />Absent</span>;
      case 'Leave':
        return <span className="badge badge-purple"><span className="badge-dot" />Leave</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div>
      {/* Attendance Stats Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<CalendarCheck size={24} />}
          label="Total Attendance Records"
          value={totalLogs}
          subtext="Filtered log count"
          color="amber"
        />
        <StatCard
          icon={<Users size={24} />}
          label="Workforce Presence Rate"
          value={`${presentRate}%`}
          subtext={`${presentCount} present/half-day`}
          color="emerald"
        />
        <StatCard
          icon={<Clock size={24} />}
          label="Total Regular Hours"
          value={`${totalRegHrs} hrs`}
          subtext="Base contractual shifts"
          color="sky"
        />
        <StatCard
          icon={<Clock size={24} />}
          label="Total Overtime Hours"
          value={`${totalOtHrs} hrs`}
          subtext="1.5x pay multiplier"
          color="purple"
        />
      </div>

      {/* Filter and Query Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Search records by worker, EMP ID, site, or overtime reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Laborer Selector */}
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '170px' }}
          value={selectedLaborerId}
          onChange={(e) => setSelectedLaborerId(e.target.value)}
        >
          <option value="ALL">All Laborers</option>
          {laborers.map((lab) => (
            <option key={lab.id} value={lab.id}>{lab.name} ({lab.role})</option>
          ))}
        </select>

        {/* Site Selector */}
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '170px' }}
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
        >
          <option value="ALL">All Sites</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>

        {/* Status Selector */}
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '130px' }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="Present">Present</option>
          <option value="Half-Day">Half-Day</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          className="form-control"
          style={{ width: 'auto' }}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          title="Filter by exact date"
        />

        <button
          className="btn btn-secondary btn-sm"
          onClick={exportCSV}
          title="Export filtered records to CSV file"
        >
          <Download size={15} />
          Export CSV
        </button>

        {(searchTerm || selectedLaborerId !== 'ALL' || selectedSiteId !== 'ALL' || selectedStatus !== 'ALL' || filterDate) && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedLaborerId('ALL');
              setSelectedSiteId('ALL');
              setSelectedStatus('ALL');
              setFilterDate('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Attendance Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Laborer Details</th>
              <th>Site & Project</th>
              <th>Status</th>
              <th>Regular (Hrs)</th>
              <th>Overtime (Hrs)</th>
              <th>Overtime Scope / Notes</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '42px 20px', color: 'var(--text-muted)' }}>
                  <CalendarCheck size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontWeight: 600 }}>No attendance records match your query.</p>
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const laborer = laborers.find((l) => l.id === rec.laborerId);
                const site = sites.find((s) => s.id === rec.siteId);

                return (
                  <tr key={rec.id}>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff' }}>
                        {rec.date}
                      </div>
                    </td>

                    <td>
                      {laborer ? (
                        <div className="worker-avatar-cell">
                          <div className="worker-avatar" style={{ width: '32px', height: '32px', fontSize: '0.78rem' }}>
                            {laborer.name.charAt(0)}
                          </div>
                          <div>
                            <span className="worker-name" style={{ fontSize: '0.88rem' }}>{laborer.name}</span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              {laborer.role}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>{rec.laborerId}</span>
                      )}
                    </td>

                    <td>
                      {site ? (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#fff' }}>{site.name}</div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--amber-primary)' }}>
                            {site.code}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>{rec.siteId}</span>
                      )}
                    </td>

                    <td>{getStatusBadge(rec.status)}</td>

                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {rec.regularHours} hrs
                      </span>
                    </td>

                    <td>
                      {rec.overtimeHours > 0 ? (
                        <span className="ot-badge">
                          <Clock size={12} /> {rec.overtimeHours} hrs (1.5x)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      {rec.otReason && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--amber-light)' }}>
                          OT: {rec.otReason}
                        </div>
                      )}
                      {rec.supervisorNotes && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Note: {rec.supervisorNotes}
                        </div>
                      )}
                      {!rec.otReason && !rec.supervisorNotes && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          title="Correct Attendance Record"
                          onClick={() => setEditingRecord(rec)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ color: 'var(--rose)' }}
                          title="Delete Attendance Record"
                          onClick={() => handleDelete(rec)}
                        >
                          <Trash2 size={15} />
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

      {/* Edit Attendance Modal */}
      <EditAttendanceModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        record={editingRecord}
      />
    </div>
  );
};

export default AttendanceViewer;
