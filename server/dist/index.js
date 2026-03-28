import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase } from './config/database.js';
import { createLoggerConfig } from './utils/logger.js';
import { articleRoutes } from './routes/articles.js';
import { projectRoutes } from './routes/projects.js';
import { linkRoutes } from './routes/links.js';
import { configRoutes } from './routes/config.js';
import { authRoutes } from './routes/auth.js';
import { uploadRoutes } from './routes/upload.js';
import { userRoutes } from './routes/users.js';
import { commentRoutes } from './routes/comments.js';
import { musicRoutes } from './routes/music.js';
import { wallpaperRoutes } from './routes/wallpapers.js';
import { bannerRoutes } from './routes/banners.js';
import { socialLinkRoutes } from './routes/socialLinks.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 加载环境变量
dotenv.config();
// 创建 logger 配置
const loggerConfig = createLoggerConfig();
const fastify = Fastify({
    logger: loggerConfig,
    bodyLimit: 200 * 1024 * 1024 // 全局 200MB 限制（支持 FLAC 上传）
});
// 注册插件
async function registerPlugins() {
    // CORS 由环境变量 ENABLE_CORS 控制，部署时 Nginx 反代已处理同源
    if (process.env.ENABLE_CORS === 'true') {
        await fastify.register(cors, {
            origin: process.env.NODE_ENV === 'production'
                ? ['https://mbri.dev']
                : true, // 开发环境允许所有来源
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true
        });
    }
    await fastify.register(helmet);
    await fastify.register(rateLimit, {
        // 开发环境不限制，生产环境限制 500 次/分钟
        max: process.env.NODE_ENV === 'development' ? 1000 : 500,
        timeWindow: '1 minute',
        // 自定义错误响应
        errorResponseBuilder: function (request, context) {
            return {
                statusCode: 429,
                error: 'Too Many Requests',
                message: `请求过于频繁，请稍后重试`,
                retryAfter: context.after
            };
        },
        // 添加请求头
        addHeaders: {
            'x-ratelimit-limit': true,
            'x-ratelimit-remaining': true,
            'x-ratelimit-reset': true
        }
    });
    // 文件上传支持（200MB 限制，支持 FLAC）
    await fastify.register(multipart, {
        limits: { fileSize: 200 * 1024 * 1024 }
    });
    // 静态文件服务（uploads 目录）
    await fastify.register(fastifyStatic, {
        root: join(__dirname, '../uploads'),
        prefix: '/uploads/',
        decorateReply: false
    });
}
// 注册路由
async function registerRoutes() {
    // 健康检查
    fastify.get('/api/health', async () => ({ status: 'ok' }));
    await fastify.register(authRoutes);
    await fastify.register(userRoutes);
    await fastify.register(articleRoutes);
    await fastify.register(projectRoutes);
    await fastify.register(linkRoutes);
    await fastify.register(configRoutes);
    await fastify.register(uploadRoutes);
    await fastify.register(commentRoutes);
    await fastify.register(musicRoutes);
    await fastify.register(wallpaperRoutes);
    await fastify.register(bannerRoutes);
    await fastify.register(socialLinkRoutes);
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