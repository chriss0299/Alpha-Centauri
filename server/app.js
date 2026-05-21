require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
];

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

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT);
}

module.exports = app;
