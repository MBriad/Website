import { FastifyInstance } from 'fastify';
import { SiteConfig } from '../models/SiteConfig.js';

export async function configRoutes(fastify: FastifyInstance) {
  // 获取网站配置
  fastify.get('/api/config', async (request, reply) => {
    const config = await SiteConfig.findOne();
    
    if (!config) {
      return reply.status(404).send({ error: '网站配置未找到' });
    }
    
    return config;
  });
}
