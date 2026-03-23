import { FastifyInstance } from 'fastify';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import sharp from 'sharp';
import { authMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保上传目录存在
const uploadsDir = join(__dirname, '../../uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

export async function uploadRoutes(fastify: FastifyInstance) {
  // 上传图片接口（受 auth 保护）
  fastify.post('/api/upload', {
    onRequest: [authMiddleware],
    bodyLimit: 10 * 1024 * 1024  // 10MB 限制
  }, async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: '请选择要上传的图片' });
    }

    // 验证文件类型
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(data.mimetype)) {
      return reply.status(400).send({ error: '只支持 JPG、PNG、GIF、WebP 格式' });
    }

    // 读取文件内容
    const buffer = await data.toBuffer();

    // 生成文件名：时间戳 + 随机数 + .webp
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const filepath = join(uploadsDir, filename);

    try {
      // 使用 sharp 处理图片：压缩 + 转 webp + 限制最大宽度
      await sharp(buffer)
        .resize(1920, null, {  // 最大宽度 1920px，高度按比例
          withoutEnlargement: true,  // 不放大
          fit: 'inside'
        })
        .webp({ quality: 80 })  // WebP 格式，质量 80
        .toFile(filepath);

      // 返回可访问的 URL 路径
      const url = `/uploads/${filename}`;

      return { url, filename };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '图片处理失败' });
    }
  });
}
