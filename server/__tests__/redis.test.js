const mockClient = {
  isOpen: false,
  isReady: false,
  connect: jest.fn(async () => { mockClient.isOpen = true; mockClient.isReady = true; }),
  quit: jest.fn(async () => { mockClient.isOpen = false; mockClient.isReady = false; }),
  ping: jest.fn(async () => 'PONG'),
  on: jest.fn(),
};

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockClient),
}));

const redis = require('../redis');
const onCallsAtLoad = [...mockClient.on.mock.calls];

describe('redis module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('esporta client, connect e disconnect', () => {
    expect(redis.client).toBeDefined();
    expect(typeof redis.connect).toBe('function');
    expect(typeof redis.disconnect).toBe('function');
  });

  test('client espone API necessaria', () => {
    expect(typeof redis.client.connect).toBe('function');
    expect(typeof redis.client.quit).toBe('function');
    expect(typeof redis.client.ping).toBe('function');
    expect(redis.client).toHaveProperty('isReady');
  });

  test('connect chiama client.connect', async () => {
    await redis.connect();
    expect(mockClient.connect).toHaveBeenCalled();
  });

  test('connect non lancia se connessione fallisce', async () => {
    mockClient.connect.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    await expect(redis.connect()).resolves.toBeUndefined();
  });

  test('disconnect chiama quit solo se client è aperto', async () => {
    mockClient.isOpen = true;
    await redis.disconnect();
    expect(mockClient.quit).toHaveBeenCalled();

    mockClient.isOpen = false;
    mockClient.quit.mockClear();
    await redis.disconnect();
    expect(mockClient.quit).not.toHaveBeenCalled();
  });

  test('registra handler di error sul client al load', () => {
    expect(onCallsAtLoad.some(([event]) => event === 'error')).toBe(true);
  });
});
