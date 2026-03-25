import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { commentRoutes } from './comments.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { Article } from '../models/Article.js';
import { JWT_CONFIG } from '../config/jwt.js';

describe('Comment routes', () => {
  let app: FastifyInstance;
  let mongoServer: MongoMemoryServer;
  let userToken: string;
  let adminToken: string;
  let articleId: string;
  let userId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    app = Fastify({ logger: false });
    await app.register(commentRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Comment.deleteMany({});
    await User.deleteMany({});
    await Article.deleteMany({});

    const hashed = await bcrypt.hash('123456', 10);
    const user = await User.create({ username: 'commenter', email: 'c@c.com', password: hashed });
    const admin = await User.create({ username: 'admin', email: 'a@a.com', password: hashed, role: 'admin' });
    const article = await Article.create({ title: 'Test', slug: 'test', content: 'c', excerpt: 'e', category: 'tech', published: true });

    userId = user._id.toString();
    articleId = article._id.toString();

    userToken = jwt.sign({ userId: user._id, username: 'commenter', role: 'user' }, JWT_CONFIG.secret);
    adminToken = jwt.sign({ userId: admin._id, username: 'admin', role: 'admin' }, JWT_CONFIG.secret);
  });

  // ---- POST /api/comments ----

  it('POST: creates comment with valid token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/comments',
      headers: { authorization: `Bearer ${userToken}` },
      payload: { articleId, content: 'Nice article!' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.content).toBe('Nice article!');
    expect(body.user.username).toBe('commenter');
  });

  it('POST: rejects without token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/comments',
      payload: { articleId, content: 'test' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST: rejects missing fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/comments',
      headers: { authorization: `Bearer ${userToken}` },
      payload: { articleId },
    });
    expect(res.statusCode).toBe(400);
  });

  // ---- GET /api/comments/:articleId ----

  it('GET: returns comments for article', async () => {
    await Comment.create({ articleId, userId, content: 'First comment' });

    const res = await app.inject({
      method: 'GET',
      url: `/api/comments/${articleId}`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveLength(1);
    expect(body[0].content).toBe('First comment');
    expect(body[0].user.username).toBe('commenter');
  });

  it('GET: returns empty array for no comments', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/comments/${articleId}`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(0);
  });

  // ---- DELETE /api/comments/:id ----

  it('DELETE: owner can delete own comment', async () => {
    const comment = await Comment.create({ articleId, userId, content: 'Delete me' });

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/comments/${comment._id}`,
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().message).toBe('评论已删除');
  });

  it('DELETE: non-owner cannot delete others comment', async () => {
    const hashed = await bcrypt.hash('123456', 10);
    const other = await User.create({ username: 'other', email: 'o@o.com', password: hashed });
    const comment = await Comment.create({ articleId, userId: other._id, content: 'Not yours' });

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/comments/${comment._id}`,
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('DELETE: admin can delete any comment', async () => {
    const comment = await Comment.create({ articleId, userId, content: 'Admin deletes me' });

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/comments/${comment._id}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('DELETE: returns 404 for non-existent comment', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/comments/${fakeId}`,
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect(res.statusCode).toBe(404);
  });
});
