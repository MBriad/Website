import { FastifyInstance } from 'fastify';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, writeFile } from 'fs';
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
    bodyLimit: 200 * 1024 * 1024  // 200MB 限制（FLAC 文件较大）
  }, async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: '请选择要上传的文件' });
    }

    // FLAC 音频上传
    const isFlac = data.mimetype === 'audio/flac' || data.mimetype === 'audio/x-flac' || data.filename?.endsWith('.flac');

    if (isFlac) {
      const buffer = await data.toBuffer();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.flac`;
      const filepath = join(uploadsDir, filename);

      try {
        await new Promise<void>((resolve, reject) => {
          writeFile(filepath, buffer, (err) => err ? reject(err) : resolve());
        });
        return { url: `/uploads/${filename}`, filename };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'FLAC 文件保存失败' });
      }
    }

    // 图片上传
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(data.mimetype)) {
      return reply.status(400).send({ error: '只支持 JPG、PNG、GIF、WebP、FLAC 格式' });
    }

    const buffer = await data.toBuffer();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const filepath = join(uploadsDir, filename);

    try {
      await sharp(buffer)
        .resize(1920, null, { withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 80 })
        .toFile(filepath);

      return { url: `/uploads/${filename}`, filename };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '图片处理失败' });
    }
  });
}
