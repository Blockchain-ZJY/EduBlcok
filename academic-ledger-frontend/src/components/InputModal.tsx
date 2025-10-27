import React, { useState, useEffect, useRef } from 'react';
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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      // 延迟聚焦以确保动画完成
      setTimeout(() => {
        if (type === 'textarea') {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, defaultValue, type]);

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

  // 确定输入类型的图标
  const getInputIcon = () => {
    if (placeholder?.includes('地址')) return '📍';
    if (placeholder?.includes('名称') || placeholder?.includes('姓名')) return '✏️';
    if (placeholder?.includes('学号') || placeholder?.includes('ID')) return '🎫';
    if (placeholder?.includes('URI') || placeholder?.includes('链接')) return '🔗';
    if (placeholder?.includes('时间') || placeholder?.includes('日期')) return '📅';
    if (placeholder?.includes('哈希')) return '🔐';
    return '✍️';
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container input-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-modern">
          <div className="modal-title-wrapper">
            <div className="modal-icon info">
              ✍️
            </div>
            <h3 className="modal-title-modern info">{title}</h3>
          </div>
          <button className="modal-close-modern" onClick={onCancel}>
            <span>✕</span>
          </button>
        </div>
        
        <div className="modal-body-modern">
          <p className="modal-message-modern">{message}</p>
          
          <form onSubmit={handleSubmit} className="input-form-modern">
            <div className={`input-wrapper-modern ${isFocused ? 'focused' : ''}`}>
              <div className="input-icon-modern">
                {getInputIcon()}
              </div>
              
              {type === 'textarea' ? (
                <textarea
                  ref={textareaRef}
                  className="modal-input-modern textarea"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  rows={5}
                />
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  className="modal-input-modern"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              )}
              
              {value && (
                <button
                  type="button"
                  className="clear-button-modern"
                  onClick={() => setValue('')}
                  tabIndex={-1}
                >
                  ✕
                </button>
              )}
              
              <div className="input-border-animation"></div>
            </div>
            
            {required && (
              <div className="input-hint-modern">
                {value.trim() ? (
                  <span className="hint-success">✓ 输入有效</span>
                ) : (
                  <span className="hint-required">* 此项为必填项</span>
                )}
              </div>
            )}
            
            <div className="modal-actions-modern">
              <button 
                type="button" 
                className="modal-btn-modern cancel" 
                onClick={onCancel}
              >
                <span className="btn-icon">↩</span>
                取消
              </button>
              <button 
                type="submit" 
                className="modal-btn-modern confirm info"
                disabled={required && !value.trim()}
              >
                <span className="btn-icon">✓</span>
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
