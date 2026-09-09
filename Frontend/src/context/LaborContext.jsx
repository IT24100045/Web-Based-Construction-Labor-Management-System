/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  laborersApi,
  sitesApi,
  attendanceApi,
  paymentsApi
} from '../services/api';

const LaborContext = createContext();

export const LaborProvider = ({ children }) => {
  // Live state connected to TiDB Cloud
  const [laborers, setLaborers] = useState([]);
  const [sites, setSites] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Toast dispatch
  const showToast = (message, type = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Manual refresh handler
  const refreshAllData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [labs, stes, atts, pays] = await Promise.all([
        laborersApi.getAll(),
        sitesApi.getAll(),
        attendanceApi.getAll(),
        paymentsApi.getAll()
      ]);
      setLaborers(labs);
      setSites(stes);
      setAttendance(atts);
      setPayments(pays);
    } catch (err) {
      console.error('Failed to load data from database:', err);
      setFetchError(err.message);
      showToast(`Database: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    let ignore = false;

    Promise.all([
      laborersApi.getAll(),
      sitesApi.getAll(),
      attendanceApi.getAll(),
      paymentsApi.getAll()
    ])
      .then(([labs, stes, atts, pays]) => {
        if (!ignore) {
          setLaborers(labs);
          setSites(stes);
          setAttendance(atts);
          setPayments(pays);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load data from database:', err);
          setFetchError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // --- Laborer Actions ---
  const addLaborer = async (laborerData) => {
    try {
      const created = await laborersApi.create(laborerData);
      setLaborers((prev) => [created, ...prev]);
      showToast(`Laborer "${created.name}" registered successfully.`);
      return created;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const updateLaborer = async (id, updatedFields) => {
    try {
      const updated = await laborersApi.update(id, updatedFields);
      setLaborers((prev) => prev.map((lab) => (lab.id === id ? updated : lab)));
      showToast(`Laborer profile updated successfully.`);
      return updated;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const deleteLaborer = async (id) => {
    try {
      await laborersApi.delete(id);
      setLaborers((prev) => prev.filter((l) => l.id !== id));
      setAttendance((prev) => prev.filter((a) => a.laborerId !== id));
      setPayments((prev) => prev.filter((p) => p.laborerId !== id));
      showToast(`Laborer removed from directory.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // --- Site Actions ---
  const addSite = async (siteData) => {
    try {
      const created = await sitesApi.create(siteData);
      setSites((prev) => [created, ...prev]);
      showToast(`Construction site "${created.name}" registered successfully.`);
      return created;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const updateSite = async (id, updatedFields) => {
    try {
      const updated = await sitesApi.update(id, updatedFields);
      setSites((prev) => prev.map((s) => (s.id === id ? updated : s)));
      showToast(`Site project details updated.`);
      return updated;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const deleteSite = async (id) => {
    try {
      await sitesApi.delete(id);
      setSites((prev) => prev.filter((s) => s.id !== id));
      setLaborers((prev) =>
        prev.map((l) => (l.assignedSiteId === id ? { ...l, assignedSiteId: null } : l))
      );
      showToast(`Project site record deleted.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const allocateLaborersToSite = async (siteId, laborerIds) => {
    try {
      const res = await sitesApi.allocate(siteId, laborerIds);
      if (res.laborers) {
        setLaborers(res.laborers);
      } else {
        setLaborers((prev) =>
          prev.map((lab) => {
            if (laborerIds.includes(lab.id)) return { ...lab, assignedSiteId: siteId };
            if (lab.assignedSiteId === siteId) return { ...lab, assignedSiteId: null };
            return lab;
          })
        );
      }
      showToast(`Site workforce allocation updated.`);
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // --- Attendance Actions ---
  const recordAttendance = async (records) => {
    try {
      const savedList = await attendanceApi.record(records);
      setAttendance((prev) => {
        let updated = [...prev];
        savedList.forEach((rec) => {
          const index = updated.findIndex(
            (item) => item.laborerId === rec.laborerId && item.date === rec.date
          );
          if (index >= 0) {
            updated[index] = rec;
          } else {
            updated.unshift(rec);
          }
        });
        return updated;
      });
      showToast(`Daily attendance saved for ${savedList.length} worker(s).`);
      return savedList;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const updateAttendanceRecord = async (id, updatedFields) => {
    try {
      const updated = await attendanceApi.update(id, updatedFields);
      setAttendance((prev) => prev.map((rec) => (rec.id === id ? updated : rec)));
      showToast(`Attendance record updated.`);
      return updated;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const deleteAttendanceRecord = async (id) => {
    try {
      await attendanceApi.delete(id);
      setAttendance((prev) => prev.filter((rec) => rec.id !== id));
      showToast(`Attendance record removed.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // --- Payment Actions ---
  const recordPayment = async (paymentData) => {
    try {
      const created = await paymentsApi.record(paymentData);
      setPayments((prev) => [created, ...prev]);
      showToast(`Payment of Rs. ${created.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} recorded successfully.`);
      return created;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Helper to compute calculated wages per laborer
  const getCalculatedWages = (filterDateRange = null) => {
    return laborers.map((laborer) => {
      // Filter laborer's attendance records
      const laborerAttendance = attendance.filter((rec) => {
        if (rec.laborerId !== laborer.id) return false;
        if (filterDateRange) {
          if (filterDateRange.startDate && rec.date < filterDateRange.startDate) return false;
          if (filterDateRange.endDate && rec.date > filterDateRange.endDate) return false;
        }
        return true;
      });

      const totalRegularHours = laborerAttendance.reduce((acc, rec) => acc + (parseFloat(rec.regularHours) || 0), 0);
      const totalOvertimeHours = laborerAttendance.reduce((acc, rec) => acc + (parseFloat(rec.overtimeHours) || 0), 0);
      const daysWorked = laborerAttendance.filter((rec) => rec.status === 'Present' || rec.status === 'Half-Day').length;

      const hourlyRate = parseFloat(laborer.hourlyRate) || 1200.00;
      const overtimeRate = hourlyRate * 1.5; // Standard 1.5x OT multiplier

      const regularWages = totalRegularHours * hourlyRate;
      const overtimeWages = totalOvertimeHours * overtimeRate;
      const grossWages = regularWages + overtimeWages;

      // Filter laborer's payments
      const laborerPayments = payments.filter((p) => p.laborerId === laborer.id);
      const totalPaid = laborerPayments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
      const balanceDue = Math.max(0, grossWages - totalPaid);

      let paymentStatus = 'Pending';
      if (totalPaid >= grossWages && grossWages > 0) {
        paymentStatus = 'Paid';
      } else if (totalPaid > 0 && balanceDue > 0) {
        paymentStatus = 'Partial';
      }

      const assignedSite = sites.find((s) => s.id === laborer.assignedSiteId);

      return {
        laborer,
        assignedSite,
        daysWorked,
        totalRegularHours,
        totalOvertimeHours,
        hourlyRate,
        overtimeRate,
        regularWages,
        overtimeWages,
        grossWages,
        totalPaid,
        balanceDue,
        paymentStatus,
        attendanceCount: laborerAttendance.length
      };
    });
  };

  return (
    <LaborContext.Provider
      value={{
        laborers,
        sites,
        attendance,
        payments,
        toasts,
        isLoading,
        fetchError,
        refreshAllData,
        showToast,
        removeToast,
        addLaborer,
        updateLaborer,
        deleteLaborer,
        addSite,
        updateSite,
        deleteSite,
        allocateLaborersToSite,
        recordAttendance,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        recordPayment,
        getCalculatedWages
      }}
    >
      {children}
    </LaborContext.Provider>
  );
};

export const useLabor = () => {
  const context = useContext(LaborContext);
  if (!context) {
    throw new Error('useLabor must be used within a LaborProvider');
  }
  return context;
};
