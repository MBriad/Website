import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';

export interface JwtPayload {
  userId?: string;
  username: string;
  role: 'user' | 'admin';
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({ error: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, JWT_CONFIG.secret) as JwtPayload;
    (request as any).user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: '认证令牌无效' });
  }
}

export async function optionalAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, JWT_CONFIG.secret) as JwtPayload;
      (request as any).user = decoded;
    }
  } catch {
    // token 无效时静默忽略，不阻断请求
  }
}
