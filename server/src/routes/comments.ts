import { FastifyInstance } from 'fastify';
import { Comment } from '../models/Comment.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

export async function commentRoutes(fastify: FastifyInstance) {
  // 获取文章评论列表（公开）
  fastify.get('/api/comments/:articleId', { onRequest: [optionalAuthMiddleware] }, async (request, reply) => {
    const { articleId } = request.params as { articleId: string };

    const comments = await Comment.find({ articleId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });

    return comments.map((c) => ({
      id: c._id,
      content: c.content,
      createdAt: c.createdAt,
      user: {
        id: (c.userId as any)._id,
        username: (c.userId as any).username,
        avatar: (c.userId as any).avatar,
      },
    }));
  });

  // 发表评论（需登录）
  fastify.post('/api/comments', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { userId } = (request as any).user;
    const { articleId, content } = request.body as {
      articleId?: string;
      content?: string;
    };

    if (!articleId || !content) {
      return reply.status(400).send({ error: '请填写文章ID和评论内容' });
    }

    if (content.length > 1000) {
      return reply.status(400).send({ error: '评论内容不能超过 1000 字' });
    }

    const comment = new Comment({ articleId, userId, content });
    await comment.save();

    const populated = await comment.populate('userId', 'username avatar');

    return reply.status(201).send({
      id: populated._id,
      content: populated.content,
      createdAt: populated.createdAt,
      user: {
        id: (populated.userId as any)._id,
        username: (populated.userId as any).username,
        avatar: (populated.userId as any).avatar,
      },
    });
  });

  // 删除评论（自己的或管理员）
  fastify.delete('/api/comments/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { userId, role } = (request as any).user;
    const { id } = request.params as { id: string };

    const comment = await Comment.findById(id);
    if (!comment) {
      return reply.status(404).send({ error: '评论不存在' });
    }

    if (comment.userId.toString() !== userId && role !== 'admin') {
      return reply.status(403).send({ error: '无权删除此评论' });
    }

    await Comment.findByIdAndDelete(id);
    return { message: '评论已删除' };
  });
}
