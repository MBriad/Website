import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { musicRoutes } from './music.js';
import { Music } from '../models/Music.js';
import { User } from '../models/User.js';
import { JWT_CONFIG } from '../config/jwt.js';

describe('Music CRUD', () => {
  let app: FastifyInstance;
  let mongoServer: MongoMemoryServer;
  let adminToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    app = Fastify({ logger: false });
    await app.register(musicRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Music.deleteMany({});
    await User.deleteMany({});

    const hashed = await bcrypt.hash('123456', 10);
    const admin = await User.create({ username: 'admin', email: 'a@a.com', password: hashed, role: 'admin' });
    adminToken = jwt.sign({ userId: admin._id, username: 'admin', role: 'admin' }, JWT_CONFIG.secret);
  });

  it('GET /api/music returns empty list', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/music' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(0);
  });

  it('GET /api/music returns tracks sorted by order', async () => {
    await Music.create([
      { title: 'B', artist: 'X', src: '/uploads/b.flac', order: 2 },
      { title: 'A', artist: 'X', src: '/uploads/a.flac', order: 1 },
    ]);
    const res = await app.inject({ method: 'GET', url: '/api/music' });
    const body = res.json();
    expect(body).toHaveLength(2);
    expect(body[0].title).toBe('A');
  });

  it('POST /api/music without token returns 401', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/music',
      payload: { title: 'X', artist: 'Y', src: '/uploads/x.flac' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/music creates track', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/music',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { title: 'Test', artist: 'Tester', src: '/uploads/test.flac', cover: '/uploads/cover.webp' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().title).toBe('Test');
    expect(res.json().src).toBe('/uploads/test.flac');
  });

  it('POST /api/music rejects missing fields', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/music',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { title: 'X' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('PUT /api/music/:id updates track', async () => {
    const music = await Music.create({ title: 'Old', artist: 'X', src: '/uploads/old.flac' });
    const res = await app.inject({
      method: 'PUT', url: `/api/music/${music._id}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { title: 'Updated' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().title).toBe('Updated');
  });

  it('PUT /api/music/:id returns 404 for invalid id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await app.inject({
      method: 'PUT', url: `/api/music/${fakeId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { title: 'X' },
    });
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/music/:id deletes track', async () => {
    const music = await Music.create({ title: 'Del', artist: 'X', src: '/uploads/del.flac' });
    const res = await app.inject({
      method: 'DELETE', url: `/api/music/${music._id}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().message).toBe('已删除');
  });

  it('DELETE /api/music/:id returns 404 for invalid id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await app.inject({
      method: 'DELETE', url: `/api/music/${fakeId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).toBe(404);
  });
});
