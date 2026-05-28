const rateLimit = require('express-rate-limit');
const { createSlidingWindowLimiter } = require('./rateLimitRedis');

const write = createSlidingWindowLimiter({
  keyPrefix: 'write',
  windowMs: 60 * 1000,
  max: 30,
});

const auth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppe richieste, riprova tra poco' },
});

module.exports = { write, auth };
