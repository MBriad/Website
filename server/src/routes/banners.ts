import { FastifyInstance } from 'fastify';
import { PageBanner } from '../models/SiteConfig.js';
import { authMiddleware } from '../middleware/auth.js';

const PAGE_IDS = ['banner_category', 'banner_article', 'banner_links', 'banner_about', 'banner_chip'];

const PAGE_NAMES: Record<string, string> = {
  banner_category: '分类页',
  banner_article: '文章详情页',
  banner_links: '友链页',
  banner_about: '关于我页',
  banner_chip: '小玩具页'
};

export async function bannerRoutes(fastify: FastifyInstance) {
  fastify.get('/api/banners', async () => {
    const banners = await PageBanner.find().sort({ order: 1 });
    return banners;
  });

  fastify.get('/api/banners/:pageId', async (request, reply) => {
    const { pageId } = request.params as { pageId: string };
    const banner = await PageBanner.findOne({ pageId, active: true });
    return banner;
  });

  fastify.put('/api/banners/:pageId', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { pageId } = request.params as { pageId: string };
    if (!PAGE_IDS.includes(pageId)) {
      return reply.status(400).send({ error: '无效的页面ID' });
    }

    const body = request.body as {
      src?: string;
      theme?: 'light' | 'dark' | 'both';
      active?: boolean;
    };

    const banner = await PageBanner.findOneAndUpdate(
      { pageId },
      { ...body, pageId },
      { new: true, upsert: true, runValidators: true }
    );

    return banner;
  });

  fastify.delete('/api/banners/:pageId', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { pageId } = request.params as { pageId: string };
    await PageBanner.deleteOne({ pageId });
    return { success: true };
  });
}

export { PAGE_IDS, PAGE_NAMES };