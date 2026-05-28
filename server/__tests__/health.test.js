const mockClient = {
  isReady: true,
  ping: jest.fn(async () => 'PONG'),
  on: jest.fn(),
  connect: jest.fn(),
  quit: jest.fn(),
};

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockClient),
}));

const request = require('supertest');
const express = require('express');
const healthRouter = require('../routes/health');

function buildApp() {
  const app = express();
  app.use('/api/v1/health', healthRouter);
  return app;
}

describe('GET /api/v1/health/redis', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('200 con status ok se client connesso e PING risponde', async () => {
    mockClient.isReady = true;
    mockClient.ping.mockResolvedValueOnce('PONG');

    const res = await request(buildApp()).get('/api/v1/health/redis');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('503 se client non ready', async () => {
    mockClient.isReady = false;

    const res = await request(buildApp()).get('/api/v1/health/redis');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'down' });
  });

  test('503 se PING lancia errore', async () => {
    mockClient.isReady = true;
    mockClient.ping.mockRejectedValueOnce(new Error('connection lost'));

    const res = await request(buildApp()).get('/api/v1/health/redis');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('down');
    expect(res.body.error).toBe('connection lost');
  });

  test('503 se PING risponde con stringa diversa da PONG', async () => {
    mockClient.isReady = true;
    mockClient.ping.mockResolvedValueOnce('NOPE');

    const res = await request(buildApp()).get('/api/v1/health/redis');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'down' });
  });
});
