import request from 'supertest';
import app from '../app';
import likeArticleService from '../services/likeArticleService';
import path from 'path';
const seedPath = path.resolve(__dirname, '../../prisma/seed');
const { seedDatabase } = require(seedPath);
const mockPath = path.resolve(__dirname, '../../prisma/mock');
const { mockArticles, mockUsers, mockComments } = require(mockPath);

import TestAgent from 'supertest/lib/agent';

beforeEach(async () => {
  await seedDatabase();
});

describe('ArticleController Guest', () => {
  describe('GET /articles', () => {
    it('should return a list of articles with total count', async () => {
      const response = await request(app)
        .get('/articles')
        .query({ page: '1', pageSize: '10', orderBy: 'recent', keyword: '' });

      expect(response.status).toBe(200);
      expect(response.body.totalCount).toBe(mockArticles.length);
      expect(response.body.list).toHaveLength(mockArticles.length);
      expect(response.body.list[0]).toHaveProperty('title', mockArticles[0].title);
    });

    it('should filter articles by keyword', async () => {
      const filteredArticles = mockArticles.filter((article: { title: string }) =>
        article.title.toLowerCase().includes('first'),
      );
      const response = await request(app)
        .get('/articles')
        .query({ page: '1', pageSize: '10', orderBy: 'recent', keyword: 'First' });

      expect(response.status).toBe(200);
      expect(response.body.totalCount).toBe(filteredArticles.length);
      expect(response.body.list).toHaveLength(filteredArticles.length);
      expect(response.body.list[0].title).toContain('First');
    });
  });

  describe('GET /articles/:id', () => {
    it('should return article without like info if user is not logged in', async () => {
      const articleId = mockArticles[0].id;
      const response = await request(app).get(`/articles/${articleId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', articleId);
      expect(response.body).toHaveProperty('title', mockArticles[0].title);
      expect(response.body).not.toHaveProperty('isLiked');
    });

    it('should return 404 if article not found', async () => {
      const response = await request(app).get(`/articles/999`);

      expect(response.status).toBe(404);
    });
  });
});

describe('ArticleController Logined', () => {
  let agent: {
    post: (url: string) => request.Test;
    get: (url: string) => request.Test;
    delete: (url: string) => request.Test;
    patch: (url: string) => request.Test;
  };
  function authAgent(agent: TestAgent, token: string) {
    return {
      post: (url: string) => agent.post(url).set('Authorization', `Bearer ${token}`),
      get: (url: string) => agent.get(url).set('Authorization', `Bearer ${token}`),
      delete: (url: string) => agent.delete(url).set('Authorization', `Bearer ${token}`),
      patch: (url: string) => agent.patch(url).set('Authorization', `Bearer ${token}`),
    };
  }

  beforeAll(async () => {
    const agentWithToken = request.agent(app);
    const loginResponse = await agentWithToken
      .post('/users/login')
      .send({ email: mockUsers[0].email, password: 'hashedpassword1' });
    agent = authAgent(agentWithToken, loginResponse.body.accessToken);
  });

  describe('POST /articles/', () => {
    it('should create article and return 201 with article data', async () => {
      const validBody = {
        title: '테스트 제목',
        content: '테스트 내용',
      };
      const response = await agent.post('/articles').send(validBody);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', validBody.title);
      expect(response.body).toHaveProperty('content', validBody.content);
    });
  });

  describe('GET /articles/:id', () => {
    it('should return article with like info if user is logged in', async () => {
      const articleId = mockArticles[0].id;
      const response = await agent.get(`/articles/${articleId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', articleId);
      expect(response.body).toHaveProperty('title', mockArticles[0].title);
      expect(response.body).toHaveProperty('isLiked', false);
    });

    it('should return 404 if article not found', async () => {
      const response = await request(app).get(`/articles/999`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /articles/:id', () => {
    it('should update article and return 200 with updated article data', async () => {
      const articleId = mockArticles[0].id;
      const validBody = {
        title: '업데이트된 제목',
        content: '업데이트된 내용',
      };
      const response = await agent.patch(`/articles/${articleId}`).send(validBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', validBody.title);
      expect(response.body).toHaveProperty('content', validBody.content);
    });

    it('should return 404 if article not found', async () => {
      const response = await agent.patch(`/articles/999`).send({ title: '새 제목' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /articles/:id', () => {
    it('should delete article and return 204', async () => {
      const articleId = mockArticles[0].id;
      const response = await agent.delete(`/articles/${articleId}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 if article not found', async () => {
      const response = await agent.delete(`/articles/999`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /articles/:id/comments', () => {
    it('should create comment and return 201 with comment data', async () => {
      const articleId = mockArticles[0].id;
      const validBody = { content: '테스트 댓글' };
      const response = await agent.post(`/articles/${articleId}/comments`).send(validBody);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('content', validBody.content);
    });

    it('should return 404 if article not found', async () => {
      const response = await agent.post(`/articles/999/comments`).send({ content: '댓글' });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /articles/:id/comments', () => {
    it('should return comments for article', async () => {
      const articleId = mockArticles[0].id;
      const response = await agent
        .get(`/articles/${articleId}/comments`)
        .query({ limit: '10', orderBy: 'recent' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('list');
      expect(response.body.list).toHaveLength(1);
    });

    it('should filter comments by keyword', async () => {
      const articleId = mockArticles[0].id;
      const filteredComments = mockComments.filter((comment: { content: string }) =>
        comment.content.toLowerCase().includes('nice'),
      );
      const response = await request(app)
        .get(`/articles/${articleId}/comments`)
        .query({ limit: '10', orderBy: 'recent', keyword: 'nice' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('list');
      expect(response.body.list).toHaveLength(1);
    });

    it('should return 404 if article not found', async () => {
      const response = await agent.get(`/articles/999/comments`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /articles/:id/like', () => {
    it('should like article and return 200 with like info', async () => {
      const articleId = mockArticles[0].id;
      const response = await agent.get(`/articles/${articleId}/like`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('userId', mockUsers[0].id);
      expect(response.body).toHaveProperty('articleId', articleId);
    });

    it('should return 422 if article already liked', async () => {
      const articleId = mockArticles[0].id;
      await likeArticleService.create({ userId: mockUsers[0].id, articleId });
      const response = await agent.get(`/articles/${articleId}/like`);

      expect(response.status).toBe(422);
    });

    it('should return 404 if article not found', async () => {
      const response = await agent.get(`/articles/999/like`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /articles/:id/dislike', () => {
    it('should dislike article and return 204 with like info', async () => {
      const articleId = mockArticles[0].id;
      await likeArticleService.create({ userId: mockUsers[0].id, articleId });
      const response = await agent.get(`/articles/${articleId}/dislike`);

      expect(response.status).toBe(204);
    });

    it('should return 404 if article not liked', async () => {
      const articleId = mockArticles[0].id;
      const response = await agent.get(`/articles/${articleId}/dislike`);

      expect(response.status).toBe(404);
    });

    it('should return 404 if article not found', async () => {
      const response = await agent.get(`/articles/999/dislike`);

      expect(response.status).toBe(404);
    });
  });
});
