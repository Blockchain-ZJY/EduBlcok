import React, { useState, useEffect } from 'react';
import './Modal.css';

interface InputModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  type?: 'text' | 'textarea';
  required?: boolean;
}

const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  onConfirm,
  onCancel,
  type = 'text',
  required = false
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (required && !value.trim()) {
      return;
    }
    onConfirm(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
          <form onSubmit={handleSubmit}>
            {type === 'textarea' ? (
              <textarea
                className="modal-input textarea"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                onKeyDown={handleKeyDown}
                rows={4}
                autoFocus
              />
            ) : (
              <input
                type="text"
                className="modal-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            )}
            
            <div className="modal-actions">
              <button type="button" className="modal-btn cancel" onClick={onCancel}>
                取消
              </button>
              <button 
                type="submit" 
                className="modal-btn confirm"
                disabled={required && !value.trim()}
              >
                确认
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputModal;
