import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { wallpaperRoutes } from './wallpapers.js';
import { Wallpaper } from '../models/Wallpaper.js';
import { User } from '../models/User.js';
import { JWT_CONFIG } from '../config/jwt.js';

describe('Wallpaper CRUD', () => {
  let app: FastifyInstance;
  let mongoServer: MongoMemoryServer;
  let adminToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = Fastify({ logger: false });
    await app.register(wallpaperRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Wallpaper.deleteMany({});
    await User.deleteMany({});
    const hashed = await bcrypt.hash('123456', 10);
    const admin = await User.create({ username: 'admin', email: 'a@a.com', password: hashed, role: 'admin' });
    adminToken = jwt.sign({ userId: admin._id, username: 'admin', role: 'admin' }, JWT_CONFIG.secret);
  });

  it('GET /api/wallpapers returns active wallpapers only', async () => {
    await Wallpaper.create([
      { src: '/uploads/a.webp', active: true, order: 1 },
      { src: '/uploads/b.webp', active: false, order: 2 },
    ]);
    const res = await app.inject({ method: 'GET', url: '/api/wallpapers' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(1);
  });

  it('POST /api/wallpapers without token returns 401', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/wallpapers', payload: { src: '/x.webp' } });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/wallpapers creates wallpaper', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/wallpapers',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { src: '/uploads/test.webp', theme: 'light', order: 0 },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().src).toBe('/uploads/test.webp');
  });

  it('POST rejects missing src', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/wallpapers',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { theme: 'light' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('PUT updates wallpaper', async () => {
    const w = await Wallpaper.create({ src: '/old.webp', active: true });
    const res = await app.inject({
      method: 'PUT', url: `/api/wallpapers/${w._id}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { active: false },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().active).toBe(false);
  });

  it('DELETE removes wallpaper', async () => {
    const w = await Wallpaper.create({ src: '/del.webp' });
    const res = await app.inject({
      method: 'DELETE', url: `/api/wallpapers/${w._id}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('PUT returns 404 for invalid id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await app.inject({
      method: 'PUT', url: `/api/wallpapers/${fakeId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { active: false },
    });
    expect(res.statusCode).toBe(404);
  });
});
