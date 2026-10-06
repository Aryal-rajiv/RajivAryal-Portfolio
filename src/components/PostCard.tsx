import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/wordpress";

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <article className="card post-card">
      <div className="thumb">
        {post.image ? (
          <Image
            src={post.image.url}
            alt={post.image.alt}
            width={post.image.width || 1200}
            height={post.image.height || 675}
            sizes="(max-width: 700px) 100vw, 360px"
            priority={priority}
          />
        ) : (
          <div className="thumb-fallback" aria-hidden="true">
            {post.categories[0]?.name ?? "Research"}
          </div>
        )}
      </div>
      <div className="body">
        {post.categories.length > 0 && (
          <ul className="chips">
            {post.categories.slice(0, 2).map((c) => (
              <li key={c.id}>
                <Link className="chip" href={`/research/category/${c.slug}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <h3>
          <Link href={`/research/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
        </p>
        <p>{post.excerpt.length > 180 ? `${post.excerpt.slice(0, 177).trimEnd()}…` : post.excerpt}</p>
      </div>
    </article>
  );
}

export function NoPosts({ configured }: { configured: boolean }) {
  return (
    <div className="empty">
      <h3>First studies are on the way</h3>
      <p style={{ margin: 0 }}>
        I&apos;m currently working on surveys and research in web systems, usable security and responsible AI.
        {configured ? " Published work will appear here." : " Published work will appear here once the research library is connected."}{" "}
        <a href="/feed.xml">Subscribe via RSS</a> to be notified.
      </p>
    </div>
  );
}
