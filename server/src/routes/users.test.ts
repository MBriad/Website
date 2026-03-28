import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRoutes } from './users.js';
import { User } from '../models/User.js';
import { JWT_CONFIG } from '../config/jwt.js';

describe('User routes', () => {
  let app: FastifyInstance;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = Fastify({ logger: false });
    await app.register(userRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  // ---- POST /api/register ----

  it('register: creates user and returns token', async () => {
    // 先创建一个管理员用户，这样新注册的用户就是普通用户
    const adminHash = await bcrypt.hash('adminpass', 10);
    await User.create({ username: 'existingadmin', email: 'admin@test.com', password: adminHash, role: 'admin' });
    
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: { username: 'testuser', email: 'test@test.com', password: '123456' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty('token');
    expect(body.user.username).toBe('testuser');
    expect(body.user.role).toBe('user');
  });

  it('register: rejects missing fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: { username: 'test' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('请填写所有必填项');
  });

  it('register: rejects short password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: { username: 'testuser', email: 'test@test.com', password: '123' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('密码至少 6 位');
  });

  it('register: rejects duplicate username', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: { username: 'dup', email: 'a@a.com', password: '123456' },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: { username: 'dup', email: 'b@b.com', password: '123456' },
    });
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('用户名已存在');
  });

  it('register: first user becomes admin', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: { username: 'firstuser', email: 'first@test.com', password: '123456' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.user.role).toBe('admin');
    
    // 验证数据库中用户确实是管理员
    const user = await User.findOne({ username: 'firstuser' });
    expect(user?.role).toBe('admin');
  });

  it('register: second user becomes regular user', async () => {
    // 第一个用户成为管理员
    await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: { username: 'adminuser', email: 'admin@test.com', password: '123456' },
    });
    
    // 第二个用户
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: { username: 'regularuser', email: 'regular@test.com', password: '123456' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.user.role).toBe('user');
    
    // 验证数据库中用户角色
    const user = await User.findOne({ username: 'regularuser' });
    expect(user?.role).toBe('user');
  });

  // ---- POST /api/user-login ----

  it('login: returns token on valid credentials', async () => {
    const hashed = await bcrypt.hash('pass123', 10);
    await User.create({ username: 'loginuser', email: 'l@l.com', password: hashed });

    const res = await app.inject({
      method: 'POST',
      url: '/api/user-login',
      payload: { username: 'loginuser', password: 'pass123' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('token');
    expect(body.user.username).toBe('loginuser');
  });

  it('login: rejects wrong password', async () => {
    const hashed = await bcrypt.hash('pass123', 10);
    await User.create({ username: 'loginuser2', email: 'l2@l.com', password: hashed });

    const res = await app.inject({
      method: 'POST',
      url: '/api/user-login',
      payload: { username: 'loginuser2', password: 'wrong' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('login: rejects non-existent user', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/user-login',
      payload: { username: 'nobody', password: 'pass' },
    });
    expect(res.statusCode).toBe(401);
  });

  // ---- GET /api/profile ----

  it('profile: returns user info with valid token', async () => {
    const user = await User.create({
      username: 'profileuser', email: 'p@p.com', password: await bcrypt.hash('123456', 10),
    });
    const token = jwt.sign({ userId: user._id, username: 'profileuser', role: 'user' }, JWT_CONFIG.secret);

    const res = await app.inject({
      method: 'GET',
      url: '/api/profile',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().username).toBe('profileuser');
  });

  it('profile: rejects without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/profile' });
    expect(res.statusCode).toBe(401);
  });
});
