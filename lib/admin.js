// CMS API used by /admin. Content is saved to the JSON files in /content, so
// edit locally, check the site, then commit and push.
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const schema = require("./schema");
const content = require("./content");
const auth = require("./auth");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");

// The CMS is local-only by design: it never runs on Vercel or in production,
// and it only answers requests coming from this computer.
const isProduction = () => Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";

const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
// Uses the real socket address, not X-Forwarded-For, so it can't be spoofed.
const isLocalRequest = (req) => LOOPBACK.has(req.socket.remoteAddress);

function cmsStatus(req) {
  if (isProduction()) {
    return { enabled: false, reason: "The CMS only runs locally. Edit content on your computer, then commit and push." };
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
    return { enabled: false, reason: "Set ADMIN_PASSWORD (12+ characters) in your .env file and restart the server to enable the CMS." };
  }
  if (!isLocalRequest(req)) {
    return { enabled: false, reason: "The CMS can only be opened from this computer (http://localhost)." };
  }
  return { enabled: true };
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

const router = express.Router();

router.get("/status", (req, res) => {
  const status = cmsStatus(req);
  res.json({ ...status, loggedIn: status.enabled && auth.isLoggedIn(req) });
});

// Everything below needs the CMS to be enabled.
router.use((req, res, next) => {
  const status = cmsStatus(req);
  if (!status.enabled) return res.status(403).json({ message: status.reason });
  next();
});

router.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { message: "Too many attempts, try again later" } }),
  (req, res) => {
    if (auth.login(req, res)) return res.json({ success: true });
    res.status(401).json({ message: "Wrong password" });
  }
);

router.post("/logout", (req, res) => {
  auth.logout(res);
  res.json({ success: true });
});

router.use(auth.requireLogin);

router.get("/schema", (req, res) => res.json(schema));

router.get("/content", (req, res) => res.json(content.readAll()));

router.put("/profile", (req, res) => {
  const result = content.saveProfile(req.body);
  if (result.error) return res.status(400).json({ message: result.error });
  res.json({ success: true, data: result.value });
});

router.put("/collections/:name", (req, res) => {
  const result = content.saveCollection(req.params.name, req.body);
  if (result.error) return res.status(400).json({ message: result.error });
  res.json({ success: true, data: result.value });
});

router.post("/cv", (req, res) => {
  upload.single("cv")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.code === "LIMIT_FILE_SIZE" ? "PDF must be under 10 MB" : err.message });
    const file = req.file;
    if (!file || file.buffer.subarray(0, 5).toString() !== "%PDF-") {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }
    const name = content.readAll().profile.name || "CV";
    const fileName = `${name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "CV"}-CV.pdf`;
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, fileName), file.buffer);
    // The version query makes browsers fetch the new file instead of a cached one.
    const url = `/uploads/${fileName}?v=${Date.now()}`;
    content.setCvFile(url);
    res.json({ success: true, cvFile: url });
  });
});

module.exports = { router, isProduction };
