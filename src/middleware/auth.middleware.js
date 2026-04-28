// src/middleware/auth.middleware.js
import { verifyAccessToken } from "../utils/token.js";
import { sendUnauthorized, sendForbidden } from "../utils/response.js";
import prisma from "../config/prisma.js";
import logger from "../utils/logger.js";

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
    // Confirm user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

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
