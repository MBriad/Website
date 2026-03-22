import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRoutes } from '../routes/auth.js';
import { JWT_CONFIG } from '../config/jwt.js';

describe('POST /api/login', () => {
  let app: FastifyInstance;
  const testHash = bcrypt.hashSync('testpass', 10);

  beforeAll(async () => {
    process.env.ADMIN_USERNAME = 'testadmin';
    process.env.ADMIN_PASSWORD_HASH = testHash;
    process.env.JWT_SECRET = 'test-secret';

    app = Fastify({ logger: false });
    await app.register(authRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.JWT_SECRET;
  });

  it('should return token on valid credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: 'testadmin', password: 'testpass' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');

    const decoded = jwt.verify(body.token, JWT_CONFIG.secret) as { username: string };
    expect(decoded.username).toBe('testadmin');
  });

  it('should return 400 when username is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { password: 'testpass' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('请输入用户名和密码');
  });

  it('should return 400 when password is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: 'testadmin' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('请输入用户名和密码');
  });

  it('should return 401 on wrong username', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: 'wronguser', password: 'testpass' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('用户名或密码错误');
  });

  it('should return 401 on wrong password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: 'testadmin', password: 'wrongpass' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('用户名或密码错误');
  });

  it('should return 500 when env vars are not configured', async () => {
    const savedUsername = process.env.ADMIN_USERNAME;
    const savedHash = process.env.ADMIN_PASSWORD_HASH;
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD_HASH;

    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: 'testadmin', password: 'testpass' },
    });

    expect(res.statusCode).toBe(500);
    expect(res.json().error).toBe('服务器配置错误');

    process.env.ADMIN_USERNAME = savedUsername;
    process.env.ADMIN_PASSWORD_HASH = savedHash;
  });
});
