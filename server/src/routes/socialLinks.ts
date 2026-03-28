import { FastifyInstance } from 'fastify';
import { SocialLink } from '../models/SocialLink.js';
import { authMiddleware } from '../middleware/auth.js';

export async function socialLinkRoutes(fastify: FastifyInstance) {
  fastify.get('/api/social-links', async () => {
    const links = await SocialLink.find({ active: true }).sort({ order: 1 });
    return links;
  });

  fastify.get('/api/social-links/all', async () => {
    const links = await SocialLink.find().sort({ order: 1 });
    return links;
  });

  fastify.post('/api/social-links', { onRequest: [authMiddleware] }, async (request, reply) => {
    const body = request.body as {
      name: string;
      url: string;
      icon: string;
      order?: number;
      active?: boolean;
    };

    const link = new SocialLink(body);
    await link.save();
    return link;
  });

  fastify.put('/api/social-links/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{
      name: string;
      url: string;
      icon: string;
      order: number;
      active: boolean;
    }>;

    const link = await SocialLink.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!link) {
      return reply.status(404).send({ error: '社交链接不存在' });
    }
    return link;
  });

  fastify.delete('/api/social-links/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const link = await SocialLink.findByIdAndDelete(id);
    if (!link) {
      return reply.status(404).send({ error: '社交链接不存在' });
    }
    return { success: true };
  });
}