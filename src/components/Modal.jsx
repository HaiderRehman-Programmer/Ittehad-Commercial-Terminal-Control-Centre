import React, { useState, useEffect, createContext, useContext } from 'react';
import { X } from 'lucide-react';

// ============ MODAL CONTEXT ============
/**
 * @typedef {Object} ModalContextType
 * @property {(title: string, content: React.ReactNode, size?: string) => void} openModal
 * @property {() => void} closeModal
 */

/** @type {React.Context<ModalContextType | null>} */
const ModalContext = createContext(null);

/** @returns {ModalContextType} */
export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};

// ============ MODAL PROVIDER ============
export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({ open: false, title: '', content: null, size: 'md' });

  const openModal = (title, content, size = 'md') => {
    setModal({ open: true, title, content, size });
  };

  const closeModal = () => {
    setModal({ open: false, title: '', content: null, size: 'md' });
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modal.open && (
        <ModalOverlay title={modal.title} size={modal.size} onClose={closeModal}>
          {modal.content}
        </ModalOverlay>
      )}
    </ModalContext.Provider>
  );
};

// ============ MODAL OVERLAY ============
const ModalOverlay = ({ title, children, onClose, size }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const sizeMap = { sm: '420px', md: '560px', lg: '720px', xl: '900px' };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: sizeMap[size] || sizeMap.md,
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        animation: 'scaleIn 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6', border: 'none', borderRadius: '8px',
              width: '32px', height: '32px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#6b7280',
            }}
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalProvider;
