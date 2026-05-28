const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MAX_RECONNECT_DELAY_MS = 30_000;

const client = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(2 ** retries * 100, MAX_RECONNECT_DELAY_MS),
  },
});

client.on('error', (err) => {
  console.error('[redis] error:', err.message);
});

async function connect() {
  try {
    await client.connect();
    console.log('[redis] connected to', REDIS_URL);
  } catch (err) {
    console.error('[redis] connessione iniziale fallita:', err.message);
  }
}

async function disconnect() {
  if (client.isOpen) {
    await client.quit();
  }
}

module.exports = { client, connect, disconnect };
