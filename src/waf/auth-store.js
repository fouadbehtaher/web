const crypto = require("crypto");

const sessions = new Map();

const DEFAULT_USERNAME = process.env.WAF_ADMIN_USER || "admin";
const DEFAULT_PASSWORD = process.env.WAF_ADMIN_PASSWORD || "Admin123!";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function createSession() {
  const token = crypto.randomBytes(24).toString("hex");
  const session = {
    token,
    username: DEFAULT_USERNAME,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  };
  sessions.set(token, session);
  return session;
}

function getSession(token) {
  if (!token) {
    return null;
  }

  const session = sessions.get(token);
  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return session;
}

function deleteSession(token) {
  return sessions.delete(token);
}

function validateCredentials(username, password) {
  return username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD;
}

function getAuthConfig() {
  return {
    username: DEFAULT_USERNAME
  };
}

module.exports = {
  createSession,
  deleteSession,
  getAuthConfig,
  getSession,
  validateCredentials
};

