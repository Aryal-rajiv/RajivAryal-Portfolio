import Image from "next/image";
import Link from "next/link";
import { Socials } from "@/components/Chrome";
import { ContactForm } from "@/components/ContactForm";
import { Arrow } from "@/components/Icons";
import { NoPosts, PostCard } from "@/components/PostCard";
import { achievements, education, experience, fellowships, leadership, participations, profile, projects, site, skills, type Role } from "@/lib/site";
import { getPosts, isWordPressConfigured } from "@/lib/wordpress";

export const revalidate = 3600;

function Timeline({ items }: { items: Role[] }) {
  return (
    <ol className="timeline">
      {items.map((r) => (
        <li key={`${r.title}-${r.org}`}>
          <h3>
            {r.title} <span className="org">· {r.org}</span>
          </h3>
          <span className="period">{r.period}</span>
          <ul>
            {r.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export default async function Home() {
  const { posts } = await getPosts({ perPage: 3 });

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">{site.role}</span>
              <h1 id="hero-title">
                Hi, I&apos;m Rajiv. I research <em>secure, human-centred</em> web systems.
              </h1>
              <p className="hero-lede">{profile.headline}</p>
              <div className="hero-actions">
                <Link href="/research" className="btn btn-primary">
                  Read my research <Arrow />
                </Link>
                <Link href="/#contact" className="btn btn-ghost">
                  Get in touch
                </Link>
              </div>
              <Socials />
            </div>
            <div className="portrait">
              <Image src="/profile.jpg" alt="Portrait of Rajiv Aryal" width={720} height={720} priority sizes="(max-width: 860px) 240px, 360px" />
              <div className="portrait-badge">
                <span className="dot" aria-hidden="true" /> Open to research roles
              </div>
            </div>
          </div>

          <dl className="stats">
            {profile.stats.map((s) => (
              <div className="stat" key={s.label}>
                <dt className="visually-hidden">{s.label}</dt>
                <dd style={{ margin: 0 }}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="section section-alt" aria-labelledby="about-title">
        <div className="container two-col">
          <div className="about-text">
            <span className="eyebrow">About</span>
            <h2 id="about-title" style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)" }}>
              Software engineering for research, security and social good
            </h2>
            {profile.summary.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>
              Outside work I&apos;m a long-time animal-rights advocate in Nepal, which is why much of my work is with mission-driven organisations.
            </p>
          </div>
          <div>
            <div className="panel">
              <h3>Research interests</h3>
              <ul className="interest-list">
                {profile.interests.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div className="panel">
              <h3>Education</h3>
              <p style={{ margin: 0 }}>
                <strong>{education.degree}</strong>
                <br />
                <span style={{ color: "var(--ink-2)" }}>{education.school}</span>
                <br />
                <span style={{ color: "var(--ink-3)", fontSize: "0.9rem" }}>{education.period}</span>
              </p>
              <p style={{ margin: "12px 0 0", fontSize: "0.92rem", color: "var(--ink-2)" }}>
                <strong>Coursework:</strong> {education.coursework}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Research ---------- */}
      <section id="research" className="section" aria-labelledby="research-title">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Research journal</span>
              <h2 id="research-title">Latest research, surveys &amp; writing</h2>
              <p>Studies, surveys and technical notes on web systems, usable security, digital infrastructure and responsible AI.</p>
            </div>
            <Link href="/research" className="btn btn-ghost">
              All research <Arrow />
            </Link>
          </div>
          {posts.length ? (
            <div className="grid">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          ) : (
            <NoPosts configured={isWordPressConfigured} />
          )}
        </div>
      </section>

      {/* ---------- Experience ---------- */}
      <section id="experience" className="section section-alt" aria-labelledby="exp-title">
        <div className="container two-col">
          <div>
            <span className="eyebrow">Experience</span>
            <h2 id="exp-title" style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", marginBottom: 28 }}>
              Professional work
            </h2>
            <Timeline items={experience} />
          </div>
          <div>
            <span className="eyebrow">Leadership</span>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", marginBottom: 28 }}>Teaching, mentoring &amp; advocacy</h2>
            <Timeline items={leadership} />
            <div className="panel" style={{ marginTop: 8 }}>
              <h3>Achievements</h3>
              <ul className="list-plain">
                {achievements.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Projects ---------- */}
      <section id="projects" className="section" aria-labelledby="projects-title">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Selected work</span>
              <h2 id="projects-title">Research &amp; technical projects</h2>
            </div>
          </div>
          <div className="grid">
            {projects.map((p) => (
              <article key={p.title} className={`card${p.featured ? " card-featured" : ""}`}>
                <h3>{p.title}</h3>
                <p className="meta">{p.stack}</p>
                <ul>
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <a className="card-foot" href={p.href} target="_blank" rel="noopener noreferrer">
                  {p.linkLabel} ↗
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Skills ---------- */}
      <section id="skills" className="section section-alt" aria-labelledby="skills-title">
        <div className="container two-col">
          <div>
            <span className="eyebrow">Toolkit</span>
            <h2 id="skills-title" style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", marginBottom: 24 }}>
              Skills &amp; technologies
            </h2>
            {skills.map((g) => (
              <div className="skill-group" key={g.group}>
                <h3>{g.group}</h3>
                <ul className="chips">
                  {g.items.map((i) => (
                    <li className="chip" key={i}>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <span className="eyebrow">Learning</span>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", marginBottom: 24 }}>Fellowships &amp; conferences</h2>
            <ul className="list-plain">
              {fellowships.map((f) => (
                <li key={f.title}>
                  <div className="fellow">
                    <strong>{f.title}</strong>
                    <span>{f.period}</span>
                  </div>
                  {f.note}
                </li>
              ))}
            </ul>
            <h3 style={{ marginTop: 32, fontSize: "1.2rem" }}>National &amp; international participation</h3>
            <ul className="list-plain">
              {participations.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="section" aria-labelledby="contact-title">
        <div className="container contact-grid">
          <div>
            <span className="eyebrow">Contact</span>
            <h2 id="contact-title" style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)" }}>
              Let&apos;s collaborate
            </h2>
            <p style={{ color: "var(--ink-2)" }}>
              Open to research assistant roles, collaborations on surveys and studies, and security or web-systems work for mission-driven organisations.
            </p>
            <dl className="contact-info">
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </dd>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
              </dd>
              <dt>Location</dt>
              <dd>{site.location}</dd>
            </dl>
            <Socials />
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
