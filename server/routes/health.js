const express = require('express');
const { client } = require('../redis');

const router = express.Router();

router.get('/redis', async (_req, res) => {
  if (!client.isReady) {
    return res.status(503).json({ status: 'down' });
  }
  try {
    const reply = await client.ping();
    if (reply !== 'PONG') {
      return res.status(503).json({ status: 'down' });
    }
    return res.json({ status: 'ok' });
  } catch (err) {
    return res.status(503).json({ status: 'down', error: err.message });
  }
});

module.exports = router;
