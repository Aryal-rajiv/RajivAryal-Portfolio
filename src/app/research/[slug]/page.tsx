import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, personId } from "@/components/JsonLd";
import { formatDate } from "@/components/PostCard";
import { site } from "@/lib/site";
import { getAllPosts, getPost, type Post } from "@/lib/wordpress";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

const isResearch = (p: Post) => p.categories.some((c) => /research|survey|study|paper/i.test(c.slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const url = `/research/${post.slug}`;
  const description = post.excerpt.slice(0, 300);
  const day = post.date.slice(0, 10).replace(/-/g, "/");
  return {
    title: post.title,
    description,
    keywords: [...post.tags.map((t) => t.name), ...post.categories.map((c) => c.name)],
    authors: [{ name: site.name, url: site.url }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: [site.url],
      section: post.categories[0]?.name,
      tags: post.tags.map((t) => t.name),
      ...(post.image ? { images: [{ url: post.image.url, alt: post.image.alt, width: post.image.width, height: post.image.height }] } : {}),
    },
    twitter: { card: "summary_large_image", title: post.title, description },
    // Highwire Press tags let Google Scholar index research posts.
    other: {
      citation_title: post.title,
      citation_author: site.name,
      citation_publication_date: day,
      citation_online_date: day,
      citation_language: "en",
      citation_public_url: `${site.url}${url}`,
      citation_abstract_html_url: `${site.url}${url}`,
      citation_publisher: site.name,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const url = `${site.url}/research/${post.slug}`;
  const year = new Date(post.date).getUTCFullYear();
  const showToc = post.headings.length >= 3;
  const updated = post.modified.slice(0, 10) !== post.date.slice(0, 10);

  return (
    <article>
      <header className="article-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/research">Research</Link>
            </li>
            {post.categories[0] && (
              <li>
                <Link href={`/research/category/${post.categories[0].slug}`}>{post.categories[0].name}</Link>
              </li>
            )}
          </ol>
        </nav>
        <h1>{post.title}</h1>
        {post.excerpt && (
          <p style={{ fontSize: "1.2rem", color: "var(--ink-2)" }}>
            {post.excerpt}
          </p>
        )}
        <div className="article-meta">
          <span>
            By <Link href="/#about">{site.name}</Link>
          </span>
          <span>
            Published <time dateTime={post.date}>{formatDate(post.date)}</time>
          </span>
          {updated && (
            <span>
              Updated <time dateTime={post.modified}>{formatDate(post.modified)}</time>
            </span>
          )}
          <span>{post.readingMinutes} min read</span>
        </div>
      </header>

      {post.image && (
        <figure className="article-hero">
          <Image src={post.image.url} alt={post.image.alt} width={post.image.width || 1600} height={post.image.height || 900} sizes="(max-width: 1040px) 100vw, 1000px" priority />
        </figure>
      )}

      <div className={`article-layout${showToc ? "" : " no-toc"}`}>
        <div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />

          {post.tags.length > 0 && (
            <ul className="chips" style={{ marginTop: 32 }} aria-label="Tags">
              {post.tags.map((t) => (
                <li className="chip" key={t.id}>
                  #{t.name}
                </li>
              ))}
            </ul>
          )}

          <section className="cite" aria-labelledby="cite-title">
            <h2 id="cite-title">Cite this</h2>
            <p>
              Aryal, R. ({year}). <em>{post.title}</em>. {site.name}. {url}
            </p>
          </section>

          <aside className="author-box" aria-label="About the author">
            <Image src="/profile.jpg" alt="" width={64} height={64} />
            <p>
              <strong style={{ color: "var(--ink)" }}>{site.name}</strong> is a web systems and security practitioner researching usable security, digital
              infrastructure and responsible AI. <Link href="/#contact">Get in touch</Link>.
            </p>
          </aside>

          <div className="pager">
            <Link href="/research" className="btn btn-ghost">
              ← All research
            </Link>
          </div>
        </div>

        {showToc && (
          <nav className="toc" aria-label="On this page">
            <h2>On this page</h2>
            <ol>
              {post.headings.map((h) => (
                <li key={h.id} className={`lvl-${h.level}`}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": isResearch(post) ? "ScholarlyArticle" : "BlogPosting",
              "@id": `${url}#article`,
              headline: post.title,
              description: post.excerpt,
              url,
              mainEntityOfPage: url,
              datePublished: post.date,
              dateModified: post.modified,
              author: { "@id": personId, "@type": "Person", name: site.name, url: site.url },
              publisher: { "@id": personId },
              image: post.image?.url ?? `${site.url}/opengraph-image`,
              keywords: post.tags.map((t) => t.name).join(", "),
              articleSection: post.categories.map((c) => c.name),
              wordCount: post.readingMinutes * 225,
              inLanguage: "en",
              isAccessibleForFree: true,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: site.url },
                { "@type": "ListItem", position: 2, name: "Research", item: `${site.url}/research` },
                { "@type": "ListItem", position: 3, name: post.title, item: url },
              ],
            },
          ],
        }}
      />
    </article>
  );
}
