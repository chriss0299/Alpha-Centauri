const jwt = require('jsonwebtoken');
const { requireAuth, requireRole } = require('../middleware/auth');

const SECRET = 'test-secret';

beforeEach(() => {
  process.env.JWT_SECRET = SECRET;
});

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function validToken(payload = { userId: 1, role: 'tifoso' }) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

describe('requireAuth', () => {
  test('401 se header assente', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('401 se header malformato (no Bearer)', () => {
    const req = { headers: { authorization: 'abc123' } };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('401 se firma non valida', () => {
    const token = jwt.sign({ userId: 1, role: 'tifoso' }, 'wrong-secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('401 se token scaduto', () => {
    const token = jwt.sign({ userId: 1, role: 'tifoso' }, SECRET, { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('chiama next() e popola req.user con token valido', () => {
    const token = validToken({ userId: 42, role: 'admin' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.userId).toBe(42);
    expect(req.user.role).toBe('admin');
  });
});

describe('requireRole', () => {
  test('chiama next() se ruolo autorizzato', () => {
    const token = validToken({ userId: 1, role: 'admin' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    const middlewares = requireRole(['admin', 'editor']);

    middlewares[0](req, res, () => middlewares[1](req, res, next));

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('403 se ruolo non autorizzato', () => {
    const token = validToken({ userId: 1, role: 'tifoso' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    const middlewares = requireRole(['admin', 'editor']);

    middlewares[0](req, res, () => middlewares[1](req, res, next));

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('401 se token assente (requireAuth blocca prima del role check)', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    const middlewares = requireRole(['admin']);

    middlewares[0](req, res, () => middlewares[1](req, res, next));

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
