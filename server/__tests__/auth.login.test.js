const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../testdb/db');
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));
jest.mock('express-rate-limit', () => () => (_req, _res, next) => next());
jest.mock('../routes/matches', () => require('express').Router());

const bcrypt = require('bcryptjs');
const pool = require('../testdb/db');
const app = require('../app');

const SECRET = 'test-secret';

beforeEach(() => {
  process.env.JWT_SECRET = SECRET;
  jest.clearAllMocks();
});

describe('POST /api/v1/auth/login', () => {
  test('400 se email non valida', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'non-una-email', password: 'SecurePass1!' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('400 se password mancante', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('401 se email non esiste', async () => {
    pool.execute = jest.fn().mockResolvedValue([[]]);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonesiste@example.com', password: 'SecurePass1!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenziali non valide');
  });

  test('401 se password errata', async () => {
    pool.execute = jest.fn().mockResolvedValue([[
      { id: 1, username: 'chriss99', email: 'user@example.com', password_hash: 'hashed', role: 'user', level: 0 },
    ]]);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'WrongPass1!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenziali non valide');
  });

  test('401 — stesso messaggio per email inesistente e password errata (no user enumeration)', async () => {
    pool.execute = jest.fn().mockResolvedValue([[]]);
    const resEmail = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ghost@example.com', password: 'SecurePass1!' });

    pool.execute = jest.fn().mockResolvedValue([[
      { id: 1, username: 'chriss99', email: 'user@example.com', password_hash: 'hashed', role: 'user', level: 0 },
    ]]);
    bcrypt.compare.mockResolvedValue(false);
    const resPassword = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'WrongPass1!' });

    expect(resEmail.body.error).toBe(resPassword.body.error);
  });

  test('200 login ok — token valido e user senza password_hash', async () => {
    pool.execute = jest.fn().mockResolvedValue([[
      { id: 42, username: 'chriss99', email: 'user@example.com', password_hash: 'hashed', role: 'user', level: 0 },
    ]]);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'SecurePass1!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.id).toBe(42);
    expect(res.body.user.username).toBe('chriss99');
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.level).toBe(0);
    expect(res.body.user.password_hash).toBeUndefined();

    const payload = jwt.verify(res.body.token, SECRET);
    expect(payload.userId).toBe(42);
    expect(payload.role).toBe('user');
  });
});
