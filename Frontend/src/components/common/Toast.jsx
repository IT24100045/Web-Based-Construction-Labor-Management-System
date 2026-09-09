import React from 'react';
import { useLabor } from '../../context/LaborContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = () => {
  const { toasts, removeToast } = useLabor();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#10b981" />;
      case 'error':
        return <AlertCircle size={18} color="#f43f5e" />;
      default:
        return <Info size={18} color="#f59e0b" />;
    }
  };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type || 'success'}`}>
          <div style={{ marginTop: '2px', flexShrink: 0 }}>
            {getIcon(toast.type)}
          </div>
          <div style={{ flex: 1, fontSize: '0.88rem', lineHeight: '1.4' }}>
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Dismiss toast"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
