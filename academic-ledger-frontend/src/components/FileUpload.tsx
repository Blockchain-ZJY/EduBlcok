import React, { useState, useRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // MB
  label?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '*/*',
  maxSize = 10,
  label = '选择文件',
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // 检查文件大小
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `文件大小超过限制 (最大 ${maxSize}MB)`;
    }

    // 检查文件类型
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const mimeType = file.type;

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileType === type.toLowerCase();
        }
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return mimeType.startsWith(baseType);
        }
        return mimeType === type;
      });

      if (!isAccepted) {
        return `不支持的文件类型。允许的类型: ${accept}`;
      }
    }

    return null;
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = event.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="file-input-hidden"
        disabled={disabled}
      />

      <div
        className={`file-upload-area ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="upload-icon">📁</div>
        
        {selectedFile ? (
          <div className="file-info">
            <div className="file-name">📄 {selectedFile.name}</div>
            <div className="file-size">{formatFileSize(selectedFile.size)}</div>
            <button
              type="button"
              className="clear-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              disabled={disabled}
            >
              ✕ 清除
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <p className="prompt-text">{label}</p>
            <p className="prompt-hint">点击选择或拖拽文件到此处</p>
            <p className="prompt-limit">最大文件大小: {maxSize}MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="file-upload-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

