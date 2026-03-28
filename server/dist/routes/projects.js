import { Project } from '../models/Project.js';
import { authMiddleware } from '../middleware/auth.js';
export async function projectRoutes(fastify) {
    // 获取项目列表
    fastify.get('/api/projects', async (request, reply) => {
        const projects = await Project.find()
            .sort({ createdAt: -1 });
        return projects;
    });
    // 获取精选项目
    fastify.get('/api/projects/featured', async (request, reply) => {
        const projects = await Project.find({ featured: true })
            .sort({ createdAt: -1 })
            .limit(5);
        return projects;
    });
    // 获取单个项目
    fastify.get('/api/projects/:id', async (request, reply) => {
        const { id } = request.params;
        const project = await Project.findById(id);
        if (!project) {
            return reply.status(404).send({ error: '项目未找到' });
        }
        return project;
    });
    // 创建项目
    fastify.post('/api/projects', { onRequest: [authMiddleware] }, async (request, reply) => {
        const body = request.body;
        const project = new Project(body);
        await project.save();
        return reply.status(201).send(project);
    });
    // 更新项目
    fastify.put('/api/projects/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        const project = await Project.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!project) {
            return reply.status(404).send({ error: '项目未找到' });
        }
        return project;
    });
    // 删除项目
    fastify.delete('/api/projects/:id', { onRequest: [authMiddleware] }, async (request, reply) => {
        const { id } = request.params;
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return reply.status(404).send({ error: '项目未找到' });
        }
        return { message: '项目已删除' };
    });
}
//# sourceMappingURL=projects.js.map