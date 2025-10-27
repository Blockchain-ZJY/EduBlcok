import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './RegisterForm.css';

export interface StudentFormData {
  studentAddress: string;
  studentName: string;
  studentId: string;
  metadataURI: string;
}

interface StudentRegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: StudentFormData) => void;
}

const StudentRegisterForm: React.FC<StudentRegisterFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [studentAddress, setStudentAddress] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [metadataURI, setMetadataURI] = useState('');

  const [addressError, setAddressError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when closed
      setStudentAddress('');
      setStudentName('');
      setStudentId('');
      setMetadataURI('');
      setAddressError(null);
      setNameError(null);
      setIdError(null);
    }
  }, [isOpen]);

  const validateForm = () => {
    let isValid = true;

    // Validate student address
    if (!ethers.utils.isAddress(studentAddress)) {
      setAddressError('请输入有效的以太坊地址');
      isValid = false;
    } else {
      setAddressError(null);
    }

    // Validate student name
    if (!studentName.trim()) {
      setNameError('学生姓名不能为空');
      isValid = false;
    } else {
      setNameError(null);
    }

    // Validate student ID
    if (!studentId.trim()) {
      setIdError('学号不能为空');
      isValid = false;
    } else {
      setIdError(null);
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        studentAddress,
        studentName,
        studentId,
        metadataURI,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="register-form-overlay">
      <div className="register-form-container">
        <div className="register-form-header">
          <h2>👤 注册学生</h2>
          <button className="register-form-close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="register-form-content">
          <div className="form-group">
            <label htmlFor="studentAddress">
              学生钱包地址 <span className="required">*</span>
            </label>
            <input
              id="studentAddress"
              type="text"
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
              placeholder="0x..."
              className={addressError ? 'input-error' : ''}
            />
            {addressError && <p className="error-message">{addressError}</p>}
            <p className="field-hint">学生的以太坊钱包地址</p>
          </div>

          <div className="form-group">
            <label htmlFor="studentName">
              学生姓名 <span className="required">*</span>
            </label>
            <input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="例如：张三"
              className={nameError ? 'input-error' : ''}
            />
            {nameError && <p className="error-message">{nameError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="studentId">
              学号 <span className="required">*</span>
            </label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="例如：2021001234"
              className={idError ? 'input-error' : ''}
            />
            {idError && <p className="error-message">{idError}</p>}
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
              💡 用于存储学生额外资料（如照片、档案JSON）的IPFS链接
            </p>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="submit-btn">
              注册学生
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegisterForm;

