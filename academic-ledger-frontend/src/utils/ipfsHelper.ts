/**
 * IPFS辅助函数
 */

/**
 * 将IPFS URI转换为HTTP网关URL
 */
export function ipfsUriToHttp(uri: string): string {
  if (!uri) return '';
  
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  } else if (uri.startsWith('Qm') || uri.startsWith('baf')) {
    return `https://gateway.pinata.cloud/ipfs/${uri}`;
  } else if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }
  
  return '';
}

/**
 * 从URI或URL检测文件类型
 */
export function detectFileType(uri: string): 'image' | 'pdf' | 'other' {
  if (!uri) return 'other';
  
  const lower = uri.toLowerCase();
  
  // 图片类型
  if (
    lower.includes('.jpg') || 
    lower.includes('.jpeg') || 
    lower.includes('.png') || 
    lower.includes('.gif') || 
    lower.includes('.webp') ||
    lower.includes('.svg') ||
    lower.includes('.bmp')
  ) {
    return 'image';
  }
  
  // PDF类型
  if (lower.includes('.pdf')) {
    return 'pdf';
  }
  
  return 'other';
}

/**
 * 从IPFS获取文件元数据（异步）
 * 注意：这个函数会尝试通过HTTP HEAD请求获取Content-Type
 */
export async function getFileTypeFromIPFS(uri: string): Promise<'image' | 'pdf' | 'other'> {
  // 首先尝试从URI检测
  const typeFromUri = detectFileType(uri);
  if (typeFromUri !== 'other') {
    return typeFromUri;
  }
  
  // 如果URI检测不出来，尝试通过HTTP请求获取Content-Type
  try {
    const httpUrl = ipfsUriToHttp(uri);
    if (!httpUrl) return 'other';
    
    const response = await fetch(httpUrl, { method: 'HEAD' });
    const contentType = response.headers.get('Content-Type');
    
    if (!contentType) return 'other';
    
    if (contentType.startsWith('image/')) {
      return 'image';
    } else if (contentType.includes('pdf')) {
      return 'pdf';
    }
    
    return 'other';
  } catch (error) {
    console.warn('无法获取IPFS文件类型:', error);
    return 'other';
  }
}

/**
 * 格式化IPFS哈希（缩短显示）
 */
export function formatIPFSHash(hash: string, startChars = 10, endChars = 8): string {
  if (!hash) return '';
  
  // 移除ipfs://前缀
  const cleanHash = hash.replace('ipfs://', '');
  
  if (cleanHash.length <= startChars + endChars + 3) {
    return cleanHash;
  }
  
  return `${cleanHash.slice(0, startChars)}...${cleanHash.slice(-endChars)}`;
}

/**
 * 验证IPFS哈希格式
 */
export function isValidIPFSHash(hash: string): boolean {
  if (!hash) return false;
  
  const cleanHash = hash.replace('ipfs://', '');
  
  // CIDv0 (Qm...) 格式验证
  if (cleanHash.startsWith('Qm') && cleanHash.length === 46) {
    return true;
  }
  
  // CIDv1 (baf...) 格式验证
  if (cleanHash.startsWith('baf') && cleanHash.length > 10) {
    return true;
  }
  
  return false;
}

