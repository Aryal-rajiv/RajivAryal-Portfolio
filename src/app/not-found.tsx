import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640, textAlign: "center" }}>
        <span className="eyebrow">404</span>
        <h1 style={{ fontSize: "2.6rem" }}>This page doesn&apos;t exist</h1>
        <p style={{ color: "var(--ink-2)" }}>It may have moved, or the link may be mistyped.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
          <Link href="/" className="btn btn-primary">
            Go home
          </Link>
          <Link href="/research" className="btn btn-ghost">
            Browse research
          </Link>
        </div>
      </div>
    </section>
  );
}
