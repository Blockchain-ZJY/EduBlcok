import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AcademicLedgerContract, NETWORK_CONFIG } from '../contracts/AcademicLedger';
import InputModal from './InputModal';
import ConfirmModal from './ConfirmModal';
import { CertificateIssueForm, CertificateFormData } from './CertificateIssueForm';
import InstitutionRegisterForm, { InstitutionFormData } from './InstitutionRegisterForm';
import StudentRegisterForm, { StudentFormData } from './StudentRegisterForm';
import { pinataService, FileMetadata } from '../utils/pinataService';
import './ContractInterface.css';

// 角色类型定义
type UserRole = 'admin' | 'institution' | 'student' | 'visitor';

const ContractInterface: React.FC = () => {
  const [contract, setContract] = useState<AcademicLedgerContract | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [userRole, setUserRole] = useState<UserRole>('visitor');
  const [userName, setUserName] = useState<string>('');
  const [ipfsConnected, setIpfsConnected] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false);
  const [certFormOpen, setCertFormOpen] = useState(false);
  const [institutionFormOpen, setInstitutionFormOpen] = useState(false);
  const [studentFormOpen, setStudentFormOpen] = useState(false);

  // 模态框状态
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    placeholder?: string;
    defaultValue?: string;
    type?: 'text' | 'textarea';
    required?: boolean;
    onConfirm?: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    defaultValue: '',
    type: 'text',
    required: false
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
    ipfsUri?: string;
    documentType?: 'image' | 'pdf' | 'other';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // 检测用户角色
  const detectUserRole = async (contractInstance: AcademicLedgerContract, userAccount: string) => {
    try {
      // 检查是否是管理员
      const isAdmin = await contractInstance.hasRole(
        '0x0000000000000000000000000000000000000000000000000000000000000000', // DEFAULT_ADMIN_ROLE
        userAccount
      );
      
      if (isAdmin) {
        setUserRole('admin');
        setUserName('系统管理员');
        return;
      }

      // 检查是否是院校
      const institutionRoleHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('INSTITUTION_ROLE'));
      const isInstitution = await contractInstance.hasRole(institutionRoleHash, userAccount);
      
      if (isInstitution) {
        try {
          const instInfo = await contractInstance.getInstitution(userAccount);
          if (instInfo.name && instInfo.name.trim().length > 0) {
            setUserRole('institution');
            setUserName(instInfo.name);
            return;
          }
        } catch (e) {
          console.error('获取院校信息失败:', e);
        }
      }

      // 检查是否是学生
      try {
        const studentInfo = await contractInstance.getStudent(userAccount);
        if (studentInfo.name && studentInfo.name.trim().length > 0) {
          setUserRole('student');
          setUserName(studentInfo.name);
          return;
        }
      } catch (e) {
        console.error('获取学生信息失败:', e);
      }

      // 默认为访客
      setUserRole('visitor');
      setUserName('访客');
    } catch (error) {
      console.error('检测角色失败:', error);
      setUserRole('visitor');
      setUserName('访客');
    }
  };

  // 测试IPFS连接
  useEffect(() => {
    const testIPFSConnection = async () => {
      try {
        const connected = await pinataService.testAuthentication();
        setIpfsConnected(connected);
        if (connected) {
          console.log('✅ IPFS (Pinata) 连接成功');
        } else {
          console.warn('⚠️ IPFS (Pinata) 连接失败，请检查API密钥配置');
        }
      } catch (error) {
        console.error('IPFS连接测试失败:', error);
        setIpfsConnected(false);
      }
    };

    testIPFSConnection();
  }, []);

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        
        const contractInstance = new AcademicLedgerContract(provider);
        
        // 检查网络
        if (!(await contractInstance.checkNetwork())) {
          await contractInstance.switchNetwork();
        }
        
        // 获取余额
        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(balance));
        
        setContract(contractInstance);
        setAccount(accounts[0]);
        setIsConnected(true);

        // 检测用户角色
        await detectUserRole(contractInstance, accounts[0]);
      } else {
        alert('请安装 MetaMask!');
      }
    } catch (error: any) {
      console.error('连接钱包失败:', error);
      alert('连接失败: ' + error.message);
    }
  };

  // 切换账户
  const switchAccount = async () => {
    if (loading) {
      showConfirmModal('提示', '当前操作正在处理中，请稍后再试', () => {}, 'warning');
      return;
    }
    
    try {
      if (typeof window.ethereum !== 'undefined') {
        setLoading(true);
        
        try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
        
        await connectWallet();
        } catch (err: any) {
          if (err.code === -32002) {
            showConfirmModal('提示', '切换账户请求已发送，请在 MetaMask 中完成操作', () => {}, 'info');
          } else {
            throw err;
          }
        } finally {
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('切换账户失败:', error);
      showConfirmModal('错误', '切换账户失败: ' + error.message, () => {}, 'error');
      setLoading(false);
    }
  };

  // 断开钱包
  const disconnectWallet = () => {
    setContract(null);
    setAccount('');
    setIsConnected(false);
    setBalance('0');
    setUserRole('visitor');
    setUserName('');
    showConfirmModal('提示', '已断开钱包连接', () => {}, 'info');
  };

  // 模态框辅助函数
  const showInputModal = (
    title: string,
    message: string,
    onConfirm: (value: string) => void,
    options?: { placeholder?: string; defaultValue?: string; type?: 'text' | 'textarea'; required?: boolean }
  ) => {
    setInputModal({
      isOpen: true,
      title,
      message,
      placeholder: options?.placeholder || '',
      defaultValue: options?.defaultValue || '',
      type: options?.type || 'text',
      required: options?.required !== false,
      onConfirm
    });
  };

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    ipfsUri?: string,
    documentType?: 'image' | 'pdf' | 'other'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      ipfsUri,
      documentType
    });
  };

  const closeModals = () => {
    setInputModal({ ...inputModal, isOpen: false });
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // ========== 管理员功能 ==========

  // 注册院校
  const registerInstitution = async () => {
    if (!contract) return;
    setInstitutionFormOpen(true);
  };

  const handleInstitutionFormSubmit = async (formData: InstitutionFormData) => {
    if (!contract) return;

    setLoading(true);
    setInstitutionFormOpen(false);

    try {
      const tx = await contract.registerInstitution(
        formData.institutionAddress,
        formData.institutionName,
        formData.metadataURI
      );
      await tx.wait();
      showConfirmModal('成功', `院校「${formData.institutionName}」注册成功！`, () => {}, 'success');
    } catch (error: any) {
      console.error('注册失败:', error);
      showConfirmModal('错误', '注册失败: ' + (error.message || '未知错误'), () => {}, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 注册学生
  const registerStudent = async () => {
    if (!contract) return;
    setStudentFormOpen(true);
  };

  const handleStudentFormSubmit = async (formData: StudentFormData) => {
    if (!contract) return;

    setLoading(true);
    setStudentFormOpen(false);

    try {
      const tx = await contract.registerStudent(
        formData.studentAddress,
        formData.studentName,
        formData.studentId,
        formData.metadataURI
      );
      await tx.wait();
      showConfirmModal('成功', `学生「${formData.studentName}」(${formData.studentId}) 注册成功！`, () => {}, 'success');
    } catch (error: any) {
      console.error('注册失败:', error);
      showConfirmModal('错误', '注册失败: ' + (error.message || '未知错误'), () => {}, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== 院校功能 ==========

  // 处理证书表单提交（新的统一接口）
  const handleCertificateFormSubmit = async (formData: CertificateFormData) => {
    if (!contract || !account || !uploadedFile) return;

    setCertFormOpen(false);
    setLoading(true);
    setUploadingToIPFS(true);

    try {
      // 1. 上传文件到IPFS
      console.log('📤 开始上传文件到IPFS...');
      const fileResult = await pinataService.uploadFile(uploadedFile, {
        name: `${formData.studentAddress.substring(0, 10)}-certificate-document`,
        keyvalues: {
          student: formData.studentAddress.substring(0, 10),
          type: 'certificate-document'
        }
      });
      const uploadedFileIPFS = fileResult.IpfsHash;
      console.log('✅ 文件上传成功:', uploadedFileIPFS);

      // 2. 上传元数据到IPFS
      console.log('📤 开始上传元数据到IPFS...');
      let studentInfo;
      try {
        studentInfo = await contract.getStudent(formData.studentAddress);
      } catch (e) {
        console.log('学生未注册，使用默认信息');
      }

      const metadata: FileMetadata = {
        studentName: studentInfo?.name || '未知',
        studentId: studentInfo?.studentId || '',
        institutionName: userName,
        program: formData.program,
        level: formData.level,
        issuedDate: new Date().toISOString(),
        description: formData.description,
        documentIPFS: uploadedFileIPFS
      };

      const metadataHash = await pinataService.uploadCertificateMetadata(metadata);
      console.log('✅ 元数据上传成功:', metadataHash);

      setUploadingToIPFS(false);

      // 3. 在区块链上颁发证书
      console.log('⛓️ 开始在区块链上颁发证书...');
      console.log('📷 图片文件IPFS哈希:', uploadedFileIPFS);
      console.log('📄 元数据JSON IPFS哈希:', metadataHash);
      
      const ipfsUri = `ipfs://${uploadedFileIPFS}`;  // 使用图片的哈希
      console.log('✅ 将要存储到合约的URI:', ipfsUri);
      
      // 生成文档哈希（使用IPFS哈希作为输入）
      const docHashBytes32 = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(uploadedFileIPFS)
      );
      console.log('📝 生成的文档哈希:', docHashBytes32);

      console.log('📤 调用合约参数:');
      console.log('  - studentAddress:', formData.studentAddress);
      console.log('  - program:', formData.program);
      console.log('  - level:', formData.level);
      console.log('  - expiresAt:', parseInt(formData.expiresAt) || 0);
      console.log('  - uri:', ipfsUri);
      console.log('  - docHash:', docHashBytes32);

      const tx = await contract.issueCertificate(
        formData.studentAddress,
        formData.program,
        formData.level,
        parseInt(formData.expiresAt) || 0,
        ipfsUri,  // 这里存储图片文件的IPFS URI
        docHashBytes32  // 文档哈希（基于IPFS哈希生成）
      );

      const receipt = await tx.wait();

      // 从事件中获取证书ID
      const event = receipt.events?.find((e: any) => e.event === 'CertificateIssued');
      const certId = event?.args?.id?.toString() || '未知';

      console.log('✅ 证书颁发成功！证书ID:', certId);

      showConfirmModal(
        '成功',
        `证书颁发成功！\n\n证书ID: ${certId}\n学生: ${formData.studentAddress}\n专业: ${formData.program}\n学位: ${formData.level}\n\n文档已上传到IPFS`,
        () => {},
        'success'
      );

      // 清空上传的文件
      setUploadedFile(null);

    } catch (error: any) {
      console.error('❌ 颁发证书失败:', error);
      showConfirmModal(
        '错误',
        '颁发证书失败:\n' + (error.message || '未知错误'),
        () => {},
        'error'
      );
      setUploadingToIPFS(false);
    } finally {
      setLoading(false);
    }
  };

  // ========== 院校功能（查看自己颁发的证书）==========
  
  // 查询我颁发的证书（院校专用）
  const getMyInstitutionCertificates = async () => {
    if (!contract || !account) return;
    
    setLoading(true);
    try {
      // 获取院校信息
      let institutionInfo = null;
      try {
        institutionInfo = await contract.getInstitution(account);
        console.log('院校信息:', institutionInfo);
      } catch (e) {
        console.log('院校未注册或获取失败');
      }
      
      // 获取证书ID列表
      const certificateIds = await contract.getCertificatesByInstitution(account);
      console.log('获取到证书ID列表:', certificateIds);
      
      // 如果没有证书
      if (certificateIds.length === 0) {
        if (institutionInfo) {
          showConfirmModal('提示', `您的院校「${institutionInfo.name}」暂未颁发证书`, () => {}, 'info');
        } else {
          showConfirmModal('提示', '暂未颁发证书', () => {}, 'info');
        }
        setLoading(false);
        return;
      }
      
      // 构建标题和院校基本信息
      let message = '╔══════════════════════════╗\n';
      message += '      我颁发的证书列表\n';
      message += '╚══════════════════════════╝\n\n';
      
      if (institutionInfo) {
        message += '🏫 院校信息\n';
        message += '━━━━━━━━━━━━━━━━━━━━━━\n';
        message += `院校名称: ${institutionInfo.name}\n`;
        message += '\n';
      }
      
      message += `📚 共颁发 ${certificateIds.length} 份证书\n`;
      message += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
      
      // 获取每个证书的详细信息
      for (let i = 0; i < certificateIds.length; i++) {
        const certId = certificateIds[i];
        
        try {
          const certData = await contract.getCertificate(certId);
          
          message += `【证书 ${i + 1}】\n`;
          message += '━━━━━━━━━━━━━━━━━━━━━━\n';
          message += `证书ID: ${certData.id}\n`;
          message += `专业: ${certData.program || '未填写'}\n`;
          message += `学位: ${certData.level || '未填写'}\n`;
          
          // 格式化签发时间
          let issueDate = '未知';
          try {
            issueDate = new Date(certData.issuedAt * 1000).toLocaleDateString('zh-CN', {
              year: 'numeric', month: '2-digit', day: '2-digit'
            });
          } catch (e) {
            issueDate = '未知';
          }
          message += `签发时间: ${issueDate}\n`;
          
          // 格式化有效期
          let expireText = '未知';
          try {
            expireText = certData.expiresAt === 0 ? '永久有效' : 
                       new Date(certData.expiresAt * 1000).toLocaleDateString('zh-CN', {
                         year: 'numeric', month: '2-digit', day: '2-digit'
                       });
          } catch (e) {
            expireText = '未知';
          }
          message += `有效期: ${expireText}\n`;
          
          // 获取学生信息
          message += '\n👤 学生信息:\n';
          try {
            const studentInfo = await contract.getStudent(certData.student);
            message += `  姓名: ${studentInfo.name}\n`;
            if (studentInfo.studentId && studentInfo.studentId.trim().length > 0) {
              message += `  学号: ${studentInfo.studentId}\n`;
            }
            message += `  地址: ${certData.student}\n`;
            if (studentInfo.registeredAt > 0) {
              const regDate = new Date(studentInfo.registeredAt * 1000).toLocaleDateString('zh-CN', {
                year: 'numeric', month: '2-digit', day: '2-digit'
              });
              message += `  注册时间: ${regDate}\n`;
            }
            if (studentInfo.metadataURI && studentInfo.metadataURI.trim().length > 0) {
              message += `  元数据: ${studentInfo.metadataURI}\n`;
            }
          } catch (e) {
            message += `  ⚠️ 学生未注册\n`;
            message += `  地址: ${certData.student}\n`;
          }
          
          // 如果有IPFS URI，添加图片预览标记
          if (certData.uri && certData.uri.trim().length > 0) {
            const uri = certData.uri.trim();
            // 检查是否是有效的IPFS URI
            if (uri.startsWith('ipfs://') || uri.startsWith('baf') || uri.startsWith('Qm')) {
              message += `[IPFS_IMAGE:${uri}]\n`;
              console.log(`✅ 院校证书 ${i + 1} 添加图片预览:`, uri);
            }
          }
          
          message += '\n';
          
        } catch (error: any) {
          message += `【证书 ${i + 1}】\n`;
          message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
          message += `证书ID: ${certId}\n`;
          message += `⚠️ 获取证书详情失败\n\n`;
          console.error(`获取证书 ${certId} 详情失败:`, error);
        }
      }
      
      // 图片预览已经嵌入到每个证书中了，不需要单独传递
      console.log('✅ 已为所有有效院校证书嵌入图片预览');
      showConfirmModal('我的证书列表', message, () => {}, 'info');
      
    } catch (error: any) {
      console.error('查询失败:', error);
      showConfirmModal('错误', '查询失败: ' + (error.message || '未知错误'), () => {}, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== 学生功能 ==========
  
  // 查询我的证书
  const getMyCertificates = async () => {
    if (!contract || !account) return;
    
    setLoading(true);
    try {
      // 获取学生信息
      let studentInfo = null;
      try {
        studentInfo = await contract.getStudent(account);
        console.log('学生信息:', studentInfo);
      } catch (e) {
        console.log('学生未注册或获取失败');
      }
      
      // 获取证书ID列表
      const certificateIds = await contract.getCertificatesByStudent(account);
      console.log('获取到证书ID列表:', certificateIds);
      
      // 如果没有证书
      if (certificateIds.length === 0) {
        showConfirmModal('提示', '您暂无证书', () => {}, 'info');
        setLoading(false);
        return;
      }
      
      // 构建简洁的信息（使用表格式布局）
      let message = '';
      
      // 学生基本信息
      if (studentInfo) {
        message += '👤 学生信息\n';
        message += '━━━━━━━━━━━━━━━━━━━━━━\n';
        message += `姓名: ${studentInfo.name}\n`;
        if (studentInfo.studentId && studentInfo.studentId.trim().length > 0) {
          message += `学号: ${studentInfo.studentId}\n`;
        }
        message += `地址: ${account}\n`;
        if (studentInfo.registeredAt > 0) {
          const regDate = new Date(studentInfo.registeredAt * 1000).toLocaleDateString('zh-CN', {
            year: 'numeric', month: '2-digit', day: '2-digit'
          });
          message += `注册时间: ${regDate}\n`;
        }
        message += '\n';
      }
      
      message += `📚 证书数量: ${certificateIds.length}\n`;
      message += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
      
      // 获取每个证书的详细信息（简化显示）
      for (let i = 0; i < certificateIds.length; i++) {
        const certId = certificateIds[i];
        
        try {
          const certData = await contract.getCertificate(certId);
          
          message += `【证书 ${i + 1}】\n`;
          message += '━━━━━━━━━━━━━━━━━━━━━━\n';
          message += `证书ID: ${certData.id}\n`;
          message += `专业: ${certData.program || '未填写'}\n`;
          message += `学位: ${certData.level || '未填写'}\n`;
          
          // 格式化签发时间
          let issueDate = '未知';
          try {
            issueDate = new Date(certData.issuedAt * 1000).toLocaleDateString('zh-CN', {
              year: 'numeric', month: '2-digit', day: '2-digit'
            });
          } catch (e) {
            issueDate = '未知';
          }
          message += `签发时间: ${issueDate}\n`;
          
          // 格式化有效期
          let expireText = '未知';
          try {
            expireText = certData.expiresAt === 0 ? '永久有效' : 
                       new Date(certData.expiresAt * 1000).toLocaleDateString('zh-CN', {
                         year: 'numeric', month: '2-digit', day: '2-digit'
                       });
          } catch (e) {
            expireText = '未知';
          }
          message += `有效期: ${expireText}\n`;
          
          // 获取签发院校信息
          try {
            const institutionInfo = await contract.getInstitution(certData.institution);
            message += `签发院校: ${institutionInfo.name}\n`;
          } catch (e) {
            message += `院校地址: ${certData.institution}\n`;
          }
          
          // 如果有IPFS URI，添加图片预览标记
          if (certData.uri && certData.uri.trim().length > 0) {
            const uri = certData.uri.trim();
            // 检查是否是有效的IPFS URI
            if (uri.startsWith('ipfs://') || uri.startsWith('baf') || uri.startsWith('Qm')) {
              message += `[IPFS_IMAGE:${uri}]\n`;
              console.log(`✅ 证书 ${i + 1} 添加图片预览:`, uri);
            }
          }
          
          message += '\n';
          
        } catch (error: any) {
          message += `【证书 ${i + 1}】\n`;
          message += '━━━━━━━━━━━━━━━━━━━━━━\n';
          message += `证书ID: ${certId}\n`;
          message += `⚠️ 获取证书详情失败\n\n`;
          console.error(`获取证书 ${certId} 详情失败:`, error);
        }
      }
      
      // 图片预览已经嵌入到每个证书中了，不需要单独传递
      console.log('✅ 已为所有有效证书嵌入图片预览');
      showConfirmModal('我的证书', message, () => {}, 'info');
      
    } catch (error: any) {
      console.error('查询失败:', error);
      showConfirmModal('错误', '查询失败: ' + (error.message || '未知错误'), () => {}, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== 公共查询功能 ==========
  
  // 查询学生证书
  const getStudentCertificates = async () => {
    if (!contract) return;
    
    showInputModal(
      '查询学生证书',
      '请输入学生地址',
      async (studentAddress) => {
        if (!ethers.utils.isAddress(studentAddress)) {
          showConfirmModal('错误', '请输入有效的以太坊地址格式 (0x...)', () => {}, 'error');
        return;
      }
      
      setLoading(true);
      try {
          // 获取学生信息
          let studentInfo = null;
          try {
            studentInfo = await contract.getStudent(studentAddress);
            console.log('学生信息:', studentInfo);
          } catch (e) {
            console.log('学生未注册或获取失败');
          }
          
          // 获取证书ID列表
          const certificateIds = await contract.getCertificatesByStudent(studentAddress);
          console.log('获取到证书ID列表:', certificateIds);
          
          // 如果没有证书
          if (certificateIds.length === 0) {
            if (studentInfo) {
              showConfirmModal('提示', `学生「${studentInfo.name}」(${studentInfo.studentId || '无学号'}) 暂无证书`, () => {}, 'info');
        } else {
              showConfirmModal('提示', `该地址暂无证书`, () => {}, 'info');
            }
            setLoading(false);
            return;
          }
          
          // 构建标题和学生基本信息
          let message = '╔══════════════════════════╗\n';
          message += '        学生证书详情列表\n';
          message += '╚══════════════════════════╝\n\n';
          
          if (studentInfo) {
            message += '👤 学生基本信息\n';
            message += '━━━━━━━━━━━━━━━━━━━━━━\n';
            message += `姓名: ${studentInfo.name}\n`;
            if (studentInfo.studentId && studentInfo.studentId.trim().length > 0) {
              message += `学号: ${studentInfo.studentId}\n`;
            }
            message += `地址: ${studentAddress}\n`;
            if (studentInfo.registeredAt > 0) {
              const regDate = new Date(studentInfo.registeredAt * 1000).toLocaleDateString('zh-CN', {
                year: 'numeric', month: '2-digit', day: '2-digit'
              });
              message += `注册时间: ${regDate}\n`;
            }
            message += '\n';
          }
          
          message += `📚 共有 ${certificateIds.length} 份证书\n`;
          message += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
          
          // 获取每个证书的详细信息
          for (let i = 0; i < certificateIds.length; i++) {
            const certId = certificateIds[i];
            
            try {
              const certData = await contract.getCertificate(certId);
              
              message += `【证书 ${i + 1}】\n`;
              message += '━━━━━━━━━━━━━━━━━━━━━━\n';
              message += `证书ID: ${certData.id}\n`;
              message += `专业: ${certData.program || '未填写'}\n`;
              message += `学位: ${certData.level || '未填写'}\n`;
              
              // 格式化签发时间
              let issueDate = '未知';
              try {
                issueDate = new Date(certData.issuedAt * 1000).toLocaleDateString('zh-CN', {
                  year: 'numeric', month: '2-digit', day: '2-digit'
                });
              } catch (e) {
                issueDate = '未知';
              }
              message += `签发时间: ${issueDate}\n`;
              
              // 格式化有效期
              let expireText = '未知';
              try {
                expireText = certData.expiresAt === 0 ? '永久有效' : 
                           new Date(certData.expiresAt * 1000).toLocaleDateString('zh-CN', {
                             year: 'numeric', month: '2-digit', day: '2-digit'
                           });
              } catch (e) {
                expireText = '未知';
              }
              message += `有效期: ${expireText}\n`;
              
              // 获取签发院校信息
              try {
                const institutionInfo = await contract.getInstitution(certData.institution);
                message += `签发院校: ${institutionInfo.name}\n`;
                message += `院校地址: ${certData.institution}\n`;
              } catch (e) {
                message += `签发院校地址: ${certData.institution}\n`;
              }
              
              // 如果有IPFS URI，添加图片预览标记
              if (certData.uri && certData.uri.trim().length > 0) {
                const uri = certData.uri.trim();
                // 检查是否是有效的IPFS URI
                if (uri.startsWith('ipfs://') || uri.startsWith('baf') || uri.startsWith('Qm')) {
                  message += `[IPFS_IMAGE:${uri}]\n`;
                  console.log(`✅ 查询证书 ${i + 1} 添加图片预览:`, uri);
                }
              }
              
              message += '\n';
              
      } catch (error: any) {
              message += `【证书 ${i + 1}】\n`;
              message += '━━━━━━━━━━━━━━━━━━━━━━\n';
              message += `证书ID: ${certId}\n`;
              message += `⚠️ 获取证书详情失败\n\n`;
              console.error(`获取证书 ${certId} 详情失败:`, error);
            }
          }
          
          message += '━━━━━━━━━━━━━━━━━━━━━━';
          
          showConfirmModal('学生证书详情', message, () => {}, 'info');
          
        } catch (error: any) {
          console.error('查询失败:', error);
          showConfirmModal('错误', '查询失败: ' + (error.message || '未知错误'), () => {}, 'error');
      } finally {
        setLoading(false);
      }
      },
      { placeholder: '0x...', required: true }
    );
  };

  // 获取证书详情 - 已注释
  /*
  const getCertificateDetails = async () => {
    if (!contract) return;
    
    showInputModal(
      '获取证书详情',
      '请输入证书ID',
      async (certId) => {
      const id = parseInt(certId);
      if (isNaN(id) || id <= 0) {
          showConfirmModal('错误', '请输入有效的证书ID (正整数)', () => {}, 'error');
        return;
      }
      
      setLoading(true);
      try {
        console.log('查询证书ID:', id);
          const certData = await contract.getCertificate(id);
          console.log('证书详情:', certData);
          
          // 格式化时间
          let issueDate = '未知';
          try {
            issueDate = new Date(certData.issuedAt * 1000).toLocaleDateString();
          } catch {
            issueDate = '未知';
          }
          
          let expireText = '未知';
          try {
            expireText = certData.expiresAt === 0 ? '永久有效' : 
                       new Date(certData.expiresAt * 1000).toLocaleDateString();
          } catch {
            expireText = '未知';
          }
          
          // 构建清晰的证书信息显示
          let message = '━━━━━━━━━━━━━━━━━━━━━━\n';
          message += '📜 证书基本信息\n';
          message += '━━━━━━━━━━━━━━━━━━━━━━\n';
          message += `证书ID: ${certData.id}\n`;
          message += `专业: ${certData.program || '未填写'}\n`;
          message += `学位: ${certData.level || '未填写'}\n`;
          message += `签发时间: ${issueDate}\n`;
          message += `有效期: ${expireText}\n`;
          if (certData.uri && certData.uri.length > 0) {
            message += `文档URI: ${certData.uri}\n`;
          }
          
          // 获取学生信息
          message += '\n━━━━━━━━━━━━━━━━━━━━━━\n';
          message += '👤 学生信息\n';
          message += '━━━━━━━━━━━━━━━━━━━━━━\n';
          try {
            const studentInfo = await contract.getStudent(certData.student);
            console.log('学生信息:', studentInfo);
            
            message += `姓名: ${studentInfo.name}\n`;
            if (studentInfo.studentId && studentInfo.studentId.trim().length > 0) {
              message += `学号: ${studentInfo.studentId}\n`;
            }
            message += `地址: ${certData.student}\n`;
            
            if (studentInfo.registeredAt > 0) {
              const regDate = new Date(studentInfo.registeredAt * 1000).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              });
              message += `注册时间: ${regDate}\n`;
            }
            
            if (studentInfo.metadataURI && studentInfo.metadataURI.trim().length > 0) {
              message += `元数据: ${studentInfo.metadataURI}\n`;
            }
          } catch (e: any) {
            console.error('获取学生信息失败:', e);
            message += `⚠ 学生未注册\n`;
            message += `地址: ${certData.student}\n`;
          }
          
          // 获取院校信息
          message += '\n━━━━━━━━━━━━━━━━━━━━━━\n';
          message += '🏫 签发院校信息\n';
          message += '━━━━━━━━━━━━━━━━━━━━━━\n';
          try {
            const institutionInfo = await contract.getInstitution(certData.institution);
            console.log('院校信息:', institutionInfo);
            
            message += `院校名称: ${institutionInfo.name}\n`;
            message += `院校地址: ${certData.institution}\n`;
            
            const metaUri = institutionInfo.metadataURI || institutionInfo.metadata || '';
            if (metaUri && metaUri.trim().length > 0) {
              message += `元数据: ${metaUri}\n`;
            }
          } catch (e: any) {
            console.error('获取院校信息失败:', e);
            message += `⚠ 院校未注册\n`;
            message += `地址: ${certData.institution}\n`;
          }
          
          message += '━━━━━━━━━━━━━━━━━━━━━━\n';
          
          showConfirmModal('证书详情', message, () => {}, 'info');
      } catch (error: any) {
          console.error('获取证书详情失败:', error);
          showConfirmModal('错误', '获取证书详情失败: ' + (error.message || '未知错误'), () => {}, 'error');
      } finally {
        setLoading(false);
      }
      },
      { placeholder: '1', required: true }
    );
  };
  */

  // 查询院校签发的证书（显示详细信息）
  const getInstitutionCertificates = async () => {
    if (!contract) return;
    
    showInputModal(
      '查询院校证书',
      '请输入院校地址',
      async (institutionAddr) => {
        if (!ethers.utils.isAddress(institutionAddr)) {
          showConfirmModal('错误', '请输入有效的以太坊地址格式 (0x...)', () => {}, 'error');
          return;
        }
        
      setLoading(true);
      try {
          // 获取院校信息
          let institutionInfo = null;
          try {
            institutionInfo = await contract.getInstitution(institutionAddr);
            console.log('院校信息:', institutionInfo);
          } catch (e) {
            console.log('院校未注册或获取失败');
          }
          
          // 获取证书ID列表
          const certificateIds = await contract.getCertificatesByInstitution(institutionAddr);
          console.log('获取到证书ID列表:', certificateIds);
          
          // 如果没有证书
          if (certificateIds.length === 0) {
            if (institutionInfo) {
              showConfirmModal('提示', `院校「${institutionInfo.name}」暂无证书`, () => {}, 'info');
            } else {
              showConfirmModal('提示', `该地址暂无证书`, () => {}, 'info');
            }
            setLoading(false);
            return;
          }
          
          // 构建标题和院校基本信息
          let message = '╔══════════════════════════╗\n';
          message += '      院校证书详情列表\n';
          message += '╚══════════════════════════╝\n\n';
          
          if (institutionInfo) {
            message += '🏫 院校信息\n';
            message += '━━━━━━━━━━━━━━━━━━━━━━\n';
            message += `院校名称: ${institutionInfo.name}\n`;
            message += `院校地址: ${institutionAddr}\n`;
            const metaUri = institutionInfo.metadataURI || institutionInfo.metadata || '';
            if (metaUri && metaUri.trim().length > 0) {
              message += `元数据: ${metaUri}\n`;
            }
            message += '\n';
          } else {
            message += '🏫 院校地址\n';
            message += '━━━━━━━━━━━━━━━━━━━━━━\n';
            message += `${institutionAddr}\n`;
            message += '⚠️ 院校未注册\n\n';
          }
          
          message += `📚 共颁发 ${certificateIds.length} 份证书\n`;
          message += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
          
          // 获取每个证书的详细信息
          for (let i = 0; i < certificateIds.length; i++) {
            const certId = certificateIds[i];
            
            try {
              const certData = await contract.getCertificate(certId);
              
              message += `【证书 ${i + 1}】\n`;
              message += '━━━━━━━━━━━━━━━━━━━━━━\n';
              message += `证书ID: ${certData.id}\n`;
              message += `专业: ${certData.program || '未填写'}\n`;
              message += `学位: ${certData.level || '未填写'}\n`;
              
              // 格式化签发时间
              let issueDate = '未知';
              try {
                issueDate = new Date(certData.issuedAt * 1000).toLocaleDateString('zh-CN', {
                  year: 'numeric', month: '2-digit', day: '2-digit'
                });
              } catch (e) {
                issueDate = '未知';
              }
              message += `签发时间: ${issueDate}\n`;
              
              // 格式化有效期
              let expireText = '未知';
              try {
                expireText = certData.expiresAt === 0 ? '永久有效' : 
                           new Date(certData.expiresAt * 1000).toLocaleDateString('zh-CN', {
                             year: 'numeric', month: '2-digit', day: '2-digit'
                           });
              } catch (e) {
                expireText = '未知';
              }
              message += `有效期: ${expireText}\n`;
              
              // 获取学生信息
              message += '\n👤 学生信息:\n';
              try {
                const studentInfo = await contract.getStudent(certData.student);
                message += `  姓名: ${studentInfo.name}\n`;
                if (studentInfo.studentId && studentInfo.studentId.trim().length > 0) {
                  message += `  学号: ${studentInfo.studentId}\n`;
                }
                message += `  地址: ${certData.student}\n`;
                if (studentInfo.registeredAt > 0) {
                  const regDate = new Date(studentInfo.registeredAt * 1000).toLocaleDateString('zh-CN', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  });
                  message += `  注册时间: ${regDate}\n`;
                }
                if (studentInfo.metadataURI && studentInfo.metadataURI.trim().length > 0) {
                  message += `  元数据: ${studentInfo.metadataURI}\n`;
                }
              } catch (e) {
                message += `  ⚠️ 学生未注册\n`;
                message += `  地址: ${certData.student}\n`;
              }
              
              // 添加证书图片预览（如果有有效的 IPFS URI）
              const ipfsUri = certData.uri?.trim() || '';
              console.log(`证书 ${certId} 的 URI:`, ipfsUri);
              
              if (ipfsUri.length > 0 && 
                  (ipfsUri.startsWith('ipfs://') || 
                   ipfsUri.startsWith('Qm') || 
                   ipfsUri.startsWith('baf'))) {
                console.log(`证书 ${certId} 有有效的 IPFS URI，添加预览占位符`);
                message += `\n[IPFS_IMAGE:${ipfsUri}]\n`;
              } else {
                console.log(`证书 ${certId} 没有有效的 IPFS URI`);
              }
              
              message += '\n';
              
      } catch (error: any) {
              message += `【证书 ${i + 1}】\n`;
              message += '━━━━━━━━━━━━━━━━━━━━━━\n';
              message += `证书ID: ${certId}\n`;
              message += `⚠️ 获取证书详情失败\n\n`;
              console.error(`获取证书 ${certId} 详情失败:`, error);
            }
          }
          
          message += '━━━━━━━━━━━━━━━━━━━━━━';
          
          showConfirmModal('院校证书详情', message, () => {}, 'info');
          
        } catch (error: any) {
          console.error('查询失败:', error);
          showConfirmModal('错误', '查询失败: ' + (error.message || '未知错误'), () => {}, 'error');
      } finally {
        setLoading(false);
      }
      },
      { placeholder: '0x...', required: true }
    );
  };

  // 获取角色图标
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return '👑';
      case 'institution': return '🏫';
      case 'student': return '🎓';
      default: return '👤';
    }
  };

  // 获取角色名称
  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'admin': return '管理员';
      case 'institution': return '院校';
      case 'student': return '学生';
      default: return '访客';
    }
  };

  // 获取角色颜色
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return '#ff6b6b';
      case 'institution': return '#4ecdc4';
      case 'student': return '#95e1d3';
      default: return '#a8dadc';
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🎓 学术证书管理系统</h1>
        <p className="subtitle">基于区块链的学历认证平台</p>
      </header>
      
      {!isConnected ? (
        <div className="connect-section">
          <div className="welcome-card">
            <div className="welcome-icon">🔐</div>
            <h2>欢迎使用</h2>
            <p>请连接您的钱包以开始使用</p>
          <button className="connect-button" onClick={connectWallet}>
              <span className="button-icon">🦊</span>
            连接 MetaMask
          </button>
          </div>
          
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">👑</div>
              <h3>管理员</h3>
              <p>注册院校和学生，管理系统权限</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🏫</div>
              <h3>院校</h3>
              <p>为学生颁发学历证书</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🎓</div>
              <h3>学生</h3>
              <p>查看和管理自己的证书</p>
            </div>
          </div>
          
          <div className="instructions">
            <h3>📝 使用说明</h3>
            <div className="steps">
              <div className="step">
                <span className="step-number">1</span>
                <span className="step-text">安装 MetaMask 浏览器扩展</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span className="step-text">添加 Polkadot Asset Hub 测试网</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span className="step-text">获取测试币（Faucet）</span>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <span className="step-text">连接钱包开始使用</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="main-content">
          {/* 用户信息卡片 */}
          <div className="user-card" style={{ borderLeftColor: getRoleColor(userRole) }}>
            <div className="user-header">
              <div className="user-info">
                <div className="user-avatar" style={{ background: getRoleColor(userRole) }}>
                  {getRoleIcon(userRole)}
                </div>
                <div className="user-details">
                  <h3>{userName}</h3>
                  <span className="role-badge" style={{ background: getRoleColor(userRole) }}>
                    {getRoleName(userRole)}
                  </span>
                </div>
              </div>
              <div className="user-controls">
                <button 
                  className="control-btn switch-btn" 
                  onClick={switchAccount}
                  title="切换账户"
                >
                  🔄
                </button>
                <button 
                  className="control-btn disconnect-btn" 
                  onClick={disconnectWallet}
                  title="断开连接"
                >
                  ❌
                </button>
              </div>
            </div>
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-label">账户地址</span>
                <span className="stat-value address-full">{account}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">余额</span>
                <span className="stat-value">{parseFloat(balance).toFixed(4)} PAS</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">网络</span>
                <span className="stat-value">{NETWORK_CONFIG.chainName}</span>
              </div>
            </div>
          </div>
          
          {/* 管理员功能 */}
          {userRole === 'admin' && (
            <div className="role-section">
              <div className="section-header">
                <h2>👑 管理员功能</h2>
                <p>管理院校和学生注册</p>
              </div>
          <div className="actions-grid">
            <button 
                  className="action-card admin-action" 
              onClick={registerInstitution} 
              disabled={loading}
            >
                  <div className="action-icon">🏫</div>
                  <h3>注册院校</h3>
                  <p>为院校授予颁发证书的权限</p>
            </button>
            
            <button 
                  className="action-card admin-action" 
              onClick={registerStudent} 
              disabled={loading}
            >
                  <div className="action-icon">🎓</div>
                  <h3>注册学生</h3>
                  <p>将学生添加到系统</p>
            </button>
              </div>
            </div>
          )}
          
          {/* 院校功能 */}
          {userRole === 'institution' && (
            <div className="role-section">
              <div className="section-header">
                <h2>🏫 院校功能</h2>
                <p>为学生颁发学历证书 {ipfsConnected && <span style={{ color: '#34c759', fontSize: '0.9rem' }}>● IPFS已连接</span>}</p>
              </div>
              
              {uploadingToIPFS && (
                <div style={{ 
                  marginBottom: '20px',
                  padding: '16px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    ⏳ 正在上传到IPFS，请稍候...
                  </p>
                </div>
              )}
              
              <div className="actions-grid">
            <button 
                  className="action-card institution-action" 
                  onClick={() => setCertFormOpen(true)} 
                  disabled={loading || uploadingToIPFS || !ipfsConnected}
                  style={{ borderColor: ipfsConnected ? '#34c759' : '#cbd5e0', borderWidth: '2px' }}
                >
                  <div className="action-icon">📜</div>
                  <h3>颁发证书</h3>
                  <p>上传证书文档并颁发</p>
                </button>
                
                <button 
                  className="action-card institution-action" 
                  onClick={getMyInstitutionCertificates} 
              disabled={loading}
            >
                  <div className="action-icon">📋</div>
                  <h3>我的证书列表</h3>
                  <p>查看我已颁发的所有证书</p>
            </button>
              </div>
              
              {!ipfsConnected && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '16px', 
                  background: '#fff3cd', 
                  borderRadius: '12px',
                  border: '1px solid #ffc107'
                }}>
                  <p style={{ color: '#856404', fontSize: '0.9rem', margin: 0 }}>
                    ⚠️ IPFS未连接。请先配置Pinata API密钥才能颁发证书。
                    <br />
                    <a href="/IPFS_SETUP.md" target="_blank" style={{ color: '#0071e3', textDecoration: 'none' }}>
                      查看配置指南 →
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* 学生功能 */}
          {userRole === 'student' && (
            <div className="role-section">
              <div className="section-header">
                <h2>🎓 学生功能</h2>
                <p>查看和管理您的证书</p>
              </div>
              <div className="actions-grid">
            <button 
                  className="action-card student-action" 
                  onClick={getMyCertificates} 
              disabled={loading}
            >
                  <div className="action-icon">📚</div>
                  <h3>我的证书</h3>
                  <p>查看我的所有学历证书</p>
            </button>
              </div>
            </div>
          )}
          
          {/* 公共查询功能 */}
          <div className="role-section">
            <div className="section-header">
              <h2>🔍 公共查询</h2>
              <p>任何人都可以验证证书真实性</p>
            </div>
            <div className="actions-grid public-grid">
            <button 
                className="action-card query-action" 
              onClick={getStudentCertificates} 
              disabled={loading}
            >
                <div className="action-icon">👨‍🎓</div>
                <h3>查询学生证书</h3>
                <p>通过地址查询学生的证书</p>
            </button>
            
              {/* 证书详情查询功能已注释
            <button 
                className="action-card query-action" 
              onClick={getCertificateDetails} 
              disabled={loading}
            >
                <div className="action-icon">🔎</div>
                <h3>证书详情查询</h3>
                <p>通过证书ID查看详细信息</p>
            </button>
              */}
            
            <button 
                className="action-card query-action" 
                onClick={getInstitutionCertificates} 
              disabled={loading}
            >
                <div className="action-icon">🏛️</div>
                <h3>查询院校证书</h3>
                <p>查看院校颁发的所有证书</p>
            </button>
            </div>
          </div>
          
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              <p>处理中...</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 模态框组件 */}
      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        message={inputModal.message}
        placeholder={inputModal.placeholder}
        defaultValue={inputModal.defaultValue}
        type={inputModal.type}
        required={inputModal.required}
        onConfirm={(value) => {
          if (inputModal.onConfirm) {
            inputModal.onConfirm(value);
          }
        }}
        onCancel={closeModals}
      />
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={() => {
          if (confirmModal.onConfirm) {
            confirmModal.onConfirm();
          }
          closeModals();
        }}
        onCancel={closeModals}
        ipfsUri={confirmModal.ipfsUri}
        documentType={confirmModal.documentType}
      />

      {/* 证书颁发表单 */}
      <CertificateIssueForm
        isOpen={certFormOpen}
        onClose={() => setCertFormOpen(false)}
        onSubmit={handleCertificateFormSubmit}
        uploadedFile={uploadedFile}
        onFileSelect={setUploadedFile}
        ipfsConnected={ipfsConnected}
      />

      <InstitutionRegisterForm
        isOpen={institutionFormOpen}
        onClose={() => setInstitutionFormOpen(false)}
        onSubmit={handleInstitutionFormSubmit}
      />

      <StudentRegisterForm
        isOpen={studentFormOpen}
        onClose={() => setStudentFormOpen(false)}
        onSubmit={handleStudentFormSubmit}
      />
    </div>
  );
};

export default ContractInterface;
