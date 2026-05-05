const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

let redis = null;

// Check if REDIS_URL is provided in .env
const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 1) return null; // Don't retry more than once
        return 2000;
      }
    });

    redis.on('error', (err) => {
      console.warn('\x1b[33m%s\x1b[0m', 'WARNING: Redis connection failed. Status:', redis.status);
    });

    redis.on('connect', () => {
      console.log('\x1b[32m%s\x1b[0m', 'Redis connected successfully');
    });
  } catch (error) {
    console.warn('Redis initialization failed:', error.message);
  }
} else {
  console.log('\x1b[36m%s\x1b[0m', 'Caching Strategy: In-Memory (Redis URL not configured)');
}

module.exports = redis;
