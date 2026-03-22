import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';

// 测试 auth 保护：不依赖 MongoDB，只验证中间件行为
describe('CRUD auth protection', () => {
  let app: FastifyInstance;
  let validToken: string;

  beforeAll(async () => {
    validToken = jwt.sign({ username: 'testadmin' }, JWT_CONFIG.secret, {
      expiresIn: '1h',
    } as any);

    app = Fastify({ logger: false });

    // 注册一个受保护的测试路由，模拟 CRUD 行为
    app.post('/api/articles', {
      onRequest: [
        async (request, reply) => {
          const token = request.headers.authorization?.replace('Bearer ', '');
          if (!token) {
            return reply.status(401).send({ error: '未提供认证令牌' });
          }
          try {
            jwt.verify(token, JWT_CONFIG.secret);
          } catch {
            return reply.status(401).send({ error: '认证令牌无效' });
          }
        },
      ],
    }, async () => ({ message: 'created' }));

    app.put('/api/articles/:id', {
      onRequest: [
        async (request, reply) => {
          const token = request.headers.authorization?.replace('Bearer ', '');
          if (!token) {
            return reply.status(401).send({ error: '未提供认证令牌' });
          }
          try {
            jwt.verify(token, JWT_CONFIG.secret);
          } catch {
            return reply.status(401).send({ error: '认证令牌无效' });
          }
        },
      ],
    }, async () => ({ message: 'updated' }));

    app.delete('/api/articles/:id', {
      onRequest: [
        async (request, reply) => {
          const token = request.headers.authorization?.replace('Bearer ', '');
          if (!token) {
            return reply.status(401).send({ error: '未提供认证令牌' });
          }
          try {
            jwt.verify(token, JWT_CONFIG.secret);
          } catch {
            return reply.status(401).send({ error: '认证令牌无效' });
          }
        },
      ],
    }, async () => ({ message: 'deleted' }));

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // POST 不带 token → 401
  it('POST /api/articles without token returns 401', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/articles',
      payload: { title: 'test' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('未提供认证令牌');
  });

  // PUT 不带 token → 401
  it('PUT /api/articles/:id without token returns 401', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/articles/123',
      payload: { title: 'updated' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('未提供认证令牌');
  });

  // DELETE 不带 token → 401
  it('DELETE /api/articles/:id without token returns 401', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/articles/123',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('未提供认证令牌');
  });

  // POST 带无效 token → 401
  it('POST /api/articles with invalid token returns 401', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/articles',
      headers: { authorization: 'Bearer invalid-token' },
      payload: { title: 'test' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('认证令牌无效');
  });

  // POST 带有效 token → 200
  it('POST /api/articles with valid token passes auth', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/articles',
      headers: { authorization: `Bearer ${validToken}` },
      payload: { title: 'test' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().message).toBe('created');
  });

  // PUT 带有效 token → 200
  it('PUT /api/articles/:id with valid token passes auth', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/articles/123',
      headers: { authorization: `Bearer ${validToken}` },
      payload: { title: 'updated' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().message).toBe('updated');
  });

  // DELETE 带有效 token → 200
  it('DELETE /api/articles/:id with valid token passes auth', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/articles/123',
      headers: { authorization: `Bearer ${validToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().message).toBe('deleted');
  });
});
