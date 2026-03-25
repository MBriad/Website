import { FastifyInstance } from 'fastify';
import { Music } from '../models/Music.js';
import { authMiddleware } from '../middleware/auth.js';

export async function musicRoutes(fastify: FastifyInstance) {
  // 获取音乐列表（公开）
  fastify.get('/api/music', async () => {
    return Music.find().sort({ order: 1, createdAt: -1 });
  });

  // 创建音乐条目
  fastify.post('/api/music', { onRequest: [authMiddleware] }, async (request, reply) => {
    const body = request.body as {
      title?: string;
      artist?: string;
      src?: string;
      cover?: string;
      order?: number;
    };

    if (!body.title || !body.artist || !body.src) {
      return reply.status(400).send({ error: '请填写标题、艺术家和音频文件' });
    }

    const music = new Music(body);
    await music.save();
    return reply.status(201).send(music);
  });

  // 更新音乐条目
  fastify.put('/api/music/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const music = await Music.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!music) {
      return reply.status(404).send({ error: '音乐条目不存在' });
    }
    return music;
  });

  // 删除音乐条目
  fastify.delete('/api/music/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const music = await Music.findByIdAndDelete(id);
    if (!music) {
      return reply.status(404).send({ error: '音乐条目不存在' });
    }
    return { message: '已删除' };
  });
}
