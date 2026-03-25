import { FastifyInstance } from 'fastify';
import { Wallpaper } from '../models/Wallpaper.js';
import { authMiddleware } from '../middleware/auth.js';

export async function wallpaperRoutes(fastify: FastifyInstance) {
  // 获取启用的壁纸列表（公开）
  fastify.get('/api/wallpapers', async () => {
    return Wallpaper.find({ active: true }).sort({ order: 1, createdAt: -1 });
  });

  // 获取所有壁纸（admin）
  fastify.get('/api/wallpapers/all', { onRequest: [authMiddleware] }, async () => {
    return Wallpaper.find().sort({ order: 1, createdAt: -1 });
  });

  // 创建壁纸
  fastify.post('/api/wallpapers', { onRequest: [authMiddleware] }, async (request, reply) => {
    const body = request.body as { src?: string; theme?: string; order?: number };
    if (!body.src) {
      return reply.status(400).send({ error: '请上传图片' });
    }
    const wallpaper = new Wallpaper(body);
    await wallpaper.save();
    return reply.status(201).send(wallpaper);
  });

  // 更新壁纸
  fastify.put('/api/wallpapers/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const wallpaper = await Wallpaper.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!wallpaper) return reply.status(404).send({ error: '壁纸不存在' });
    return wallpaper;
  });

  // 删除壁纸
  fastify.delete('/api/wallpapers/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const wallpaper = await Wallpaper.findByIdAndDelete(id);
    if (!wallpaper) return reply.status(404).send({ error: '壁纸不存在' });
    return { message: '已删除' };
  });
}
