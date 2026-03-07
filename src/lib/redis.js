import IORedis from 'ioredis';
import 'dotenv/config'

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not set');
}

// BullMQ requires maxRetriesPerRequest: null
export const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
});

redisConnection.on('error', (err) => {
  console.error('[Redis] connection error:', err);
});