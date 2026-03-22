import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/api/login', async (request, reply) => {
    const { username, password } = request.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return reply.status(400).send({ error: '请输入用户名和密码' });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminUsername || !adminPasswordHash) {
      fastify.log.error('管理员账号未配置');
      return reply.status(500).send({ error: '服务器配置错误' });
    }

    if (username !== adminUsername) {
      return reply.status(401).send({ error: '用户名或密码错误' });
    }

    const passwordMatch = await bcrypt.compare(password, adminPasswordHash);
    if (!passwordMatch) {
      return reply.status(401).send({ error: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { username },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    return { token };
  });
}
