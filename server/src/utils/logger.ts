import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保日志目录存在
const logsDir = join(__dirname, '../../logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

/**
 * 创建 Fastify logger 配置
 * - 开发环境：终端彩色输出 + 文件日志
 * - 生产环境：仅文件日志
 */
export function createLoggerConfig() {
  const isDev = process.env.NODE_ENV !== 'production';
  const logFile = join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);

  if (isDev) {
    // 开发环境：终端彩色 + 文件 JSON
    return {
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            level: 'info',
            options: { colorize: true, translateTime: 'SYS:HH:MM:ss' }
          },
          {
            target: 'pino/file',
            level: 'info',
            options: { destination: logFile, mkdir: true }
          }
        ]
      }
    };
  }

  // 生产环境：仅文件 JSON
  return {
    transport: {
      target: 'pino/file',
      options: { destination: logFile, mkdir: true }
    }
  };
}
