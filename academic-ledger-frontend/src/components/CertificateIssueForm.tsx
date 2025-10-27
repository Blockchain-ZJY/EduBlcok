import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import './CertificateIssueForm.css';

interface CertificateIssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CertificateFormData) => void;
  uploadedFile: File | null;
  onFileSelect: (file: File | null) => void;
  ipfsConnected: boolean;
}

export interface CertificateFormData {
  studentAddress: string;
  program: string;
  level: string;
  expiresAt: string;
  description: string;
}

export const CertificateIssueForm: React.FC<CertificateIssueFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  uploadedFile,
  onFileSelect,
  ipfsConnected
}) => {
  const [formData, setFormData] = useState<CertificateFormData>({
    studentAddress: '',
    program: '',
    level: '',
    expiresAt: '0',
    description: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (field: keyof CertificateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.studentAddress.trim()) {
      newErrors.studentAddress = '请输入学生钱包地址';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.studentAddress)) {
      newErrors.studentAddress = '请输入有效的以太坊地址格式';
    }

    if (!formData.program.trim()) {
      newErrors.program = '请输入专业名称';
    }

    if (!formData.level.trim()) {
      newErrors.level = '请输入学位层级';
    }

    if (!formData.expiresAt.trim()) {
      newErrors.expiresAt = '请输入过期时间（输入0表示永久有效）';
    } else if (isNaN(Number(formData.expiresAt))) {
      newErrors.expiresAt = '过期时间必须是数字';
    }

    if (!uploadedFile) {
      newErrors.file = '请上传证书文档（图片或PDF）';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      // 重置表单
      setFormData({
        studentAddress: '',
        program: '',
        level: '',
        expiresAt: '0',
        description: ''
      });
      onFileSelect(null);
    }
  };

  const handleClose = () => {
    setFormData({
      studentAddress: '',
      program: '',
      level: '',
      expiresAt: '0',
      description: ''
    });
    setErrors({});
    onFileSelect(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cert-form-overlay" onClick={handleClose}>
      <div className="cert-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="cert-form-header">
          <div className="cert-form-title">
            <span className="cert-form-icon">📜</span>
            <h2>颁发证书</h2>
          </div>
          <button className="cert-form-close" onClick={handleClose}>✕</button>
        </div>

        {!ipfsConnected && (
          <div className="cert-form-warning">
            ⚠️ IPFS未连接，请先配置Pinata API密钥
          </div>
        )}

        <form onSubmit={handleSubmit} className="cert-form-body">
          {/* 学生地址 */}
          <div className="cert-form-field">
            <label htmlFor="studentAddress">
              <span className="field-icon">👤</span>
              学生钱包地址 <span className="required">*</span>
            </label>
            <input
              id="studentAddress"
              type="text"
              value={formData.studentAddress}
              onChange={(e) => handleChange('studentAddress', e.target.value)}
              placeholder="0x..."
              className={errors.studentAddress ? 'error' : ''}
            />
            {errors.studentAddress && <span className="error-text">{errors.studentAddress}</span>}
          </div>

          {/* 专业名称 */}
          <div className="cert-form-field">
            <label htmlFor="program">
              <span className="field-icon">📚</span>
              专业名称 <span className="required">*</span>
            </label>
            <input
              id="program"
              type="text"
              value={formData.program}
              onChange={(e) => handleChange('program', e.target.value)}
              placeholder="例如：计算机科学"
              className={errors.program ? 'error' : ''}
            />
            {errors.program && <span className="error-text">{errors.program}</span>}
          </div>

          {/* 学位层级 */}
          <div className="cert-form-field">
            <label htmlFor="level">
              <span className="field-icon">🎓</span>
              学位层级 <span className="required">*</span>
            </label>
            <select
              id="level"
              value={formData.level}
              onChange={(e) => handleChange('level', e.target.value)}
              className={errors.level ? 'error' : ''}
            >
              <option value="">请选择学位层级</option>
              <option value="学士">学士</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
              <option value="其他">其他</option>
            </select>
            {errors.level && <span className="error-text">{errors.level}</span>}
          </div>

          {/* 有效期 */}
          <div className="cert-form-field">
            <label htmlFor="expiresAt">
              <span className="field-icon">⏰</span>
              有效期 <span className="required">*</span>
            </label>
            <select
              id="expiresAt"
              value={formData.expiresAt}
              onChange={(e) => handleChange('expiresAt', e.target.value)}
              className={errors.expiresAt ? 'error' : ''}
            >
              <option value="0">永久有效</option>
              <option value={Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60}>1年</option>
              <option value={Math.floor(Date.now() / 1000) + 3 * 365 * 24 * 60 * 60}>3年</option>
              <option value={Math.floor(Date.now() / 1000) + 5 * 365 * 24 * 60 * 60}>5年</option>
              <option value={Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60}>10年</option>
            </select>
            {errors.expiresAt && <span className="error-text">{errors.expiresAt}</span>}
          </div>

          {/* 证书描述 */}
          <div className="cert-form-field">
            <label htmlFor="description">
              <span className="field-icon">📝</span>
              证书描述（可选）
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="输入证书的详细描述..."
              rows={3}
            />
          </div>

          {/* 文件上传 */}
          <div className="cert-form-field">
            <label>
              <span className="field-icon">📎</span>
              上传证书文档 <span className="required">*</span>
            </label>
            <FileUpload
              onFileSelect={onFileSelect}
              accept="image/*,.pdf"
              maxSize={10}
              label={uploadedFile ? `已选择: ${uploadedFile.name}` : "选择图片或PDF文件"}
              disabled={!ipfsConnected}
            />
            {uploadedFile && (
              <div className="file-preview">
                <span className="file-name">✓ {uploadedFile.name}</span>
                <span className="file-size">({(uploadedFile.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}
            {errors.file && <span className="error-text">{errors.file}</span>}
          </div>

          {/* 表单按钮 */}
          <div className="cert-form-actions">
            <button type="button" onClick={handleClose} className="btn-cancel">
              取消
            </button>
            <button type="submit" className="btn-submit" disabled={!ipfsConnected}>
              {ipfsConnected ? '颁发证书' : 'IPFS未连接'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

