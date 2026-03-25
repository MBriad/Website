import { FastifyInstance } from 'fastify';
import { Article } from '../models/Article.js';
import { authMiddleware } from '../middleware/auth.js';

export async function articleRoutes(fastify: FastifyInstance) {
  // 获取文章列表
  fastify.get('/api/articles', async (request, reply) => {
    const { page = 1, limit = 10, tag, category } = request.query as any;
    const query: any = { published: true };
    
    if (tag) query.tags = tag;
    if (category) query.category = category;
    
    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Article.countDocuments(query);
    
    return {
      data: articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  // 获取精选文章
  fastify.get('/api/articles/featured', async (request, reply) => {
    const articles = await Article.find({ published: true, featured: true })
      .sort({ createdAt: -1 })
      .limit(5);

    return articles;
  });

  // 获取单篇文章
  fastify.get('/api/articles/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const article = await Article.findOne({ slug, published: true });

    if (!article) {
      return reply.status(404).send({ error: '文章未找到' });
    }

    return article;
  });

  // 创建文章
  fastify.post('/api/articles', { onRequest: [authMiddleware] }, async (request, reply) => {
    const body = request.body as {
      title: string;
      slug: string;
      content: string;
      excerpt: string;
      cover?: string;
      tags?: string[];
      category: string;
      published?: boolean;
      featured?: boolean;
    };

    const article = new Article(body);
    await article.save();

    return reply.status(201).send(article);
  });

  // 更新文章
  fastify.put('/api/articles/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const article = await Article.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!article) {
      return reply.status(404).send({ error: '文章未找到' });
    }

    return article;
  });

  // 删除文章
  fastify.delete('/api/articles/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return reply.status(404).send({ error: '文章未找到' });
    }

    return { message: '文章已删除' };
  });

  // 获取文章发表热力图数据（按日期统计）
  fastify.get('/api/articles/stats/heatmap', async () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const articles = await Article.find(
      { published: true, createdAt: { $gte: oneYearAgo } },
      { createdAt: 1 }
    );

    const heatmap: Record<string, number> = {};
    articles.forEach((a) => {
      const date = a.createdAt.toISOString().slice(0, 10);
      heatmap[date] = (heatmap[date] || 0) + 1;
    });

    return heatmap;
  });
}
