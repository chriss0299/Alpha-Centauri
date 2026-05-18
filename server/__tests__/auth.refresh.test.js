const request = require('supertest');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

jest.mock('../testdb/db');
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));
jest.mock('express-rate-limit', () => () => (_req, _res, next) => next());
jest.mock('../routes/matches', () => require('express').Router());

const pool = require('../testdb/db');
const app = require('../app');

const SECRET = 'test-secret';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const validRefreshToken = 'a'.repeat(64);
const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const pastDate = new Date(Date.now() - 1000);

beforeEach(() => {
  process.env.JWT_SECRET = SECRET;
  jest.clearAllMocks();
});

describe('POST /api/v1/auth/refresh', () => {
  test('400 se refreshToken mancante', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('401 se refreshToken non trovato in DB', async () => {
    pool.execute = jest.fn().mockResolvedValue([[]]);

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: validRefreshToken });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Refresh token non valido');
  });

  test('401 se refreshToken scaduto', async () => {
    pool.execute = jest.fn()
      .mockResolvedValueOnce([[{ id: 1, user_id: 7, expires_at: pastDate }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE scaduto

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: validRefreshToken });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Refresh token scaduto');
  });

  test('200 refresh ok — nuovi accessToken e refreshToken, rotazione applicata', async () => {
    pool.execute = jest.fn()
      .mockResolvedValueOnce([[{ id: 1, user_id: 7, expires_at: futureDate }]]) // SELECT refresh_token
      .mockResolvedValueOnce([{ affectedRows: 1 }])                             // DELETE vecchio
      .mockResolvedValueOnce([[{ id: 7, role: 'user' }]])                       // SELECT user
      .mockResolvedValueOnce([{ affectedRows: 1 }]);                            // INSERT nuovo refresh_token

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: validRefreshToken });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(validRefreshToken);

    const payload = jwt.verify(res.body.accessToken, SECRET);
    expect(payload.userId).toBe(7);
    expect(payload.role).toBe('user');
  });

  test('200 — il nuovo refreshToken è diverso da quello inviato (single-use)', async () => {
    pool.execute = jest.fn()
      .mockResolvedValueOnce([[{ id: 1, user_id: 7, expires_at: futureDate }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: 7, role: 'user' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: validRefreshToken });

    expect(res.body.refreshToken).not.toBe(validRefreshToken);
    expect(res.body.refreshToken).toHaveLength(64);
  });
});
