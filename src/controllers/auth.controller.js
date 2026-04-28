// src/controllers/auth.controller.js
import authService from "../services/auth.service.js";
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendError,
} from "../utils/response.js";

// ── Local Auth ────────────────────────────────────────────────────────────────

const register = async (req, res) => {
  const result = await authService.register(req.body, req,res);
  sendCreated(res, "Account created successfully", result);
};

const login = async (req, res) => {
  const result = await authService.login(req.body, req, res);
  sendSuccess(res, "Login successful", result);
};

const refreshToken = async (req, res) => {
 const rawToken= req.cookies.refreshToken;
  const result = await authService.refreshTokens(rawToken, req);
  const { refreshToken,user, ...safeTokens } = result;
 res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // don't force true in dev
    sameSite: "lax", // or "lax" depending on your flow
    maxAge: 7 * 24 * 60 * 60 * 1000, // 10 hours
  }); 
  sendSuccess(res, "Tokens refreshed",  {
    user,
    ...safeTokens,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken, req.user.id, req);
  sendSuccess(res, "Logged out successfully");
};

const logoutAll = async (req, res) => {
  await authService.logoutAll(req.user.id, req);
  sendSuccess(res, "Logged out from all devices");
};

// ── OAuth ─────────────────────────────────────────────────────────────────────

/**
 * Called after Passport verifies the Google token.
 * req.oauthUser is set by the Passport strategy callback.
 */
const oauthCallback = async (req, res) => {
  if (!req.oauthUser) {
    return sendError(res, 500, "OAuth authentication failed");
  }
  const result = await authService.oauthUpsert(req.oauthUser, req);
  sendSuccess(res, "OAuth login successful", result);
};

// ── Profile / Sessions ────────────────────────────────────────────────────────

const me = async (req, res) => {
  const { id, email, role } = req.user;
  sendSuccess(res, "Profile fetched", { id, email, role });
};

const sessions = async (req, res) => {
  const data = await authService.getSessions(req.user.id);
  sendSuccess(res, "Active sessions", data);
};

export default {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  oauthCallback,
  me,
  sessions,
};
