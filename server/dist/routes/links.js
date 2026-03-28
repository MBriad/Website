import { Link } from '../models/Link.js';
import { authMiddleware } from '../middleware/auth.js';
export async function linkRoutes(fastify) {
    // 获取友链列表
    fastify.get('/api/links', async (request, reply) => {
        const links = await Link.find()
            .sort({ createdAt: -1 });
        return links;
    });
    // 创建友链
    fastify.post('/api/links', { onRequest: [authMiddleware] }, async (request, reply) => {
        const body = request.body;
        const link = new Link(body);
        await link.save();
        return reply.status(201).send(link);
    });
    // 更新友链
    fastify.put('/api/links/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        const link = await Link.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!link) {
            return reply.status(404).send({ error: '友链未找到' });
        }
        return link;
    });
    // 删除友链
    fastify.delete('/api/links/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
        const { id } = request.params;
        const link = await Link.findByIdAndDelete(id);
        if (!link) {
            return reply.status(404).send({ error: '友链未找到' });
        }
        return { message: '友链已删除' };
    });
}
//# sourceMappingURL=links.js.map