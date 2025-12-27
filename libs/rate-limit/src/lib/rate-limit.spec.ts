import { MemoryRateLimitStorage } from './rate-limit.storage';

describe('MemoryRateLimitStorage', () => {
  let storage: MemoryRateLimitStorage;

  beforeEach(() => {
    storage = new MemoryRateLimitStorage();
  });

  afterEach(async () => {
    await storage.clear();
  });

  it('should store and retrieve rate limit info', async () => {
    const key = 'test-key';
    const info = { count: 5, resetTime: Date.now() + 60000 };

    await storage.set(key, info, 60);
    const retrieved = await storage.get(key);

    expect(retrieved).toEqual(info);
  });

  it('should return null for non-existent keys', async () => {
    const result = await storage.get('non-existent');
    expect(result).toBeNull();
  });

  it('should increment count', async () => {
    const key = 'test-key';
    const info = { count: 1, resetTime: Date.now() + 60000 };

    await storage.set(key, info, 60);
    await storage.increment(key);

    const retrieved = await storage.get(key);
    expect(retrieved?.count).toBe(2);
  });

  it('should delete keys', async () => {
    const key = 'test-key';
    const info = { count: 1, resetTime: Date.now() + 60000 };

    await storage.set(key, info, 60);
    await storage.delete(key);

    const retrieved = await storage.get(key);
    expect(retrieved).toBeNull();
  });

  it('should clear all data', async () => {
    await storage.set('key1', { count: 1, resetTime: Date.now() }, 60);
    await storage.set('key2', { count: 2, resetTime: Date.now() }, 60);

    expect(storage.size()).toBe(2);

    await storage.clear();

    expect(storage.size()).toBe(0);
  });

  it('should auto-delete after TTL', (done) => {
    const key = 'test-key';
    const info = { count: 1, resetTime: Date.now() + 1000 };

    storage.set(key, info, 1).then(() => { // 1 second TTL

      // Should exist immediately
      storage.get(key).then(result => {
        expect(result).toEqual(info);

        // Should be deleted after TTL
        setTimeout(() => {
          storage.get(key).then(result => {
            expect(result).toBeNull();
            done();
          }).catch(done);
        }, 1100);
      }).catch(done);
    }).catch(done);
  }, 2000);
});
