import { FastifyInstance } from 'fastify';
import { SiteConfig } from '../models/SiteConfig.js';
import { authMiddleware } from '../middleware/auth.js';

export async function configRoutes(fastify: FastifyInstance) {
  // 获取网站配置
  fastify.get('/api/config', async (request, reply) => {
    const config = await SiteConfig.findOne();
    
    if (!config) {
      return reply.status(404).send({ error: '网站配置未找到' });
    }
    
    return config;
  });

  // 更新网站配置
  fastify.put('/api/config', { onRequest: [authMiddleware] }, async (request, reply) => {
    const body = request.body as {
      avatar?: string;
      nickname?: string;
      bio?: string;
      socialLinks?: {
        github?: string;
        email?: string;
        twitter?: string;
      };
    };

    const config = await SiteConfig.findOneAndUpdate(
      {},
      body,
      { new: true, runValidators: true }
    );

    if (!config) {
      return reply.status(404).send({ error: '网站配置未找到' });
    }

    return config;
  });
}
