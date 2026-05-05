const redis = require('../config/redis');

// Simple in-memory fallback cache
const memoryCache = new Map();

/**
 * Get data from cache
 * @param {string} key 
 */
const getCache = async (key) => {
  try {
    if (redis?.status === 'ready') {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      const item = memoryCache.get(key);
      if (item && item.expiry > Date.now()) {
        return item.data;
      }
      return null;
    }
  } catch (error) {
    console.error('Cache Get Error:', error);
    return null;
  }
};

/**
 * Set data in cache
 * @param {string} key 
 * @param {any} data 
 * @param {number} ttl - Seconds
 */
const setCache = async (key, data, ttl = 60) => {
  try {
    if (redis?.status === 'ready') {
      await redis.set(key, JSON.stringify(data), 'EX', ttl);
    } else {
      memoryCache.set(key, {
        data,
        expiry: Date.now() + (ttl * 1000)
      });
    }
  } catch (error) {
    console.error('Cache Set Error:', error);
  }
};

/**
 * Delete cache key
 * @param {string} key 
 */
const delCache = async (key) => {
  try {
    if (redis?.status === 'ready') {
      await redis.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache Delete Error:', error);
  }
};

module.exports = { getCache, setCache, delCache };
