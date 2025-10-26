import React, { useState } from 'react';
import { ethers } from 'ethers';
import { AcademicLedgerContract, CONTRACT_ADDRESS, NETWORK_CONFIG } from '../contracts/AcademicLedger';
import InputModal from './InputModal';
import ConfirmModal from './ConfirmModal';
import './ContractInterface.css';

const ContractInterface: React.FC = () => {
  const [contract, setContract] = useState<AcademicLedgerContract | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');

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
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

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
        setNetworkStatus('已连接到 Polkadot Asset Hub 测试网');
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
        
        // 请求切换账户
        try {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
          
          // 重新连接
          await connectWallet();
        } catch (err: any) {
          // 如果是请求已经在进行中的错误，显示友好提示
          if (err.message && err.message.includes('already pending')) {
            showConfirmModal('提示', '请先在MetaMask中完成当前操作', () => {}, 'info');
          } else {
            throw err; // 将其他错误继续抛出
          }
        }
      }
    } catch (error: any) {
      console.error('切换账户失败:', error);
      showConfirmModal('错误', '切换账户失败: ' + error.message, () => {}, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 断开连接
  const disconnectWallet = () => {
    setContract(null);
    setAccount('');
    setIsConnected(false);
    setNetworkStatus('');
    setBalance('0');
  };

  // 模态框辅助函数
  const showInputModal = (
    title: string,
    message: string,
    onConfirm: (value: string) => void,
    options: {
      placeholder?: string;
      defaultValue?: string;
      type?: 'text' | 'textarea';
      required?: boolean;
    } = {}
  ) => {
    setInputModal({
      isOpen: true,
      title,
      message,
      placeholder: options.placeholder || '',
      defaultValue: options.defaultValue || '',
      type: options.type || 'text',
      required: options.required || false,
      onConfirm
    });
  };

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const closeModals = () => {
    setInputModal(prev => ({ ...prev, isOpen: false }));
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // 注册院校
  const registerInstitution = async () => {
    if (!contract) return;
    
    // 检查当前账户是否有管理员权限
    try {
      const currentAccount = await contract.getCurrentAccount();
      const isAdminUser = await contract.isAdmin(currentAccount);
      
      if (!isAdminUser) {
        alert('❌ 错误：当前账户没有管理员权限！\n\n只有管理员可以注册院校。\n\n请联系合约部署者为您授予管理员角色。');
        return;
      }
    } catch (error: any) {
      console.error('权限检查失败:', error);
      alert('⚠️ 无法验证权限，将继续尝试注册');
    }
    
    let institution = '';
    let name = '';
    let metadata = '';
    
    // 第一步：输入院校地址
    showInputModal(
      '注册院校',
      '请输入院校的以太坊地址',
      (value) => {
        institution = value;
        // 第二步：输入院校名称
        showInputModal(
          '注册院校',
          '请输入院校名称',
          (value) => {
            name = value;
            // 第三步：输入元数据
            showInputModal(
              '注册院校',
              '请输入院校元数据（JSON格式）',
              async (value) => {
                metadata = value;
                setLoading(true);
                try {
                  await contract.registerInstitution(institution, name, metadata);
                  showConfirmModal('成功', '院校注册成功!', () => closeModals(), 'success');
                } catch (error: any) {
                  console.error('注册失败:', error);
                  showConfirmModal('错误', '注册失败: ' + error.message, () => closeModals(), 'error');
                } finally {
                  setLoading(false);
                }
              },
              {
                placeholder: '{"type":"university","country":"China"}',
                type: 'textarea'
              }
            );
          },
          { placeholder: '北京大学', required: true }
        );
      },
      { placeholder: '0x...', required: true }
    );
  };

  // 注册学生
  const registerStudent = async () => {
    if (!contract) return;
    
    // 检查当前账户是否有管理员权限
    try {
      const currentAccount = await contract.getCurrentAccount();
      const isAdminUser = await contract.isAdmin(currentAccount);
      
      if (!isAdminUser) {
        alert('❌ 错误：当前账户没有管理员权限！\n\n只有管理员可以注册学生。\n\n请联系合约部署者为您授予管理员角色。');
        return;
      }
    } catch (error: any) {
      console.error('权限检查失败:', error);
      alert('⚠️ 无法验证权限，将继续尝试注册');
    }
    
    let studentAddr = '';
    let name = '';
    let studentId = '';
    let metadataURI = '';
    
    // 第一步：输入学生地址
    showInputModal(
      '注册学生',
      '请输入学生的以太坊地址',
      (value) => {
        studentAddr = value;
        // 第二步：输入学生姓名
        showInputModal(
          '注册学生',
          '请输入学生姓名',
          (value) => {
            name = value;
            // 第三步：输入学号
            showInputModal(
              '注册学生',
              '请输入学号',
              (value) => {
                studentId = value;
                // 第四步：输入元数据（可选）
                showInputModal(
                  '注册学生',
                  '请输入学生元数据（可选，JSON格式）',
                  async (value) => {
                    metadataURI = value;
                    setLoading(true);
                    try {
                      await contract.registerStudent(studentAddr, name, studentId, metadataURI);
                      showConfirmModal('成功', '学生注册成功!', () => closeModals(), 'success');
                    } catch (error: any) {
                      console.error('注册失败:', error);
                      showConfirmModal('错误', '注册失败: ' + error.message, () => closeModals(), 'error');
                    } finally {
                      setLoading(false);
                    }
                  },
                  {
                    placeholder: '{"major":"计算机科学","class":"2023级"}',
                    type: 'textarea'
                  }
                );
              },
              { placeholder: '2023001', required: true }
            );
          },
          { placeholder: '张三', required: true }
        );
      },
      { placeholder: '0x...', required: true }
    );
  };

  // 颁发证书
  const issueCertificate = async () => {
    if (!contract) return;
    
    let student = '';
    let program = '';
    let level = '';
    let uri = '';
    let docHash = '';
    
    // 第一步：输入学生地址
    showInputModal(
      '颁发证书',
      '请输入学生地址',
      (value) => {
        student = value;
        closeModals(); // 手动关闭当前模态框
        // 第二步：输入专业
        setTimeout(() => {
          showInputModal(
            '颁发证书',
            '请输入专业名称',
            (value) => {
              program = value;
              closeModals(); // 手动关闭当前模态框
              // 第三步：输入学位级别
              setTimeout(() => {
                showInputModal(
                  '颁发证书',
                  '请输入学位级别',
                  (value) => {
                    level = value;
                    closeModals(); // 手动关闭当前模态框
                    // 第四步：输入证书URI
                    setTimeout(() => {
                      showInputModal(
                        '颁发证书',
                        '请输入证书URI',
                        (value) => {
                          uri = value;
                          closeModals(); // 手动关闭当前模态框
                          // 第五步：输入文档哈希
                          setTimeout(() => {
                            showInputModal(
                              '颁发证书',
                              '请输入文档哈希',
                              async (value) => {
                                docHash = value;
                                closeModals(); // 手动关闭当前模态框
                                setLoading(true);
                                try {
                                  console.log('开始颁发证书...');
                                  const certId = await contract.issueCertificate(student, program, level, 0, uri, docHash);
                                  console.log('证书颁发成功，ID:', certId);
                                  
                                  if (certId === 0) {
                                    showConfirmModal(
                                      '⚠️ 警告', 
                                      '证书已颁发，但未能获取证书ID。\n\n请通过查询学生证书列表查看证书ID。', 
                                      () => closeModals(), 
                                      'warning'
                                    );
                                  } else {
                                    showConfirmModal('成功', `证书颁发成功! 证书ID: ${certId}`, () => closeModals(), 'success');
                                  }
                                } catch (error: any) {
                                  console.error('颁发失败:', error);
                                  showConfirmModal('错误', '颁发失败: ' + error.message, () => closeModals(), 'error');
                                } finally {
                                  setLoading(false);
                                }
                              },
                              { placeholder: '文档哈希值', required: true }
                            );
                          }, 100);
                        },
                        { placeholder: 'https://example.com/certificate.pdf', required: true }
                      );
                    }, 100);
                  },
                  { placeholder: 'Bachelor', required: true }
                );
              }, 100);
            },
            { placeholder: 'Computer Science', required: true }
          );
        }, 100);
      },
      { placeholder: '0x...', required: true }
    );
  };


  // 查询学生证书并显示详情 - 完全重写版本
  const getStudentCertificates = async () => {
    if (!contract) return;
    
    showInputModal(
      '查询学生证书',
      '请输入学生地址',
      async (studentAddress) => {
        // 验证地址格式
        if (!ethers.utils.isAddress(studentAddress)) {
          showConfirmModal('错误', '请输入有效的以太坊地址格式 (0x...)', () => {}, 'error');
          return;
        }
        
        setLoading(true);
        try {
          // 直接尝试获取证书ID列表，不验证学生是否存在
          const certificateIds = await contract.getCertificatesByStudent(studentAddress);
          console.log('获取到证书ID列表:', certificateIds);
          
          // 如果没有证书，显示简单消息
          if (certificateIds.length === 0) {
            try {
              const studentInfo = await contract.getStudent(studentAddress);
              showConfirmModal('提示', `学生「${studentInfo.name}」(${studentInfo.studentId || '无学号'}) 暂无证书`, () => {}, 'info');
            } catch (e) {
              showConfirmModal('提示', `该地址 (${studentAddress.substring(0, 6)}...${studentAddress.substring(38)}) 暂无证书`, () => {}, 'info');
            }
            setLoading(false);
            return;
          }
          
          // 有证书，直接显示ID列表
          let message = `**证书列表 (${certificateIds.length}份)**\n`;
          message += `学生地址: ${studentAddress.substring(0, 6)}...${studentAddress.substring(38)}\n\n`;
          
          // 尝试获取学生信息显示在顶部
          try {
            const studentInfo = await contract.getStudent(studentAddress);
            message = `**学生信息**\n姓名: ${studentInfo.name}\n学号: ${studentInfo.studentId || '无'}\n\n${message}`;
          } catch (e) {
            console.log('获取学生信息失败，继续显示证书列表');
          }
          
          // 简单列出所有证书ID
          message += "证书ID列表:\n";
          const idList = certificateIds.join(", ");
          
          message += idList;
          
          showConfirmModal('学生证书详情', message, () => {}, 'info');
          
        } catch (error: any) {
          console.error('获取证书列表失败:', error);
          showConfirmModal('错误', '获取证书列表失败: ' + (error.message || '未知错误'), () => {}, 'error');
        } finally {
          setLoading(false);
        }
      },
      { placeholder: '0x...', required: true }
    );
  };

  // 获取证书详情 - 完全重写版本
  const getCertificateDetails = async () => {
    if (!contract) return;
    
    showInputModal(
      '获取证书详情',
      '请输入证书ID',
      async (certId) => {
        // 验证证书ID格式
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
            
            // getStudent方法已经返回格式化的对象
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
            
            // getInstitution方法已经返回格式化的对象
            message += `院校名称: ${institutionInfo.name}\n`;
            message += `院校地址: ${certData.institution}\n`;
            
            // metadataURI可能存储为metadata或metadataURI
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
  
  // 查询院校签发的证书 - 完全重写版本
  const getInstitutionCertificates = async () => {
    if (!contract) return;
    
    showInputModal(
      '查询院校证书',
      '请输入院校地址',
      async (institutionAddr) => {
        // 验证地址格式
        if (!ethers.utils.isAddress(institutionAddr)) {
          showConfirmModal('错误', '请输入有效的以太坊地址格式 (0x...)', () => {}, 'error');
          return;
        }
        
        setLoading(true);
        try {
          // 直接获取证书列表，不验证院校存在
          const certificateIds = await contract.getCertificatesByInstitution(institutionAddr);
          console.log('获取到院校证书ID列表:', certificateIds);
          
          // 如果没有证书，显示简单消息
          if (certificateIds.length === 0) {
            try {
              const institutionInfo = await contract.getInstitution(institutionAddr);
              showConfirmModal('提示', `院校「${institutionInfo.name}」暂未签发证书`, () => {}, 'info');
            } catch (e) {
              showConfirmModal('提示', `该地址 (${institutionAddr.substring(0, 6)}...${institutionAddr.substring(38)}) 暂未签发证书`, () => {}, 'info');
            }
            setLoading(false);
            return;
          }
          
          // 有证书，直接显示ID列表
          let message = `**证书列表 (${certificateIds.length}份)**\n`;
          message += `院校地址: ${institutionAddr.substring(0, 6)}...${institutionAddr.substring(38)}\n\n`;
          
          // 尝试获取院校信息显示在顶部
          try {
            const institutionInfo = await contract.getInstitution(institutionAddr);
            message = `**院校信息**\n名称: ${institutionInfo.name}\n\n${message}`;
          } catch (e) {
            console.log('获取院校信息失败，继续显示证书列表');
          }
          
          // 简单列出所有证书ID
          message += "证书ID列表:\n";
          const idList = certificateIds.join(", ");
          
          message += idList;
          
          showConfirmModal('院校证书列表', message, () => {}, 'info');
          
        } catch (error: any) {
          console.error('获取证书列表失败:', error);
          showConfirmModal('错误', '获取证书列表失败: ' + (error.message || '未知错误'), () => {}, 'error');
        } finally {
          setLoading(false);
        }
      },
      { placeholder: '0x...', required: true }
    );
  };


  return (
    <div className="container">
      <header className="header">
          <h1>学术证书管理系统</h1>
        <p className="subtitle">基于 Polkadot Asset Hub 测试网</p>
      </header>
      
      {!isConnected ? (
        <div className="connect-section">
          <button className="connect-button" onClick={connectWallet}>
            连接 MetaMask
          </button>
          <div className="instructions">
            <h3>使用说明:</h3>
            <ol>
              <li>安装 MetaMask 浏览器扩展</li>
              <li>添加 Polkadot Asset Hub 测试网</li>
              <li>获取测试币</li>
              <li>连接钱包开始使用</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="main-content">
          <div className="status-card">
            <div className="status-header">
              <h3>连接状态</h3>
              <div className="account-controls">
                <button 
                  className="switch-account-btn" 
                  onClick={switchAccount}
                  title="切换账户"
                >
                  🔄 切换账户
                </button>
                <button 
                  className="disconnect-btn" 
                  onClick={disconnectWallet}
                  title="断开连接"
                >
                  ❌ 断开
                </button>
              </div>
            </div>
            <p><strong>账户:</strong> {account}</p>
            <p><strong>余额:</strong> {balance} DOT</p>
            <p><strong>合约地址:</strong> {CONTRACT_ADDRESS}</p>
            <p><strong>网络:</strong> {NETWORK_CONFIG.chainName}</p>
            <p><strong>状态:</strong> {networkStatus}</p>
          </div>
          
          <div className="actions-grid">
            <button 
              className="action-button register" 
              onClick={registerInstitution} 
              disabled={loading}
            >
              注册院校
            </button>
            
            <button 
              className="action-button student" 
              onClick={registerStudent} 
              disabled={loading}
            >
              注册学生
            </button>
            
            <button 
              className="action-button issue" 
              onClick={issueCertificate} 
              disabled={loading}
            >
              颁发证书
            </button>
            
            
            <button 
              className="action-button query" 
              onClick={getStudentCertificates} 
              disabled={loading}
            >
              学生证书查询
            </button>
            
            <button 
              className="action-button institution" 
              onClick={getInstitutionCertificates} 
              disabled={loading}
            >
              院校证书查询
            </button>
            
            <button 
              className="action-button details" 
              onClick={getCertificateDetails} 
              disabled={loading}
            >
              证书ID查询
            </button>
            
          </div>
          
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>处理中...</p>
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
          // 不自动关闭模态框，让回调函数决定是否关闭
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
      />
    </div>
  );
};

export default ContractInterface;
