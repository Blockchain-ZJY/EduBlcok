import { ethers } from 'ethers';

// 合约地址 (需要部署到 Polkadot Asset Hub 测试网后更新)
export const CONTRACT_ADDRESS = '0xD692405fE693791A4c8eEf420c7117bBE1550FA5';

// Polkadot Hub 测试网配置 (根据官方信息更新)
export const NETWORK_CONFIG = {
  chainId: '0x190f1b46', // 420420422 (Polkadot Hub Testnet) - 转换为十六进制
  chainName: 'Polkadot Hub TestNet',
  rpcUrls: ['https://testnet-passet-hub-eth-rpc.polkadot.io'],
  nativeCurrency: {
    name: 'PAS',
    symbol: 'PAS',
    decimals: 18,
  },
  blockExplorerUrls: ['https://blockscout-passet-hub.parity-testnet.parity.io/'],
};

// 合约 ABI (从你的合约获取)
// 使用更精确的ABI定义，与合约完全匹配
export const CONTRACT_ABI = [
  // 管理与权限函数
  "function grantRole(bytes32 role, address account) external",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function registerInstitution(address institution, string calldata name, string calldata metadataURI) external",
  "function registerStudent(address studentAddr, string calldata name, string calldata studentId, string calldata metadataURI) external",
  "function setStudentStatus(address studentAddr, bool active) external",
  "function pause() external",
  "function unpause() external",
  "function paused() external view returns (bool)",
  
  // 证书管理函数
  "function issueCertificate(address student, string calldata program, string calldata level, uint64 expiresAt, string calldata uri, bytes32 docHash) external returns (uint256)",
  "function updateCertificateUri(uint256 id, string calldata newUri) external",
  
  // 查询函数
  "function getCertificate(uint256 id) external view returns (tuple(uint256 id, address student, address institution, string program, string level, uint64 issuedAt, uint64 expiresAt, string uri, bytes32 docHash))",
  "function certificatesOf(address student) external view returns (uint256[] memory)",
  "function certificatesByInstitution(address institutionAddr) external view returns (uint256[] memory)",
  
  // 公共映射访问器
  "function institutions(address) external view returns (string memory name, string memory metadataURI)",
  "function students(address) external view returns (string memory name, string memory studentId, string memory metadataURI, bool active, uint256 registeredAt)",
  
  // 专用getter函数
  "function getStudent(address studentAddr) external view returns (string memory name, string memory studentId, string memory metadataURI, bool active, uint256 registeredAt)",
  "function getInstitution(address institutionAddr) external view returns (string memory name, string memory metadataURI)",
  
  // 角色常量
  "function INSTITUTION_ROLE() external view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)",
  
  // 事件
  "event CertificateIssued(uint256 indexed id, address indexed student, address indexed institution, bytes32 docHash)",
  "event CertificateUriUpdated(uint256 indexed id, string newUri)",
  "event InstitutionRegistered(address indexed institution, string name, string metadataURI)",
  "event StudentRegistered(address indexed student, string name, string studentId)",
  "event StudentStatusChanged(address indexed student, bool active)"
];

// 角色常量
export const ROLES = {
  ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  INSTITUTION_ROLE: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('INSTITUTION_ROLE')),
};

// 合约交互类
export class AcademicLedgerContract {
  private contract: ethers.Contract;
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
  }

  // 检查网络
  async checkNetwork(): Promise<boolean> {
    const network = await this.provider.getNetwork();
    return network.chainId === parseInt(NETWORK_CONFIG.chainId, 16);
  }

  // 切换到正确网络
  async switchNetwork(): Promise<void> {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // 网络不存在，添加网络
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG],
        });
      } else {
        throw error;
      }
    }
  }

  // 获取当前账户
  async getCurrentAccount(): Promise<string> {
    const accounts = await this.provider.listAccounts();
    return accounts[0];
  }

  // 注册院校
  async registerInstitution(institution: string, name: string, metadata: string): Promise<void> {
    const tx = await this.contract.registerInstitution(institution, name, metadata);
    await tx.wait();
  }

  // 注册学生
  async registerStudent(studentAddr: string, name: string, studentId: string, metadataURI: string): Promise<void> {
    const tx = await this.contract.registerStudent(studentAddr, name, studentId, metadataURI);
    await tx.wait();
  }

  // 设置学生状态
  async setStudentStatus(studentAddr: string, active: boolean): Promise<void> {
    const tx = await this.contract.setStudentStatus(studentAddr, active);
    await tx.wait();
  }

  // 颁发证书
  async issueCertificate(
    student: string,
    program: string,
    level: string,
    expiresAt: number,
    uri: string,
    docHash: string
  ): Promise<number> {
    const tx = await this.contract.issueCertificate(
      student,
      program,
      level,
      expiresAt,
      uri,
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes(docHash))
    );
    
    // 等待交易确认并获取证书ID
    const receipt = await tx.wait();
    
    // 从收据中解析事件日志获取证书ID
    const log = receipt.logs.find((log: any) => {
      try {
        const parsedLog = this.contract.interface.parseLog(log);
        return parsedLog && parsedLog.name === 'CertificateIssued';
      } catch (e) {
        return false;
      }
    });
    
    if (log) {
      try {
        const parsedLog = this.contract.interface.parseLog(log);
        return parsedLog.args.id.toNumber();
      } catch (e) {
        console.error('解析事件失败:', e);
      }
    }
    
    // 如果无法从事件获取，尝试从返回值获取
    // 注意：某些情况下可能需要直接从交易中获取返回值
    console.warn('未能从事件中获取证书ID，将返回0');
    return 0;
  }


  // 获取学生证书
  async getCertificatesByStudent(student: string): Promise<number[]> {
    const certificates = await this.contract.certificatesOf(student);
    return certificates.map((id: any) => id.toNumber ? id.toNumber() : parseInt(id.toString()));
  }
  
  // 获取院校证书
  async getCertificatesByInstitution(institutionAddr: string): Promise<number[]> {
    const certificates = await this.contract.certificatesByInstitution(institutionAddr);
    return certificates.map((id: any) => id.toNumber ? id.toNumber() : parseInt(id.toString()));
  }

  // 获取证书详情
  async getCertificate(id: number): Promise<any> {
    const cert = await this.contract.getCertificate(id);
    console.log('getCertificate原始返回:', cert);
    
    // 合约返回的是一个tuple结构体，可能是数组或对象形式
    let result;
    if (Array.isArray(cert)) {
      // 数组格式: [id, student, institution, program, level, issuedAt, expiresAt, uri, docHash]
      result = {
        id: cert[0] ? (cert[0].toNumber ? cert[0].toNumber() : Number(cert[0])) : id,
        student: cert[1] || '0x0000000000000000000000000000000000000000',
        institution: cert[2] || '0x0000000000000000000000000000000000000000',
        program: cert[3] || '',
        level: cert[4] || '',
        issuedAt: cert[5] ? (cert[5].toNumber ? cert[5].toNumber() : Number(cert[5])) : 0,
        expiresAt: cert[6] ? (cert[6].toNumber ? cert[6].toNumber() : Number(cert[6])) : 0,
        uri: cert[7] || '',
        docHash: cert[8] || '0x0000000000000000000000000000000000000000000000000000000000000000'
      };
    } else {
      // 对象格式
      result = {
        id: cert.id ? (cert.id.toNumber ? cert.id.toNumber() : Number(cert.id)) : id,
        student: cert.student || '0x0000000000000000000000000000000000000000',
        institution: cert.institution || '0x0000000000000000000000000000000000000000',
        program: cert.program || '',
        level: cert.level || '',
        issuedAt: cert.issuedAt ? (cert.issuedAt.toNumber ? cert.issuedAt.toNumber() : Number(cert.issuedAt)) : 0,
        expiresAt: cert.expiresAt ? (cert.expiresAt.toNumber ? cert.expiresAt.toNumber() : Number(cert.expiresAt)) : 0,
        uri: cert.uri || '',
        docHash: cert.docHash || '0x0000000000000000000000000000000000000000000000000000000000000000'
      };
    }
    
    console.log('getCertificate处理后:', result);
    return result;
  }

  // 获取院校信息
  async getInstitution(address: string): Promise<any> {
    try {
      // 使用专用getter函数
      const result = await this.contract.getInstitution(address);
      console.log("获取院校信息原始返回:", result);
      
      // ethers.js会将返回值解析为数组，我们需要正确提取信息
      // 第一个元素是name，第二个元素是metadataURI
      const name = result[0] || result.name || "";  // 兼容不同返回格式
      const metadataURI = result[1] || result.metadataURI || "";
      
      console.log("处理后院校信息:", { name, metadataURI });
      
      // 检查名称是否为空
      if (name && name.trim().length > 0) {
        return {
          name: name,
          metadata: metadataURI
        };
      }
      throw new Error('院校未注册或名称为空');
    } catch (error: any) {
      console.error("获取院校信息错误:", error);
      // 如果是合约调用异常，返回一个友好的错误
      if (error && error.code === 'CALL_EXCEPTION') {
        throw new Error('院校查询失败：该地址未注册为院校');
      }
      throw error;
    }
  }

  // 获取学生信息
  async getStudent(address: string): Promise<any> {
    try {
      // 使用专用getter函数
      const result = await this.contract.getStudent(address);
      console.log("获取学生信息原始返回:", result);
      
      // ethers.js会将返回值解析为数组或对象，我们需要正确提取信息
      // 如果是数组，按顺序提取；如果是对象，按属性名提取
      let name, studentId, metadataURI, active, registeredAt;
      
      if (Array.isArray(result)) {
        // 按数组索引提取
        name = result[0] || "";
        studentId = result[1] || "";
        metadataURI = result[2] || "";
        active = result[3] || false;
        registeredAt = result[4] || 0;
      } else {
        // 按对象属性提取
        name = result.name || "";
        studentId = result.studentId || "";
        metadataURI = result.metadataURI || "";
        active = result.active || false;
        registeredAt = result.registeredAt || 0;
      }
      
      console.log("处理后学生信息:", { name, studentId, metadataURI, active, registeredAt });
      
      // 检查名称是否为空
      if (name && name.trim().length > 0) {
        return {
          name: name,
          studentId: studentId,
          metadataURI: metadataURI,
          active: !!active,  // 确保是布尔值
          registeredAt: registeredAt ? 
            (typeof registeredAt.toNumber === 'function' ? 
              registeredAt.toNumber() : 
              parseInt(registeredAt.toString())) : 0
        };
      }
      throw new Error('学生未注册或名称为空');
    } catch (error: any) {
      console.error("获取学生信息错误:", error);
      // 如果是合约调用异常，返回一个友好的错误
      if (error && error.code === 'CALL_EXCEPTION') {
        throw new Error('学生查询失败：该地址未注册为学生');
      }
      throw error;
    }
  }

  // 检查账户是否有管理员角色
  async isAdmin(account: string): Promise<boolean> {
    const adminRole = await this.contract.DEFAULT_ADMIN_ROLE();
    return await this.contract.hasRole(adminRole, account);
  }

  // 检查账户是否有院校角色
  async isInstitution(account: string): Promise<boolean> {
    const institutionRole = await this.contract.INSTITUTION_ROLE();
    return await this.contract.hasRole(institutionRole, account);
  }
}
