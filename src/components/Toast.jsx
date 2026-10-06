import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ============ TOAST CONTEXT ============
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// ============ TOAST PROVIDER ============
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// ============ TOAST CONTAINER ============
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px',
    }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// ============ INDIVIDUAL TOAST ============
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const styles = {
    success: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', icon: <CheckCircle size={18} color="#059669" /> },
    error:   { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: <XCircle size={18} color="#dc2626" /> },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: <AlertTriangle size={18} color="#d97706" /> },
    info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: <Info size={18} color="#2563eb" /> },
  };

  const s = styles[toast.type] || styles.info;

  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: '10px',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      color: s.text,
      fontSize: '13px',
      fontWeight: 600,
      animation: 'slideInRight 0.3s ease-out',
      minWidth: '300px',
    }}>
      <div style={{ marginTop: '1px' }}>{s.icon}</div>
      <div style={{ flex: 1 }}>{toast.message}</div>
      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.text, opacity: 0.5, padding: 0 }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastProvider;
