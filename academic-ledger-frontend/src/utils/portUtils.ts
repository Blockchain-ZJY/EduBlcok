import { createServer } from 'net';

/**
 * 检查端口是否可用
 * @param port 要检查的端口号
 * @returns Promise<boolean> 端口是否可用
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * 查找下一个可用端口
 * @param startPort 起始端口号
 * @param maxPort 最大端口号
 * @returns Promise<number> 可用的端口号
 */
export async function findAvailablePort(startPort: number = 3002, maxPort: number = 3010): Promise<number> {
  for (let port = startPort; port <= maxPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  // 如果指定范围内没有可用端口，抛出错误
  throw new Error(`No available port found in range ${startPort}-${maxPort}`);
}

/**
 * 获取动态端口配置
 * @param preferredPort 首选端口
 * @returns Promise<{port: number, message: string}>
 */
export async function getDynamicPortConfig(preferredPort: number = 3002): Promise<{port: number, message: string}> {
  try {
    const port = await findAvailablePort(preferredPort);
    
    if (port === preferredPort) {
      return {
        port,
        message: `✅ 使用首选端口 ${port}`
      };
    } else {
      return {
        port,
        message: `⚠️  端口 ${preferredPort} 被占用，自动切换到端口 ${port}`
      };
    }
  } catch (error) {
    // 如果所有端口都被占用，使用默认端口让Vite自己处理
    return {
      port: 0, // 0 表示让Vite自动选择
      message: `❌ 端口 ${preferredPort}-3010 都被占用，让Vite自动选择端口`
    };
  }
}
