import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';
import { User } from '../models/User.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/api/login', async (request, reply) => {
    const { username, password } = request.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return reply.status(400).send({ error: '请输入用户名和密码' });
    }

    // 查找管理员用户
    const adminUser = await User.findOne({ username, role: 'admin' });
    if (!adminUser) {
      return reply.status(401).send({ error: '用户名或密码错误' });
    }

    // 验证密码
    const passwordMatch = await bcrypt.compare(password, adminUser.password);
    if (!passwordMatch) {
      return reply.status(401).send({ error: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { userId: adminUser._id, username: adminUser.username, role: adminUser.role },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    return { token };
  });
}
