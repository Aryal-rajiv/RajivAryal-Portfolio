import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function verifyCaptcha(token: string, ip: string | null) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // captcha disabled when no secret is configured
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", body });
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  // Honeypot filled: pretend success so bots don't retry.
  if (clip(raw.website, 200)) return NextResponse.json({ success: true });

  const name = clip(raw.name, 120);
  const email = clip(raw.email, 200);
  const subject = clip(raw.subject, 200).replace(/[\r\n]+/g, " ");
  const message = clip(raw.message, 5000);

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  try {
    if (!(await verifyCaptcha(clip(raw["g-recaptcha-response"], 4000), ip))) {
      return NextResponse.json({ message: "reCAPTCHA verification failed. Please try again." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ message: "Could not verify reCAPTCHA. Please try again." }, { status: 502 });
  }

  const { EMAIL_USER, EMAIL_PASS } = process.env;
  const to = process.env.YOUR_EMAIL || process.env.EMAIL_RECEIVER || EMAIL_USER;
  if (!EMAIL_USER || !EMAIL_PASS || !to) {
    console.error("Contact form: EMAIL_USER / EMAIL_PASS / YOUR_EMAIL not configured");
    return NextResponse.json({ message: "Email is not configured yet. Please email me directly." }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"Website contact" <${EMAIL_USER}>`,
      to,
      replyTo: { name, address: email },
      subject: `[aryalrajiv.com.np] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form: send failed", err);
    return NextResponse.json({ message: "Sorry, the message could not be sent. Please email me directly." }, { status: 500 });
  }
}
