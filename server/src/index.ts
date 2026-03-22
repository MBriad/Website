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
import { authRoutes } from './routes/auth.js';

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
}

// 注册路由
async function registerRoutes() {
  await fastify.register(authRoutes);
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
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

start();
