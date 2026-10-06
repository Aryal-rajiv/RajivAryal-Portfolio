"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

declare global {
  interface Window {
    grecaptcha?: { render: (el: HTMLElement, opts: { sitekey: string }) => number; reset: (id?: number) => void };
    onRecaptchaLoad?: () => void;
  }
}

// Public site key (safe to expose). Override with NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LdHUYErAAAAADiCbCZJ4rS06iP-KNHj6PnXPxZr";

export function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const captchaEl = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "busy"; msg: string } | null>(null);

  // Load reCAPTCHA only when the form scrolls near the viewport, so it never slows the first paint.
  useEffect(() => {
    if (!SITE_KEY || !form.current) return;
    const load = () => {
      if (document.getElementById("recaptcha-js")) return;
      window.onRecaptchaLoad = () => {
        if (captchaEl.current && window.grecaptcha && widget.current === null) {
          widget.current = window.grecaptcha.render(captchaEl.current, { sitekey: SITE_KEY });
        }
      };
      const s = document.createElement("script");
      s.id = "recaptcha-js";
      s.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
      s.async = true;
      document.head.appendChild(s);
    };
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && (load(), io.disconnect()), { rootMargin: "400px" });
    io.observe(form.current);
    return () => io.disconnect();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (SITE_KEY && !data["g-recaptcha-response"]) {
      setStatus({ kind: "err", msg: "Please complete the reCAPTCHA." });
      return;
    }
    setStatus({ kind: "busy", msg: "Sending…" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Something went wrong.");
      form.current?.reset();
      setStatus({ kind: "ok", msg: "Thanks! Your message has been sent. I'll reply soon." });
    } catch (err) {
      setStatus({ kind: "err", msg: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      if (widget.current !== null) window.grecaptcha?.reset(widget.current);
    }
  }

  return (
    <form ref={form} className="form panel" onSubmit={onSubmit} noValidate={false}>
      <div className="row">
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" autoComplete="name" required maxLength={120} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} />
        </div>
      </div>
      <div>
        <label htmlFor="subject">Subject</label>
        <input id="subject" name="subject" required maxLength={200} />
      </div>
      <div>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={6} required maxLength={5000} />
      </div>
      {/* Honeypot: bots fill it, people never see it */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {SITE_KEY && <div ref={captchaEl} style={{ minHeight: 78 }} />}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button className="btn btn-primary" type="submit" disabled={status?.kind === "busy"}>
          Send message
        </button>
        <p className="form-status" role="status" aria-live="polite" data-kind={status?.kind}>
          {status?.msg}
        </p>
      </div>
    </form>
  );
}
