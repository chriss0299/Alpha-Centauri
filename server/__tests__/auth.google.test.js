const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../testdb/db');
jest.mock('express-rate-limit', () => () => (_req, _res, next) => next());
jest.mock('../routes/matches', () => require('express').Router());

let mockVerifyIdToken;
jest.mock('google-auth-library', () => {
  mockVerifyIdToken = jest.fn();
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
  };
});

const pool = require('../testdb/db');
const app = require('../app');

const SECRET = 'test-secret';

const googlePayload = {
  sub: 'google-uid-123',
  email: 'mario@gmail.com',
  name: 'Mario Rossi',
};

function makeTicket(payload) {
  return { getPayload: () => payload };
}

beforeEach(() => {
  process.env.JWT_SECRET = SECRET;
  process.env.GOOGLE_CLIENT_ID = 'test-client-id';
  jest.clearAllMocks();
});

describe('POST /api/v1/auth/google', () => {
  test('400 se idToken mancante', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('401 se token Google non valido', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'token-invalido' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token Google non valido');
  });

  test('200 — utente esistente trovato per google_id', async () => {
    mockVerifyIdToken.mockResolvedValue(makeTicket(googlePayload));

    pool.execute = jest.fn()
      .mockResolvedValueOnce([[{ id: 5, username: 'mario_r1234', email: 'mario@gmail.com', role: 'user', level: 0, google_id: 'google-uid-123' }]]) // SELECT
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT refresh_token

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'valid-token' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.isNewUser).toBe(false);
    expect(res.body.user.id).toBe(5);
    expect(res.body.user.password_hash).toBeUndefined();

    const payload = jwt.verify(res.body.accessToken, SECRET);
    expect(payload.userId).toBe(5);
    expect(payload.role).toBe('user');
  });

  test('200 — utente esistente per email, google_id aggiornato', async () => {
    mockVerifyIdToken.mockResolvedValue(makeTicket(googlePayload));

    pool.execute = jest.fn()
      .mockResolvedValueOnce([[{ id: 5, username: 'mario_r1234', email: 'mario@gmail.com', role: 'user', level: 0, google_id: null }]]) // SELECT
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE google_id
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT refresh_token

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'valid-token' });

    expect(res.status).toBe(200);
    expect(res.body.isNewUser).toBe(false);
    expect(pool.execute).toHaveBeenCalledWith(
      'UPDATE users SET google_id = ? WHERE id = ?',
      ['google-uid-123', 5]
    );
  });

  test('200 — nuovo utente creato, isNewUser true', async () => {
    mockVerifyIdToken.mockResolvedValue(makeTicket(googlePayload));

    pool.execute = jest.fn()
      .mockResolvedValueOnce([[]])                     // SELECT — nessun utente trovato
      .mockResolvedValueOnce([{ insertId: 99 }])       // INSERT nuovo utente
      .mockResolvedValueOnce([{ affectedRows: 1 }]);   // INSERT refresh_token

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'valid-token' });

    expect(res.status).toBe(200);
    expect(res.body.isNewUser).toBe(true);
    expect(res.body.user.id).toBe(99);
    expect(res.body.user.email).toBe('mario@gmail.com');
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.level).toBe(0);
    expect(res.body.user.password_hash).toBeUndefined();
  });
});
