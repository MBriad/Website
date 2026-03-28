import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { JWT_CONFIG } from '../config/jwt.js';
import { authMiddleware } from '../middleware/auth.js';

export async function userRoutes(fastify: FastifyInstance) {
  // 注册
  fastify.post('/api/register', async (request, reply) => {
    const { username, email, password } = request.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      return reply.status(400).send({ error: '请填写所有必填项' });
    }

    if (username.length < 2 || username.length > 20) {
      return reply.status(400).send({ error: '用户名长度需在 2-20 之间' });
    }

    if (password.length < 6) {
      return reply.status(400).send({ error: '密码至少 6 位' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return reply.status(409).send({ error: existing.username === username ? '用户名已存在' : '邮箱已被注册' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 检查是否已有管理员
    const adminCount = await User.countDocuments({ role: 'admin' });
    const role = adminCount === 0 ? 'admin' : 'user';
    
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    return reply.status(201).send({
      token,
      user: { id: user._id, username: user.username, avatar: user.avatar, role: user.role },
    });
  });

  // 用户登录
  fastify.post('/api/user-login', async (request, reply) => {
    const { username, password } = request.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return reply.status(400).send({ error: '请输入用户名和密码' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return reply.status(401).send({ error: '用户名或密码错误' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return reply.status(401).send({ error: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    return {
      token,
      user: { id: user._id, username: user.username, avatar: user.avatar, role: user.role },
    };
  });

  // 获取当前用户信息
  fastify.get('/api/profile', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { userId } = (request as any).user;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return reply.status(404).send({ error: '用户不存在' });
    }
    return { id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role };
  });

  // 更新用户头像
  fastify.put('/api/profile', { onRequest: [authMiddleware] }, async (request, reply) => {
    const { userId } = (request as any).user;
    const { avatar } = request.body as { avatar?: string };

    if (!avatar) {
      return reply.status(400).send({ error: '请提供头像 URL' });
    }

    const user = await User.findByIdAndUpdate(userId, { avatar }, { new: true }).select('-password');
    if (!user) {
      return reply.status(404).send({ error: '用户不存在' });
    }
    return { id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role };
  });
}
