import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './RegisterForm.css';

export interface InstitutionFormData {
  institutionAddress: string;
  institutionName: string;
  metadataURI: string;
}

interface InstitutionRegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: InstitutionFormData) => void;
}

const InstitutionRegisterForm: React.FC<InstitutionRegisterFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [metadataURI, setMetadataURI] = useState('');

  const [addressError, setAddressError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when closed
      setInstitutionAddress('');
      setInstitutionName('');
      setMetadataURI('');
      setAddressError(null);
      setNameError(null);
    }
  }, [isOpen]);

  const validateForm = () => {
    let isValid = true;

    // Validate institution address
    if (!ethers.utils.isAddress(institutionAddress)) {
      setAddressError('请输入有效的以太坊地址');
      isValid = false;
    } else {
      setAddressError(null);
    }

    // Validate institution name
    if (!institutionName.trim()) {
      setNameError('院校名称不能为空');
      isValid = false;
    } else {
      setNameError(null);
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        institutionAddress,
        institutionName,
        metadataURI,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="register-form-overlay">
      <div className="register-form-container">
        <div className="register-form-header">
          <h2>🏫 注册院校</h2>
          <button className="register-form-close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="register-form-content">
          <div className="form-group">
            <label htmlFor="institutionAddress">
              院校钱包地址 <span className="required">*</span>
            </label>
            <input
              id="institutionAddress"
              type="text"
              value={institutionAddress}
              onChange={(e) => setInstitutionAddress(e.target.value)}
              placeholder="0x..."
              className={addressError ? 'input-error' : ''}
            />
            {addressError && <p className="error-message">{addressError}</p>}
            <p className="field-hint">院校的以太坊钱包地址</p>
          </div>

          <div className="form-group">
            <label htmlFor="institutionName">
              院校名称 <span className="required">*</span>
            </label>
            <input
              id="institutionName"
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="例如：北京大学"
              className={nameError ? 'input-error' : ''}
            />
            {nameError && <p className="error-message">{nameError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="metadataURI">
              元数据URI <span className="optional">(可选)</span>
            </label>
            <input
              id="metadataURI"
              type="text"
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              placeholder="ipfs://... (可选)"
            />
            <p className="field-hint">
              💡 用于存储院校额外资料（如备案号、认证文件等）的IPFS链接
            </p>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="submit-btn">
              注册院校
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionRegisterForm;

