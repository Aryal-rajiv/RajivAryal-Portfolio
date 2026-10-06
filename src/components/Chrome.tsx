import Link from "next/link";
import { site } from "@/lib/site";
import { Facebook, GitHub, Instagram, LinkedIn, YouTube } from "./Icons";

const links = [
  { href: "/#about", label: "About" },
  { href: "/research", label: "Research" },
  { href: "/#experience", label: "Experience" },
  { href: "/#projects", label: "Projects" },
];

function NavLinks() {
  return (
    <nav className="nav" aria-label="Primary">
      {links.map((l) => (
        <Link key={l.href} href={l.href}>
          {l.label}
        </Link>
      ))}
      <Link href="/#contact" className="nav-cta">
        Contact
      </Link>
    </nav>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand" aria-label={`${site.name}, home`}>
          <span className="brand-mark" aria-hidden="true">
            RA
          </span>
          {site.name}
        </Link>
        <NavLinks />
        {/* No-JS mobile menu */}
        <details className="menu">
          <summary>Menu</summary>
          <NavLinks />
        </details>
      </div>
    </header>
  );
}

export function Socials() {
  const items = [
    { href: site.social.github, label: "GitHub", Icon: GitHub },
    { href: site.social.linkedin, label: "LinkedIn", Icon: LinkedIn },
    { href: site.social.youtube, label: "YouTube", Icon: YouTube },
    { href: site.social.facebook, label: "Facebook", Icon: Facebook },
    { href: site.social.instagram, label: "Instagram", Icon: Instagram },
  ];
  return (
    <div className="socials">
      {items.map(({ href, label, Icon }) => (
        <a key={label} href={href} target="_blank" rel="me noopener noreferrer" aria-label={label} title={label}>
          <Icon />
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} {site.name} · {site.location.split(",").slice(-2).join(",").trim()}
        </p>
        <nav aria-label="Footer">
          <Link href="/research">Research</Link>
          <a href="/feed.xml">RSS</a>
          <a href={site.social.github} rel="me noopener noreferrer" target="_blank">
            GitHub
          </a>
          <a href={site.social.linkedin} rel="me noopener noreferrer" target="_blank">
            LinkedIn
          </a>
          <a href={`mailto:${site.email}`}>Email</a>
        </nav>
      </div>
    </footer>
  );
}
