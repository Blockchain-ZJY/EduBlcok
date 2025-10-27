import axios from 'axios';

// Pinata API配置
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';

// Pinata API端点
const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export interface PinataMetadata {
  name: string;
  keyvalues?: { [key: string]: string | number };
}

export interface UploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export interface FileMetadata {
  studentName: string;
  studentId: string;
  institutionName: string;
  program: string;
  level: string;
  issuedDate: string;
  description?: string;
  [key: string]: any;
}

/**
 * Pinata IPFS 服务类
 */
export class PinataService {
  private apiKey: string;
  private secretKey: string;
  private jwt: string;

  constructor(apiKey?: string, secretKey?: string, jwt?: string) {
    this.apiKey = apiKey || PINATA_API_KEY;
    this.secretKey = secretKey || PINATA_SECRET_KEY;
    this.jwt = jwt || PINATA_JWT;
  }

  /**
   * 获取请求头（使用JWT认证）
   */
  private getHeaders() {
    if (this.jwt) {
      return {
        'Authorization': `Bearer ${this.jwt}`
      };
    }
    // 备用方案：使用API Key和Secret
    return {
      'pinata_api_key': this.apiKey,
      'pinata_secret_api_key': this.secretKey
    };
  }

  /**
   * 测试连接
   */
  async testAuthentication(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${PINATA_BASE_URL}/data/testAuthentication`,
        { headers: this.getHeaders() }
      );
      return response.data.message === 'Congratulations! You are communicating with the Pinata API!';
    } catch (error: any) {
      console.error('Pinata认证失败:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * 上传文件到IPFS
   */
  async uploadFile(file: File, metadata?: PinataMetadata): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (metadata) {
        formData.append('pinataMetadata', JSON.stringify(metadata));
      }

      // Pinata选项
      const pinataOptions = {
        cidVersion: 1,
      };
      formData.append('pinataOptions', JSON.stringify(pinataOptions));

      const response = await axios.post(
        `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          maxBodyLength: Infinity
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('上传文件到IPFS失败:', error.response?.data || error.message);
      throw new Error(`上传失败: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * 上传JSON数据到IPFS
   */
  async uploadJSON(jsonData: any, metadata?: PinataMetadata): Promise<UploadResponse> {
    try {
      const data = {
        pinataContent: jsonData,
        pinataMetadata: metadata || {
          name: 'certificate-metadata.json'
        },
        pinataOptions: {
          cidVersion: 1
        }
      };

      const response = await axios.post(
        `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
        data,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('上传JSON到IPFS失败:', error.response?.data || error.message);
      throw new Error(`上传失败: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * 创建证书元数据并上传到IPFS
   */
  async uploadCertificateMetadata(metadata: FileMetadata): Promise<string> {
    try {
      const jsonMetadata = {
        name: `${metadata.studentName} - ${metadata.program}证书`,
        description: metadata.description || `${metadata.institutionName}颁发的${metadata.level}证书`,
        image: '', // 如果有证书图片，可以先上传图片再填入IPFS URL
        attributes: [
          {
            trait_type: '学生姓名',
            value: metadata.studentName
          },
          {
            trait_type: '学号',
            value: metadata.studentId
          },
          {
            trait_type: '颁发机构',
            value: metadata.institutionName
          },
          {
            trait_type: '专业/课程',
            value: metadata.program
          },
          {
            trait_type: '学位/等级',
            value: metadata.level
          },
          {
            trait_type: '颁发日期',
            value: metadata.issuedDate
          }
        ],
        properties: metadata
      };

      const pinataMetadata: PinataMetadata = {
        name: `certificate-${metadata.studentId}-${Date.now()}.json`,
        keyvalues: {
          studentId: metadata.studentId,
          institution: metadata.institutionName,
          type: 'certificate-metadata'
        }
      };

      const result = await this.uploadJSON(jsonMetadata, pinataMetadata);
      return result.IpfsHash;
    } catch (error: any) {
      console.error('上传证书元数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取IPFS内容的URL
   */
  getIPFSUrl(hash: string): string {
    return `${PINATA_GATEWAY}/${hash}`;
  }

  /**
   * 获取IPFS网关URL（支持自定义网关）
   */
  getGatewayUrl(hash: string, gateway?: string): string {
    if (gateway) {
      return `${gateway}/${hash}`;
    }
    return this.getIPFSUrl(hash);
  }

  /**
   * 从IPFS获取JSON数据
   */
  async getJSONFromIPFS(hash: string): Promise<any> {
    try {
      const url = this.getIPFSUrl(hash);
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      console.error('从IPFS获取数据失败:', error);
      throw new Error(`获取失败: ${error.message}`);
    }
  }

  /**
   * 取消固定（删除文件）
   */
  async unpinFile(hash: string): Promise<boolean> {
    try {
      await axios.delete(
        `${PINATA_BASE_URL}/pinning/unpin/${hash}`,
        { headers: this.getHeaders() }
      );
      return true;
    } catch (error: any) {
      console.error('取消固定失败:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * 获取固定列表
   */
  async getPinnedFiles(filters?: any): Promise<any> {
    try {
      const response = await axios.get(
        `${PINATA_BASE_URL}/data/pinList`,
        {
          headers: this.getHeaders(),
          params: filters
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('获取固定列表失败:', error.response?.data || error.message);
      throw error;
    }
  }
}

// 导出默认实例
export const pinataService = new PinataService();

