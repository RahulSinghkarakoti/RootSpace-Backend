// src/middleware/auth.middleware.js
import { verifyAccessToken } from "../utils/token.js";
import { sendUnauthorized, sendForbidden } from "../utils/response.js";
import prisma from "../config/prisma.js";
import logger from "../utils/logger.js";

// Lightweight in-memory user cache (60s TTL) to prevent DB hammering on every request
const USER_CACHE_TTL_MS = 60 * 1000;
const userCache = new Map();

const getCachedUser = async (userId) => {
  const cached = userCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, isActive: true },
  });
  if (user) {
    userCache.set(userId, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
    if (userCache.size > 5000) {
      const oldestKey = userCache.keys().next().value;
      userCache.delete(oldestKey);
    }
  }
  return user;
};

export const invalidateUserCache = (userId) => {
  if (userId) userCache.delete(userId);
  else userCache.clear();
};

/**
 * Protect — validates Bearer access token on every protected route.
 * Attaches req.user = { id, email, role }
 */
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization; 
    let token = null;
    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    }
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      return sendUnauthorized(res, "No access token provided");
    }
    const decoded = verifyAccessToken(token);
    // Confirm user still exists and is active (cached with short TTL)
    const user = await getCachedUser(decoded.sub);

    if (!user || !user.isActive) {
      return sendUnauthorized(res, "User not found or inactive");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return sendUnauthorized(res, "Access token expired");
    if (err.name === "JsonWebTokenError")
      return sendUnauthorized(res, "Invalid access token");
    logger.error("Auth middleware error:", err);
    return sendUnauthorized(res, "Authentication failed");
  }
};

/**
 * Restrict — role-based access control after protect().
 * Usage: router.get('/admin', protect, restrict('ADMIN', 'SUPERADMIN'), handler)
 */
const restrict =
  (...roles) =>
    (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return sendForbidden(
          res,
          "You do not have permission to perform this action",
        );
      }
      next();
    };

export { protect, restrict };
