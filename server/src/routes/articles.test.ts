import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { articleRoutes } from './articles.js';
import { Article } from '../models/Article.js';
import { JWT_CONFIG } from '../config/jwt.js';

describe('Article CRUD', () => {
  let app: FastifyInstance;
  let mongoServer: MongoMemoryServer;
  let validToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    validToken = jwt.sign({ username: 'testadmin' }, JWT_CONFIG.secret, { expiresIn: '1h' } as any);

    app = Fastify({ logger: false });
    await app.register(articleRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Article.deleteMany({});
  });

  // ---- GET /api/articles ----

  it('GET /api/articles returns empty list', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/articles' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toHaveLength(0);
    expect(body.pagination.total).toBe(0);
  });

  it('GET /api/articles returns only published articles', async () => {
    await Article.create([
      { title: 'Pub', slug: 'pub', content: 'c', excerpt: 'e', category: 'tech', published: true },
      { title: 'Draft', slug: 'draft', content: 'c', excerpt: 'e', category: 'tech', published: false },
    ]);

    const res = await app.inject({ method: 'GET', url: '/api/articles' });
    const body = res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toBe('Pub');
  });

  it('GET /api/articles supports tag filter', async () => {
    await Article.create([
      { title: 'A', slug: 'a', content: 'c', excerpt: 'e', category: 'tech', tags: ['React'], published: true },
      { title: 'B', slug: 'b', content: 'c', excerpt: 'e', category: 'tech', tags: ['Vue'], published: true },
    ]);

    const res = await app.inject({ method: 'GET', url: '/api/articles?tag=React' });
    const body = res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toBe('A');
  });

  // ---- GET /api/articles/featured ----

  it('GET /api/articles/featured returns featured articles', async () => {
    await Article.create([
      { title: 'Featured', slug: 'feat', content: 'c', excerpt: 'e', category: 'tech', published: true, featured: true },
      { title: 'Normal', slug: 'norm', content: 'c', excerpt: 'e', category: 'tech', published: true, featured: false },
    ]);

    const res = await app.inject({ method: 'GET', url: '/api/articles/featured' });
    const body = res.json();
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe('Featured');
  });

  // ---- GET /api/articles/:slug ----

  it('GET /api/articles/:slug returns article by slug', async () => {
    await Article.create({ title: 'Test', slug: 'test-slug', content: 'hello', excerpt: 'e', category: 'tech', published: true });

    const res = await app.inject({ method: 'GET', url: '/api/articles/test-slug' });
    expect(res.statusCode).toBe(200);
    expect(res.json().title).toBe('Test');
  });

  it('GET /api/articles/:slug returns 404 for missing slug', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/articles/nope' });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('文章未找到');
  });

  // ---- POST /api/articles ----

  it('POST /api/articles without token returns 401', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/articles',
      payload: { title: 'X', slug: 'x', content: 'c', excerpt: 'e', category: 'tech' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/articles with valid token creates article', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/articles',
      headers: { authorization: `Bearer ${validToken}` },
      payload: { title: 'New', slug: 'new', content: 'hello', excerpt: 'world', category: 'life', published: true },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.title).toBe('New');
    expect(body.slug).toBe('new');
  });

  // ---- PUT /api/articles/:id ----

  it('PUT /api/articles/:id updates article', async () => {
    const article = await Article.create({ title: 'Old', slug: 'old', content: 'c', excerpt: 'e', category: 'tech', published: true });

    const res = await app.inject({
      method: 'PUT',
      url: `/api/articles/${article._id}`,
      headers: { authorization: `Bearer ${validToken}` },
      payload: { title: 'Updated' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().title).toBe('Updated');
  });

  it('PUT /api/articles/:id returns 404 for invalid id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await app.inject({
      method: 'PUT',
      url: `/api/articles/${fakeId}`,
      headers: { authorization: `Bearer ${validToken}` },
      payload: { title: 'X' },
    });
    expect(res.statusCode).toBe(404);
  });

  // ---- DELETE /api/articles/:id ----

  it('DELETE /api/articles/:id deletes article', async () => {
    const article = await Article.create({ title: 'Del', slug: 'del', content: 'c', excerpt: 'e', category: 'tech', published: true });

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/articles/${article._id}`,
      headers: { authorization: `Bearer ${validToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().message).toBe('文章已删除');

    const check = await Article.findById(article._id);
    expect(check).toBeNull();
  });

  it('DELETE /api/articles/:id returns 404 for invalid id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/articles/${fakeId}`,
      headers: { authorization: `Bearer ${validToken}` },
    });
    expect(res.statusCode).toBe(404);
  });
});
