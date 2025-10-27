import React, { useState, useEffect } from 'react';
import './Modal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  ipfsUri?: string; // 新增：IPFS文档URI
  documentType?: 'image' | 'pdf' | 'other'; // 新增：文档类型
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  showCancel = true,
  ipfsUri,
  documentType
}) => {
  const [httpUrl, setHttpUrl] = useState<string>('');

  // 将IPFS URI转换为HTTP网关URL
  useEffect(() => {
    console.log('📦 ConfirmModal收到的props:', { ipfsUri, documentType });
    if (ipfsUri) {
      let url = '';
      if (ipfsUri.startsWith('ipfs://')) {
        const hash = ipfsUri.replace('ipfs://', '');
        url = `https://gateway.pinata.cloud/ipfs/${hash}`;
      } else if (ipfsUri.startsWith('Qm') || ipfsUri.startsWith('baf')) {
        url = `https://gateway.pinata.cloud/ipfs/${ipfsUri}`;
      } else {
        url = ipfsUri;
      }
      console.log('🌐 转换后的HTTP URL:', url);
      setHttpUrl(url);
    }
  }, [ipfsUri]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  // 自动检测文档类型
  const detectDocType = (): 'image' | 'pdf' | 'other' => {
    if (documentType) return documentType;
    
    if (httpUrl) {
      const lower = httpUrl.toLowerCase();
      if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.gif')) {
        return 'image';
      }
      if (lower.includes('.pdf')) {
        return 'pdf';
      }
    }
    return 'other';
  };

  // 渲染IPFS内容预览
  const renderIPFSPreview = () => {
    console.log('🖼️ renderIPFSPreview被调用');
    console.log('  - httpUrl:', httpUrl);
    console.log('  - ipfsUri prop:', ipfsUri);
    console.log('  - documentType prop:', documentType);
    
    if (!httpUrl) {
      console.log('⚠️ httpUrl为空，不渲染预览');
      return null;
    }

    const docType = detectDocType();
    console.log('  - 检测到的文档类型:', docType);

    return (
      <div className="ipfs-preview-container">
        <div className="ipfs-preview-header">
          <span className="preview-icon">📎</span>
          <span className="preview-title">证书文档</span>
        </div>
        
        {docType === 'image' && (
          <div className="ipfs-image-preview">
            <img 
              src={httpUrl} 
              alt="证书文档" 
              className="preview-image"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<p class="preview-error">⚠️ 图片加载失败</p>';
                }
              }}
            />
          </div>
        )}
        
        {docType === 'pdf' && (
          <div className="ipfs-pdf-preview">
            <iframe 
              src={httpUrl}
              className="preview-pdf"
              title="证书PDF"
            />
            <p className="pdf-hint">如果PDF未显示，<a href={httpUrl} target="_blank" rel="noopener noreferrer">点击这里打开</a></p>
          </div>
        )}
        
        <div className="ipfs-actions">
          <a 
            href={httpUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ipfs-link-btn"
          >
            🔗 在新窗口打开
          </a>
          <button 
            className="ipfs-copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(httpUrl);
              alert('链接已复制到剪贴板');
            }}
          >
            📋 复制链接
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  // 解析消息内容为结构化数据
  const renderMessage = () => {
    // 检查是否是证书详情格式
    if (message.includes('━━━━━━━━━━━━━━━━━━━━━━') || message.includes('╔══════════════════════════╗')) {
      const formattedHtml = formatCertificateMessage(message);
      console.log('🔍 格式化后的HTML:', formattedHtml.substring(0, 500));
      return <div className="certificate-details" dangerouslySetInnerHTML={{ __html: formattedHtml }} />;
    }
    
    // 普通消息
    return <p className="modal-message">{message}</p>;
  };

  // 格式化证书消息为HTML（改进版：更整齐）
  const formatCertificateMessage = (text: string): string => {
    let html = text;
    
    console.log('🔧 开始格式化，原始文本长度:', text.length);
    console.log('🔧 原始文本前100字符:', text.substring(0, 100));
    
    // 【第一步】处理IPFS图片标记 [IPFS_IMAGE:uri]
    html = html.replace(/\[IPFS_IMAGE:(.*?)\]/g, (match, uri) => {
      console.log('🖼️ 发现图片标记:', uri);
      // 转换IPFS URI为HTTP URL
      let httpUrl = '';
      if (uri.startsWith('ipfs://')) {
        httpUrl = `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`;
      } else if (uri.startsWith('baf') || uri.startsWith('Qm')) {
        httpUrl = `https://gateway.pinata.cloud/ipfs/${uri}`;
      } else {
        httpUrl = uri;
      }
      
      return `<div class="cert-ipfs-preview">
        <div class="cert-preview-header">📎 证书文档</div>
        <img src="${httpUrl}" alt="证书" class="cert-preview-image" onerror="this.onerror=null; this.src=''; this.style.display='none'; this.nextElementSibling.style.display='block';" />
        <div class="cert-preview-error" style="display:none;">⚠️ 图片加载失败</div>
        <div class="cert-preview-actions">
          <a href="${httpUrl}" target="_blank" rel="noopener noreferrer" class="cert-preview-link">🔗 在新窗口打开</a>
        </div>
      </div>`;
    });
    
    // 【第二步】移除所有URI相关的行（不显示文档URL）
    html = html.replace(/^.*[Uu][Rr][Ii].*$/gm, '');
    html = html.replace(/^.*文档.*$/gm, '');
    html = html.replace(/^.*ipfs:\/\/.*$/gm, '');
    html = html.replace(/^.*bafkrei.*$/gm, '');
    
    // 【第二步】移除装饰性的标题框
    html = html.replace(/╔══════════════════════════╗/g, '');
    html = html.replace(/╚══════════════════════════╝/g, '');
    html = html.replace(/我颁发的证书列表/g, '');
    html = html.replace(/我的证书列表/g, '');
    
    // 【第三步】识别并格式化章节标题（必须在键值对处理之前）
    html = html.replace(/👤 学生信息/g, '<div class="section-header student-section"><span class="section-icon">👤</span><span class="section-title">学生信息</span></div>');
    html = html.replace(/🏫 院校信息/g, '<div class="section-header institution-section"><span class="section-icon">🏫</span><span class="section-title">院校信息</span></div>');
    html = html.replace(/📚 证书数量:\s*(\d+)/g, '<div class="cert-count"><span class="count-icon">📚</span><span class="count-text">证书数量: <strong>$1</strong></span></div>');
    html = html.replace(/📚 共颁发\s*(\d+)\s*份证书/g, '<div class="cert-count"><span class="count-icon">📚</span><span class="count-text">共颁发 <strong>$1</strong> 份证书</span></div>');
    
    // 【第四步】替换分隔线
    html = html.replace(/━━━━━━━━━━━━━━━━━━━━━━/g, '<div class="section-divider"></div>');
    
    // 【第五步】格式化证书标题（如"【证书 1】"）
    html = html.replace(/【证书 (\d+)】/g, '<div class="cert-item-header"><span class="cert-number">证书 $1</span></div>');
    
    // 【第五步】格式化键值对 (key: value) - 使用网格布局
    html = html.replace(/^([^:\n<]+):\s*(.+)$/gm, (match, key, value) => {
      // 跳过已经处理过的HTML标签
      if (key.includes('<') || key.includes('div') || key.includes('span')) return match;
      
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      
      // 跳过空值
      if (!trimmedValue || !trimmedKey) return '';
      
      let cssClass = 'info-row';
      
      // 高亮重要信息
      if (trimmedKey === '证书ID') cssClass += ' highlight';
      if (trimmedKey === '姓名') cssClass += ' important';
      
      // 处理地址显示（使用等宽字体）
      let displayValue = trimmedValue;
      if (trimmedKey.includes('地址')) {
        displayValue = `<code class="address-value">${trimmedValue}</code>`;
      }
      
      return `<div class="${cssClass}"><div class="info-label-col">${trimmedKey}</div><div class="info-value-col">${displayValue}</div></div>`;
    });
    
    // 【第六步】格式化警告信息
    html = html.replace(/⚠️\s*(.+?)(?=<|$)/g, '<div class="warning-text"><span class="warning-icon">⚠️</span>$1</div>');
    
    // 【第七步】清理多余的换行和孤立的冒号
    html = html.replace(/\n\n+/g, '\n');
    html = html.replace(/\n/g, '');
    html = html.replace(/:\s*<div/g, '<div'); // 移除可能遗留的单独冒号
    html = html.replace(/<\/div>\s*:/g, '</div>'); // 移除div后的冒号
    
    return html;
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className={`modal-container ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-modern">
          <div className="modal-title-wrapper">
            <div className={`modal-icon ${type}`}>
              {type === 'success' && '✅'}
              {type === 'error' && '❌'}
              {type === 'warning' && '⚠️'}
              {type === 'info' && '📋'}
            </div>
            <h3 className={`modal-title-modern ${type}`}>{title}</h3>
          </div>
          {onCancel && (
            <button className="modal-close-modern" onClick={onCancel}>
              <span>✕</span>
            </button>
          )}
        </div>
        
        <div className="modal-body-modern">
          {renderMessage()}
          {renderIPFSPreview()}
          
          <div className="modal-actions-modern">
            {showCancel && onCancel && (
              <button 
                className="modal-btn-modern cancel" 
                onClick={onCancel}
                onKeyDown={handleKeyDown}
              >
                {cancelText}
              </button>
            )}
            <button 
              className={`modal-btn-modern confirm ${type}`}
              onClick={onConfirm}
              onKeyDown={handleKeyDown}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
