// Reads and writes the JSON files in /content that power the site.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const schema = require("./schema");

const CONTENT_DIR = path.join(__dirname, "..", "content");
const MAX_TEXT = 5000;

const filePath = (name) => path.join(CONTENT_DIR, `${name}.json`);

function read(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath(name), "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

function write(name, data) {
  // Write to a temp file first so a crash never leaves half-written JSON behind.
  const tmp = `${filePath(name)}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n");
  fs.renameSync(tmp, filePath(name));
}

function readAll() {
  const out = { profile: read("profile", {}) };
  for (const name of Object.keys(schema.collections)) out[name] = read(name, []);
  return out;
}

// Only http(s), mailto and site-relative links are allowed, so nothing like
// "javascript:" can end up in an href.
function cleanUrl(value) {
  const v = String(value || "").trim();
  if (!v) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const u = new URL(v);
    return ["http:", "https:", "mailto:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}

function cleanText(value) {
  return String(value ?? "").trim().slice(0, MAX_TEXT);
}

// Returns { value } or { error } for a single object, keeping only known fields.
function sanitize(fields, input) {
  const out = {};
  for (const f of fields) {
    const raw = input ? input[f.name] : undefined;
    let v;
    switch (f.type) {
      case "checkbox":
        v = raw === true || raw === "true" || raw === "on";
        break;
      case "list":
      case "tags": {
        const arr = Array.isArray(raw)
          ? raw
          : String(raw || "").split(f.type === "tags" ? "," : /\r?\n/);
        v = arr.map(cleanText).filter(Boolean).slice(0, 50);
        break;
      }
      case "url":
        v = cleanUrl(raw);
        if (v === null) return { error: `${f.label}: must be a full link starting with https://` };
        break;
      case "date":
        v = cleanText(raw);
        if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { error: `${f.label}: invalid date` };
        break;
      case "select":
        v = cleanText(raw);
        if (!f.options.some((o) => o.value === v)) v = f.options[0].value;
        break;
      default:
        v = cleanText(raw);
    }
    if (f.required && (v === "" || (Array.isArray(v) && !v.length))) {
      return { error: `${f.label} is required` };
    }
    out[f.name] = v;
  }
  return { value: out };
}

function saveCollection(name, items) {
  if (!Object.hasOwn(schema.collections, name)) return { error: "Unknown collection" };
  const def = schema.collections[name];
  if (!Array.isArray(items)) return { error: "Expected a list" };

  const clean = [];
  for (const [i, item] of items.entries()) {
    const res = sanitize(def.fields, item);
    if (res.error) return { error: `Item ${i + 1}: ${res.error}` };
    const id = typeof item.id === "string" && /^[\w-]{1,64}$/.test(item.id)
      ? item.id
      : `${name.slice(0, 4)}-${crypto.randomUUID().slice(0, 8)}`;
    clean.push({ id, ...res.value });
  }
  write(name, clean);
  return { value: clean };
}

function saveProfile(input) {
  const res = sanitize(schema.profile.fields, input);
  if (res.error) return res;
  // cvFile is only changed by the CV upload, never by the profile form.
  const value = { ...res.value, cvFile: read("profile", {}).cvFile || "" };
  write("profile", value);
  return { value };
}

function setCvFile(url) {
  const current = read("profile", {});
  write("profile", { ...current, cvFile: url });
}

module.exports = { readAll, saveCollection, saveProfile, setCvFile };
