const crypto = require('crypto');
const { client } = require('../redis');

function defaultIdentity(req) {
  return req.user?.id ? `u:${req.user.id}` : `ip:${req.ip}`;
}

function createSlidingWindowLimiter({ keyPrefix, windowMs, max, getIdentity = defaultIdentity }) {
  if (!keyPrefix || !windowMs || !max) {
    throw new Error('rateLimitRedis: keyPrefix, windowMs e max sono obbligatori');
  }

  async function rateLimitMiddleware(req, res, next) {
    if (!client.isReady) {
      console.warn('[rateLimitRedis] Redis non pronto — fail-open su', keyPrefix);
      return next();
    }

    const identity = getIdentity(req);
    const key = `rl:${keyPrefix}:${identity}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    const member = `${now}-${crypto.randomUUID()}`;

    try {
      const multi = client.multi();
      multi.zRemRangeByScore(key, 0, windowStart);
      multi.zCard(key);
      const results = await multi.exec();
      const countBefore = Number(results[1]);

      if (countBefore >= max) {
        const oldest = await client.zRangeWithScores(key, 0, 0);
        const resetMs = oldest.length > 0 ? oldest[0].score + windowMs - now : windowMs;
        res.setHeader('RateLimit-Limit', max);
        res.setHeader('RateLimit-Remaining', 0);
        res.setHeader('RateLimit-Reset', Math.ceil(resetMs / 1000));
        return res.status(429).json({ error: 'Troppe richieste, riprova tra poco' });
      }

      const writeMulti = client.multi();
      writeMulti.zAdd(key, { score: now, value: member });
      writeMulti.pExpire(key, windowMs);
      await writeMulti.exec();

      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', Math.max(0, max - countBefore - 1));
      res.setHeader('RateLimit-Reset', Math.ceil(windowMs / 1000));
      return next();
    } catch (err) {
      console.warn('[rateLimitRedis] errore Redis — fail-open:', err.message);
      return next();
    }
  }

  rateLimitMiddleware.windowMs = windowMs;
  rateLimitMiddleware.max = max;
  rateLimitMiddleware.keyPrefix = keyPrefix;
  rateLimitMiddleware.message = { error: 'Troppe richieste, riprova tra poco' };
  rateLimitMiddleware.standardHeaders = true;
  rateLimitMiddleware.legacyHeaders = false;

  return rateLimitMiddleware;
}

module.exports = { createSlidingWindowLimiter, defaultIdentity };
