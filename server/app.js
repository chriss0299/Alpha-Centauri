require('dotenv').config();
const express = require('express');

const app = express();

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
