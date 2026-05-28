require('dotenv').config();
const express = require('express');
const cors = require('cors');
const redis = require('./redis');

const app = express();

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
];

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : DEFAULT_ALLOWED_ORIGINS;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Origin non consentita dal CORS'));
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/matches', require('./routes/matches'));
app.use('/api/v1/championships', require('./routes/championships'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/teams', require('./routes/teams'));
app.use('/api/v1/health', require('./routes/health'));

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  redis.connect().finally(() => {
    const server = app.listen(PORT);

    const shutdown = async (signal) => {
      console.log(`[server] ricevuto ${signal}, shutdown in corso`);
      server.close(async () => {
        await redis.disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  });
}

module.exports = app;
