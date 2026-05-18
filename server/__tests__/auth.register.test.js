const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../testdb/db');
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));
jest.mock('express-rate-limit', () => () => (_req, _res, next) => next());
jest.mock('../routes/matches', () => require('express').Router());

const pool = require('../testdb/db');
const app = require('../app');

const SECRET = 'test-secret';

beforeEach(() => {
  process.env.JWT_SECRET = SECRET;
  jest.clearAllMocks();
});

describe('POST /api/v1/auth/register', () => {
  test('400 se username mancante', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'SecurePass1!' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('400 se email non valida', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'chriss99', email: 'non-una-email', password: 'SecurePass1!' });

    expect(res.status).toBe(400);
  });

  test('400 se password < 8 char', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'chriss99', email: 'test@example.com', password: 'short' });

    expect(res.status).toBe(400);
  });

  test('409 se email o username già in uso', async () => {
    pool.execute = jest.fn().mockResolvedValue([[{ id: 1 }]]);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'chriss99', email: 'test@example.com', password: 'SecurePass1!' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/già in uso/);
  });

  test('201 registrazione ok — accessToken valido, refreshToken presente, user senza password_hash', async () => {
    pool.execute = jest.fn()
      .mockResolvedValueOnce([[]])                    // SELECT duplicati
      .mockResolvedValueOnce([{ insertId: 42 }])      // INSERT user
      .mockResolvedValueOnce([{ affectedRows: 1 }]);  // INSERT refresh_token

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'chriss99', email: 'test@example.com', password: 'SecurePass1!' });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.id).toBe(42);
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.level).toBe(0);
    expect(res.body.user.password_hash).toBeUndefined();

    const payload = jwt.verify(res.body.accessToken, SECRET);
    expect(payload.userId).toBe(42);
    expect(payload.role).toBe('user');
  });
});
