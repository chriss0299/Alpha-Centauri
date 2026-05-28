function createInMemoryClient() {
  const zsets = new Map();

  return {
    isReady: true,
    multi() {
      const ops = [];
      const m = {
        zRemRangeByScore(key, min, max) {
          ops.push(() => {
            const arr = zsets.get(key) || [];
            const filtered = arr.filter(({ score }) => score < min || score > max);
            zsets.set(key, filtered);
            return arr.length - filtered.length;
          });
          return m;
        },
        zCard(key) {
          ops.push(() => (zsets.get(key) || []).length);
          return m;
        },
        zAdd(key, { score, value }) {
          ops.push(() => {
            const arr = zsets.get(key) || [];
            arr.push({ score, value });
            arr.sort((a, b) => a.score - b.score);
            zsets.set(key, arr);
            return 1;
          });
          return m;
        },
        pExpire() {
          ops.push(() => 1);
          return m;
        },
        async exec() {
          return ops.map((fn) => fn());
        },
      };
      return m;
    },
    async zRangeWithScores(key) {
      const arr = zsets.get(key) || [];
      return arr.length > 0 ? [arr[0]] : [];
    },
    _zsets: zsets,
  };
}

const mockClient = createInMemoryClient();
jest.mock('../redis', () => ({ client: mockClient }));

const { createSlidingWindowLimiter } = require('../middleware/rateLimitRedis');

function buildReqRes(ip = '1.2.3.4') {
  const headers = {};
  const req = { ip };
  const res = {
    statusCode: 200,
    body: null,
    setHeader(k, v) { headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    headers,
  };
  return { req, res };
}

describe('createSlidingWindowLimiter', () => {
  beforeEach(() => {
    mockClient._zsets.clear();
    mockClient.isReady = true;
  });

  test('throw se mancano opzioni obbligatorie', () => {
    expect(() => createSlidingWindowLimiter({})).toThrow();
    expect(() => createSlidingWindowLimiter({ keyPrefix: 'x' })).toThrow();
    expect(() => createSlidingWindowLimiter({ keyPrefix: 'x', windowMs: 1000 })).toThrow();
  });

  test('30 richieste passano, la 31a viene bloccata con 429', async () => {
    const limiter = createSlidingWindowLimiter({ keyPrefix: 'write', windowMs: 60_000, max: 30 });
    const next = jest.fn();

    for (let i = 0; i < 30; i += 1) {
      const { req, res } = buildReqRes();
      await limiter(req, res, next);
      expect(res.statusCode).toBe(200);
    }
    expect(next).toHaveBeenCalledTimes(30);

    const { req, res } = buildReqRes();
    await limiter(req, res, next);
    expect(res.statusCode).toBe(429);
    expect(res.body).toEqual({ error: 'Troppe richieste, riprova tra poco' });
    expect(next).toHaveBeenCalledTimes(30);
  });

  test('quota si ripristina quando i timestamp escono dalla finestra', async () => {
    const limiter = createSlidingWindowLimiter({ keyPrefix: 'write', windowMs: 1000, max: 2 });
    const next = jest.fn();

    const realNow = Date.now;
    let fakeNow = 1_000_000;
    Date.now = () => fakeNow;

    try {
      let { req, res } = buildReqRes();
      await limiter(req, res, next);
      await limiter(req, res, next);
      const blocked = buildReqRes();
      await limiter(blocked.req, blocked.res, next);
      expect(blocked.res.statusCode).toBe(429);

      fakeNow += 1500;

      const after = buildReqRes();
      await limiter(after.req, after.res, next);
      expect(after.res.statusCode).toBe(200);
    } finally {
      Date.now = realNow;
    }
  });

  test('header RateLimit-* presenti su richiesta consentita', async () => {
    const limiter = createSlidingWindowLimiter({ keyPrefix: 'write', windowMs: 60_000, max: 30 });
    const next = jest.fn();
    const { req, res } = buildReqRes();
    await limiter(req, res, next);
    expect(res.headers['RateLimit-Limit']).toBe(30);
    expect(res.headers['RateLimit-Remaining']).toBe(29);
    expect(res.headers['RateLimit-Reset']).toBeDefined();
  });

  test('header RateLimit-Remaining=0 e Reset > 0 su 429', async () => {
    const limiter = createSlidingWindowLimiter({ keyPrefix: 'write', windowMs: 60_000, max: 1 });
    const next = jest.fn();

    await limiter(...Object.values(buildReqRes()), next);
    const { req, res } = buildReqRes();
    await limiter(req, res, next);
    expect(res.statusCode).toBe(429);
    expect(res.headers['RateLimit-Remaining']).toBe(0);
    expect(res.headers['RateLimit-Reset']).toBeGreaterThan(0);
  });

  test('fail-open se Redis non ready', async () => {
    mockClient.isReady = false;
    const limiter = createSlidingWindowLimiter({ keyPrefix: 'write', windowMs: 60_000, max: 1 });
    const next = jest.fn();
    const { req, res } = buildReqRes();
    await limiter(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  test('identità separa contatori per IP diversi', async () => {
    const limiter = createSlidingWindowLimiter({ keyPrefix: 'write', windowMs: 60_000, max: 1 });
    const next = jest.fn();

    const a = buildReqRes('1.1.1.1');
    await limiter(a.req, a.res, next);
    const b = buildReqRes('2.2.2.2');
    await limiter(b.req, b.res, next);
    expect(a.res.statusCode).toBe(200);
    expect(b.res.statusCode).toBe(200);

    const a2 = buildReqRes('1.1.1.1');
    await limiter(a2.req, a2.res, next);
    expect(a2.res.statusCode).toBe(429);
  });

  test('userId ha precedenza su IP nella default identity', async () => {
    const limiter = createSlidingWindowLimiter({ keyPrefix: 'write', windowMs: 60_000, max: 1 });
    const next = jest.fn();

    const req1 = { ip: '9.9.9.9', user: { id: 'user-42' } };
    const res1 = { statusCode: 200, setHeader() {}, status(c) { this.statusCode = c; return this; }, json() { return this; } };
    await limiter(req1, res1, next);

    const req2 = { ip: '8.8.8.8', user: { id: 'user-42' } };
    const res2 = { statusCode: 200, setHeader() {}, status(c) { this.statusCode = c; return this; }, json() { return this; } };
    await limiter(req2, res2, next);
    expect(res2.statusCode).toBe(429);
  });

  test('proprietà retrocompatibili esposte sul middleware', () => {
    const limiter = createSlidingWindowLimiter({ keyPrefix: 'write', windowMs: 60_000, max: 30 });
    expect(limiter.windowMs).toBe(60_000);
    expect(limiter.max).toBe(30);
    expect(limiter.standardHeaders).toBe(true);
    expect(limiter.legacyHeaders).toBe(false);
    expect(limiter.message).toEqual({ error: 'Troppe richieste, riprova tra poco' });
  });
});
