import { Redis } from 'ioredis';
import { env } from './env.js';

export const pubClient = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

export const subClient = pubClient.duplicate();

pubClient.on('connect', () => {
  console.log('[Redis] Pub Client Connected');
});

pubClient.on('error', (err) => {
  console.error('[Redis] Pub Client Error:', err.message);
});

subClient.on('connect', () => {
  console.log('[Redis] Sub Client Connected');
});

subClient.on('error', (err) => {
  console.error('[Redis] Sub Client Error:', err.message);
});
