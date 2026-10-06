import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Rss } from "@/components/Icons";
import { NoPosts, PostCard } from "@/components/PostCard";
import { site } from "@/lib/site";
import { isWordPressConfigured, type Post, type Term } from "@/lib/wordpress";

export function ResearchIndex({ title, intro, posts, categories, active }: { title: string; intro: string; posts: Post[]; categories: Term[]; active?: string }) {
  const path = active ? `/research/category/${active}` : "/research";
  return (
    <>
      <header className="page-head">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>{active ? <Link href="/research">Research</Link> : <span aria-current="page">Research</span>}</li>
              {active && <li aria-current="page">{title}</li>}
            </ol>
          </nav>
          <span className="eyebrow">Research journal</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          {categories.length > 0 && (
            <ul className="chips" style={{ marginTop: 20 }} aria-label="Filter by type">
              <li>
                <Link className="chip" href="/research" aria-current={!active ? "page" : undefined}>
                  All
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link className="chip" href={`/research/category/${c.slug}`} aria-current={active === c.slug ? "page" : undefined}>
                    {c.name} {c.count ? <span style={{ opacity: 0.6 }}>({c.count})</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          {posts.length ? (
            <div className="grid">
              {posts.map((p, i) => (
                <PostCard key={p.id} post={p} priority={i < 3} />
              ))}
            </div>
          ) : (
            <NoPosts configured={isWordPressConfigured} />
          )}
          <p style={{ marginTop: 32 }}>
            <a href="/feed.xml" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
              <Rss /> Subscribe via RSS
            </a>
          </p>
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description: intro,
          url: `${site.url}${path}`,
          author: { "@id": `${site.url}/#person` },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: posts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/research/${p.slug}`, name: p.title })),
          },
        }}
      />
    </>
  );
}
