import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRoutes } from '../routes/auth.js';
import { User } from '../models/User.js';
import { JWT_CONFIG } from '../config/jwt.js';

describe('POST /api/login', () => {
  let app: FastifyInstance;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = Fastify({ logger: false });
    await app.register(authRoutes);
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

  // 创建管理员用户辅助函数
  const createAdminUser = async (username = 'testadmin', password = 'testpass') => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new User({ 
      username, 
      email: `${username}@test.com`, 
      password: hashedPassword, 
      role: 'admin' 
    });
    await adminUser.save();
    return adminUser;
  };

  it('should return token on valid credentials for admin user', async () => {
    await createAdminUser();
    
    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: 'testadmin', password: 'testpass' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');

    const decoded = jwt.verify(body.token, JWT_CONFIG.secret) as { 
      userId: string; 
      username: string; 
      role: string 
    };
    expect(decoded.username).toBe('testadmin');
    expect(decoded.role).toBe('admin');
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
    await createAdminUser();
    
    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: 'wronguser', password: 'testpass' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('用户名或密码错误');
  });

  it('should return 401 on wrong password', async () => {
    await createAdminUser();
    
    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: 'testadmin', password: 'wrongpass' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('用户名或密码错误');
  });

  it('should return 401 for non-admin user', async () => {
    // 创建普通用户（非管理员）
    const hashedPassword = await bcrypt.hash('testpass', 10);
    const regularUser = new User({ 
      username: 'regularuser', 
      email: 'regular@test.com', 
      password: hashedPassword, 
      role: 'user' 
    });
    await regularUser.save();
    
    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: 'regularuser', password: 'testpass' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('用户名或密码错误');
  });
});
