import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { articleRoutes } from './routes/articles.js';
import { projectRoutes } from './routes/projects.js';
import { linkRoutes } from './routes/links.js';
import { configRoutes } from './routes/config.js';
// 加载环境变量
dotenv.config();
const fastify = Fastify({
    logger: true
});
// 注册插件
async function registerPlugins() {
    await fastify.register(cors, {
        origin: process.env.NODE_ENV === 'production'
            ? ['https://mbri.dev']
            : ['http://localhost:5173', 'http://localhost:5179'],
        credentials: true
    });
    await fastify.register(helmet);
    await fastify.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute'
    });
}
// 注册路由
async function registerRoutes() {
    await fastify.register(articleRoutes);
    await fastify.register(projectRoutes);
    await fastify.register(linkRoutes);
    await fastify.register(configRoutes);
}
// 启动服务器
async function start() {
    try {
        // 连接数据库
        await connectDatabase();
        // 注册插件
        await registerPlugins();
        // 注册路由
        await registerRoutes();
        // 启动服务器
        const port = parseInt(process.env.PORT || '3000');
        const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
        await fastify.listen({ port, host });
        console.log(`✅ 服务器启动成功: http://${host}:${port}`);
    }
    catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map