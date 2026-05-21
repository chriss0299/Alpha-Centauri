jest.mock('express-rate-limit', () => jest.fn((config) => config));

beforeEach(() => {
  jest.resetModules();
});

describe('rateLimiter', () => {
  let rateLimiter;

  beforeEach(() => {
    rateLimiter = require('../middleware/rateLimiter');
  });

  describe('write', () => {
    test('windowMs: 1 minuto', () => {
      expect(rateLimiter.write.windowMs).toBe(60 * 1000);
    });

    test('max: 30 richieste', () => {
      expect(rateLimiter.write.max).toBe(30);
    });

    test('standardHeaders attivi, legacyHeaders disattivati', () => {
      expect(rateLimiter.write.standardHeaders).toBe(true);
      expect(rateLimiter.write.legacyHeaders).toBe(false);
    });

    test('message di errore corretto', () => {
      expect(rateLimiter.write.message).toEqual({ error: 'Troppe richieste, riprova tra poco' });
    });
  });

  describe('auth', () => {
    test('windowMs: 15 minuti', () => {
      expect(rateLimiter.auth.windowMs).toBe(15 * 60 * 1000);
    });

    test('max: 10 richieste', () => {
      expect(rateLimiter.auth.max).toBe(10);
    });

    test('standardHeaders attivi, legacyHeaders disattivati', () => {
      expect(rateLimiter.auth.standardHeaders).toBe(true);
      expect(rateLimiter.auth.legacyHeaders).toBe(false);
    });

    test('message di errore corretto', () => {
      expect(rateLimiter.auth.message).toEqual({ error: 'Troppe richieste, riprova tra poco' });
    });

    test('limite auth più restrittivo del limite write (req/ms)', () => {
      const authRate = rateLimiter.auth.max / rateLimiter.auth.windowMs;
      const writeRate = rateLimiter.write.max / rateLimiter.write.windowMs;
      expect(authRate).toBeLessThan(writeRate);
    });
  });
});
