import { Project } from '../models/Project.js';
export async function projectRoutes(fastify) {
    // 获取项目列表
    fastify.get('/api/projects', async (request, reply) => {
        const projects = await Project.find()
            .sort({ createdAt: -1 });
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
    // 获取精选项目
    fastify.get('/api/projects/featured', async (request, reply) => {
        const projects = await Project.find({ featured: true })
            .sort({ createdAt: -1 })
            .limit(5);
        return projects;
    });
}
//# sourceMappingURL=projects.js.map