import React, { useState } from 'react';
import { CalendarCheck, ListFilter, PlusCircle } from 'lucide-react';
import DailyAttendanceForm from './DailyAttendanceForm';
import AttendanceViewer from './AttendanceViewer';

const AttendanceModule = () => {
  const [activeSubTab, setActiveSubTab] = useState('daily'); // 'daily' | 'viewer'

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <CalendarCheck size={28} color="var(--amber-primary)" />
            Attendance & Overtime Tracking
          </h1>
          <p>Mark daily on-site muster rolls, authorize overtime task hours, and audit shift records.</p>
        </div>

        <div className="page-actions">
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeSubTab === 'daily' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('daily')}
            >
              <PlusCircle size={15} style={{ marginRight: '6px' }} />
              Daily Attendance Sheet
            </button>
            <button
              className={`tab-btn ${activeSubTab === 'viewer' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('viewer')}
            >
              <ListFilter size={15} style={{ marginRight: '6px' }} />
              Attendance History & Filter
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'daily' ? (
        <DailyAttendanceForm />
      ) : (
        <AttendanceViewer />
      )}
    </div>
  );
};

export default AttendanceModule;
