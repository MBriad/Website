import { FastifyInstance } from 'fastify';
import { Link } from '../models/Link.js';

export async function linkRoutes(fastify: FastifyInstance) {
  // 获取友链列表
  fastify.get('/api/links', async (request, reply) => {
    const links = await Link.find()
      .sort({ createdAt: -1 });
    
    return links;
  });
}
