import { redisConnection } from './redis.js';
import { sendSuccess } from '../utils/response.js';

const DEFAULT_TTL = Number(process.env.CACHE_TTL_SECONDS) || 60;

export const cacheGet = async (key) => {
  try {
    const val = await redisConnection.get(key);
    if (!val) return null;
    return JSON.parse(val);
  } catch (err) {
    console.error('[Cache] get error', err);
    return null;
  }
};

export const cacheSet = async (key, payload, ttl = DEFAULT_TTL) => {
  try {
    const str = JSON.stringify(payload);
    if (ttl && ttl > 0) {
      await redisConnection.set(key, str, 'EX', ttl);
    } else {
      await redisConnection.set(key, str);
    }
  } catch (err) {
    console.error('[Cache] set error', err);
  }
};

// Middleware factory: keyBuilder(req) => key string
export const cacheMiddleware = (keyBuilder, ttl = DEFAULT_TTL) => {
  return async (req, res, next) => {
    try {
      const key = typeof keyBuilder === 'function' ? keyBuilder(req) : keyBuilder;
      if (!key) return next();
      const cached = await cacheGet(key);
      if (cached) {
        console.log(`[CACHE HIT] Key: ${key}`);
        return sendSuccess(res, cached.message || 'OK', cached.data ?? null);
      }
      console.log(`[CACHE MISS] Key: ${key}`);
      res.locals.cacheKey = key;
      res.locals.cacheTTL = ttl;
      return next();
    } catch (err) {
      console.error('[Cache] middleware error', err);
      return next();
    }
  };
};

// Invalidate cache by key pattern
export const cacheInvalidate = async (pattern) => {
  try {
    const keys = await redisConnection.keys(pattern);
    if (keys.length > 0) {
      await redisConnection.del(...keys);
      console.log(`[CACHE INVALIDATED] Pattern: ${pattern}, Keys deleted: ${keys.length}`);
    }
  } catch (err) {
    console.error('[Cache] invalidate error', err);
  }
};

// Invalidate all cache for a specific tree
export const invalidateTreeCache = async (treeId, userId) => {
  try {
    await cacheInvalidate(`tree:*${treeId}*`);
    await cacheInvalidate(`tree:all:${userId}`);
    await cacheInvalidate(`tree:collab:${userId}`);
    console.log(`[CACHE INVALIDATED] Tree: ${treeId}, User: ${userId}`);
  } catch (err) {
    console.error('[Cache] tree invalidate error', err);
  }
};

// Invalidate cache for person operations within a tree
export const invalidatePersonCache = async (treeId) => {
  try {
    await cacheInvalidate(`tree:*:${treeId}:person*`);
    console.log(`[CACHE INVALIDATED] Person cache for tree: ${treeId}`);
  } catch (err) {
    console.error('[Cache] person invalidate error', err);
  }
};

// Invalidate cache for relation operations within a tree
export const invalidateRelationCache = async (treeId) => {
  try {
    await cacheInvalidate(`tree:*:${treeId}:relation*`);
    console.log(`[CACHE INVALIDATED] Relation cache for tree: ${treeId}`);
  } catch (err) {
    console.error('[Cache] relation invalidate error', err);
  }
};

// Invalidate cache for media operations within a tree
export const invalidateMediaCache = async (treeId) => {
  try {
    await cacheInvalidate(`tree:*:${treeId}:media*`);
    console.log(`[CACHE INVALIDATED] Media cache for tree: ${treeId}`);
  } catch (err) {
    console.error('[Cache] media invalidate error', err);
  }
};

export default {
  cacheGet,
  cacheSet,
  cacheMiddleware,
  cacheInvalidate,
  invalidateTreeCache,
  invalidatePersonCache,
  invalidateRelationCache,
  invalidateMediaCache,
};
