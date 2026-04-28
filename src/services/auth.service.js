// src/services/auth.service.js
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import {
  getAccessTokenExpiry,
  getRefreshTokenExpiry,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token.js";
import AppError from "../utils/AppError.js";
import { audit } from "../utils/audit.js";

const BCRYPT_ROUNDS = 12;

// ── Helpers ──────────────────────────────────────────────────────────────────

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  avatarUrl: user.avatarUrl,
  role: user.role,
  isVerified: user.isVerified,
});

const issueTokenPair = async (user, { ipAddress, deviceInfo } = {}) => {
  const accessToken = generateAccessToken(user);
  const rawRefresh = generateRefreshToken();
  const refreshToken = rawRefresh; // send raw to client
  
  
  const refreshExpiresAt = getRefreshTokenExpiry(); // returns Date
  const accessExpiresAt =  new Date(getAccessTokenExpiry()).getTime();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawRefresh),
      expiresAt: refreshExpiresAt,
      ipAddress: ipAddress || null,
      deviceInfo: deviceInfo || null,
    },
  });

  return { accessToken, refreshToken, expiresAt: accessExpiresAt };
};

// ── Register ─────────────────────────────────────────────────────────────────

const register = async ({ firstName, lastName, email, password }, req,res) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email is already registered", 409);

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash },
  });

  await audit({
    userId: user.id,
    action: "REGISTER",
    entity: "User",
    entityId: user.id,
    req,
  });

  const tokens = await issueTokenPair(user, {
    ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    deviceInfo: req.headers["user-agent"],
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // don't force true in dev
    sameSite: "lax", // or "lax" depending on your flow
    maxAge: 7 * 24 * 60 * 60 * 1000, // 10 hours
  });

 const { refreshToken, ...safeTokens } = tokens;

  return {
    user: sanitizeUser(user),
    tokens:safeTokens,
  };
 
};

// ── Login ─────────────────────────────────────────────────────────────────────

const login = async ({ email, password }, req, res) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Constant-time comparison even when user not found
  const dummyHash = "$2b$12$invalidhashfortimingprotection.invalidsuffix";
  const isValid = user
    ? await bcrypt.compare(password, user.passwordHash || dummyHash)
    : (await bcrypt.compare(password, dummyHash), false);

  if (!user || !isValid) throw new AppError("Invalid email or password", 404);
  if (!user.isActive) throw new AppError("Account is disabled", 403);

  await audit({
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
    req,
  });

  const tokens = await issueTokenPair(user, {
    ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    deviceInfo: req.headers["user-agent"],
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // don't force true in dev
    sameSite: "lax", // or "lax" depending on your flow
    maxAge: 7 * 24 * 60 * 60 * 1000, // 10 hours
  });

 const { refreshToken, ...safeTokens } = tokens;

  return {
    user: sanitizeUser(user),
        tokens:safeTokens,
  };
};

// ── Refresh ───────────────────────────────────────────────────────────────────

const refreshTokens = async ( rawToken,req) => {

  if (!rawToken) throw new AppError("Refresh token required", 400);
  
  const tokenHash = hashToken(rawToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored) throw new AppError("Invalid refresh token", 401);
  if (stored.revoked) throw new AppError("Refresh token has been revoked", 401);
  if (stored.expiresAt < new Date())
    throw new AppError("Refresh token expired", 401);
  if (!stored.user.isActive) throw new AppError("Account is disabled", 403);

  // Rotate: revoke old, issue new pair
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true, revokedAt: new Date() },
  });

  const tokens = await issueTokenPair(stored.user, {
    ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    deviceInfo: req.headers["user-agent"],
  });

 
  return {
    user: sanitizeUser(stored.user),
    ...tokens,
  };
};

// ── Logout ────────────────────────────────────────────────────────────────────

const logout = async (rawToken, userId, req) => {
  if (!rawToken) return;

  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, userId },
    data: { revoked: true, revokedAt: new Date() },
  });

  await audit({ userId, action: "LOGOUT", req });
};

// ── Logout All Devices ────────────────────────────────────────────────────────

const logoutAll = async (userId, req) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true, revokedAt: new Date() },
  });
  await audit({ userId, action: "LOGOUT_ALL_DEVICES", req });
};

// ── OAuth upsert (called from Passport callback) ──────────────────────────────

const oauthUpsert = async (
  { provider, providerId, email, firstName, lastName, avatarUrl },
  req,
) => {
  // Check if provider record exists
  let oauthRecord = await prisma.oAuthProviderRecord.findUnique({
    where: { provider_providerId: { provider, providerId } },
    include: { user: true },
  });

  let user;

  if (oauthRecord) {
    user = oauthRecord.user;
  } else {
    // Try linking to existing account with same email
    user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, firstName, lastName, avatarUrl, isVerified: true },
      });
    }

    await prisma.oAuthProviderRecord.create({
      data: { userId: user.id, provider, providerId },
    });
  }

  if (!user.isActive) throw new AppError("Account is disabled", 403);

  await audit({ userId: user.id, action: `OAUTH_LOGIN_${provider}`, req });

  const tokens = await issueTokenPair(user, {
    ipAddress: req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress,
    deviceInfo: req?.headers?.["user-agent"],
  });

  return { user: sanitizeUser(user), ...tokens };
};

// ── Get active sessions ───────────────────────────────────────────────────────

const getSessions = async (userId) => {
  return prisma.refreshToken.findMany({
    where: { userId, revoked: false, expiresAt: { gte: new Date() } },
    select: {
      id: true,
      deviceInfo: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export default {
  register,
  login,
  refreshTokens,
  logout,
  logoutAll,
  oauthUpsert,
  getSessions,
};
