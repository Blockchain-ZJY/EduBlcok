import React from 'react';
import './Modal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  showCancel = true
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className={`modal-title ${type}`}>
            {type === 'success' && '✅'}
            {type === 'error' && '❌'}
            {type === 'warning' && '⚠️'}
            {type === 'info' && 'ℹ️'}
            {title}
          </h3>
          {onCancel && (
            <button className="modal-close" onClick={onCancel}>×</button>
          )}
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
          
          <div className="modal-actions">
            {showCancel && onCancel && (
              <button 
                className="modal-btn cancel" 
                onClick={onCancel}
                onKeyDown={handleKeyDown}
              >
                {cancelText}
              </button>
            )}
            <button 
              className={`modal-btn confirm ${type}`}
              onClick={onConfirm}
              onKeyDown={handleKeyDown}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
