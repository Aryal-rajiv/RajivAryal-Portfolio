// Minimal password login for the CMS: a signed, expiring, HttpOnly cookie.
const crypto = require("crypto");

const COOKIE = "cms_session";
const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

const password = () => process.env.ADMIN_PASSWORD || "";
const secret = () => process.env.SESSION_SECRET || `cms:${password()}`;

const sign = (payload) =>
  crypto.createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return "";
}

function isLoggedIn(req) {
  const token = readCookie(req, COOKIE);
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  return safeEqual(sig, sign(expires));
}

function login(req, res) {
  if (!password() || !safeEqual(req.body?.password || "", password())) return false;
  const expires = String(Date.now() + MAX_AGE_MS);
  res.cookie(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: req.secure,
    maxAge: MAX_AGE_MS,
    path: "/",
  });
  return true;
}

function logout(res) {
  res.clearCookie(COOKIE, { path: "/" });
}

function requireLogin(req, res, next) {
  if (isLoggedIn(req)) return next();
  res.status(401).json({ message: "Please log in" });
}

module.exports = { isLoggedIn, login, logout, requireLogin };
