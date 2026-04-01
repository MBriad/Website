/**
 * @file src/routes/logs.ts
 * @brief 管理后台日志查看 API
 */

import { FastifyInstance } from 'fastify';
import { join } from 'path';
import { readdirSync, readFileSync, statSync, unlinkSync, existsSync } from 'fs';
import { authMiddleware } from '../middleware/auth.js';
import { logsDir } from '../utils/logger.js';

const LEVEL_MAP: Record<number, string> = { 10: 'trace', 20: 'debug', 30: 'info', 40: 'warn', 50: 'error', 60: 'fatal' };

export async function logRoutes(fastify: FastifyInstance) {

  // 获取日志文件列表
  fastify.get('/api/logs/files', { preHandler: authMiddleware }, async (_request, reply) => {
    try {
      if (!existsSync(logsDir)) {
        return reply.send({ files: [] });
      }
      const files = readdirSync(logsDir)
        .filter(f => f.startsWith('app-') && f.endsWith('.log'))
        .sort()
        .reverse()
        .map(name => {
          const stat = statSync(join(logsDir, name));
          return { name, size: stat.size, modified: stat.mtime.toISOString() };
        });
      return reply.send({ files });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '获取日志文件列表失败' });
    }
  });

  // 读取日志（分页 + 筛选 + 搜索）
  fastify.get('/api/logs', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { file, level, search, page = '1', limit = '100' } = request.query as Record<string, string>;

      // 确定要读取的文件
      const targetFile = file || `app-${new Date().toISOString().split('T')[0]}.log`;
      const filePath = join(logsDir, targetFile);

      if (!existsSync(filePath)) {
        // 尝试找最近的文件
        const files = readdirSync(logsDir).filter(f => f.startsWith('app-') && f.endsWith('.log')).sort().reverse();
        if (files.length === 0) {
          return reply.send({ logs: [], total: 0, page: 1, totalPages: 0, files: [] });
        }
        return readLogFile(join(logsDir, files[0]), files[0], level, search, parseInt(page), parseInt(limit), reply);
      }

      return readLogFile(filePath, targetFile, level, search, parseInt(page), parseInt(limit), reply);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '读取日志失败' });
    }
  });

  // 清空日志
  fastify.delete('/api/logs', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { file } = request.query as Record<string, string>;

      if (!existsSync(logsDir)) {
        return reply.send({ message: '没有日志文件' });
      }

      if (file === 'all') {
        const files = readdirSync(logsDir).filter(f => f.endsWith('.log'));
        files.forEach(f => unlinkSync(join(logsDir, f)));
        return reply.send({ message: `已清空 ${files.length} 个日志文件` });
      }

      const targetFile = file || `app-${new Date().toISOString().split('T')[0]}.log`;
      const filePath = join(logsDir, targetFile);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        return reply.send({ message: `已清空 ${targetFile}` });
      }
      return reply.status(404).send({ error: '文件不存在' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '清空日志失败' });
    }
  });

  // 下载日志文件
  fastify.get('/api/logs/download', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { file } = request.query as Record<string, string>;
      if (!file) return reply.status(400).send({ error: '缺少文件名参数' });

      const filePath = join(logsDir, file);
      if (!existsSync(filePath)) return reply.status(404).send({ error: '文件不存在' });

      const content = readFileSync(filePath, 'utf-8');
      return reply
        .header('Content-Type', 'text/plain; charset=utf-8')
        .header('Content-Disposition', `attachment; filename="${file}"`)
        .send(content);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '下载日志失败' });
    }
  });
}

function readLogFile(
  filePath: string, fileName: string,
  level: string | undefined, search: string | undefined,
  page: number, limit: number,
  reply: any
) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(Boolean);

  // 解析 pino JSON 日志
  let logs = lines.map(line => {
    try {
      const entry = JSON.parse(line);
      return {
        time: new Date(entry.time).toISOString(),
        level: LEVEL_MAP[entry.level] || String(entry.level),
        levelNum: entry.level,
        msg: entry.msg || '',
        req: entry.req ? { method: entry.req.method, url: entry.req.url } : null,
        res: entry.res ? { statusCode: entry.res.statusCode } : null,
        responseTime: entry.responseTime,
        error: entry.err ? { message: entry.err.message, stack: entry.err.stack } : null,
      };
    } catch {
      return null;
    }
  }).filter(Boolean) as any[];

  // 按级别筛选
  if (level) {
    const levelNum = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 }[level] || 30;
    logs = logs.filter(l => l.levelNum >= levelNum);
  }

  // 关键词搜索
  if (search) {
    const keyword = search.toLowerCase();
    logs = logs.filter(l =>
      l.msg.toLowerCase().includes(keyword) ||
      l.req?.url?.toLowerCase().includes(keyword) ||
      l.error?.message?.toLowerCase().includes(keyword)
    );
  }

  // 最新的在前
  logs.reverse();

  const total = logs.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paged = logs.slice(start, start + limit);

  // 文件列表
  const files = existsSync(logsDir)
    ? readdirSync(logsDir)
        .filter(f => f.startsWith('app-') && f.endsWith('.log'))
        .sort().reverse()
    : [];

  return reply.send({ logs: paged, total, page, totalPages, files, currentFile: fileName });
}
