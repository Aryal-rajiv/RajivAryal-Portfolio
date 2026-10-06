import "server-only";
import sanitizeHtml from "sanitize-html";

// Headless WordPress client. Posts are fetched from the WP REST API at build time and
// re-fetched every REVALIDATE seconds, or immediately when WordPress calls /api/revalidate.

const WP_URL = process.env.WORDPRESS_URL?.replace(/\/$/, "");
const REVALIDATE = 3600;
export const WP_TAG = "wordpress";

export type Term = { id: number; name: string; slug: string; count?: number };

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  author: string;
  image: { url: string; alt: string; width?: number; height?: number } | null;
  categories: Term[];
  tags: Term[];
  readingMinutes: number;
  headings: { id: string; text: string; level: 2 | 3 }[];
};

type WPRendered = { rendered: string };
type WPPost = {
  id: number;
  slug: string;
  date_gmt: string;
  modified_gmt: string;
  title: WPRendered;
  excerpt: WPRendered;
  content: WPRendered;
  _embedded?: {
    author?: { name: string }[];
    "wp:featuredmedia"?: {
      source_url: string;
      alt_text: string;
      media_details?: { width: number; height: number };
    }[];
    "wp:term"?: { id: number; name: string; slug: string; taxonomy: string }[][];
  };
};

export const isWordPressConfigured = Boolean(WP_URL);

async function wp<T>(path: string): Promise<{ data: T; total: number } | null> {
  if (!WP_URL) return null;
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/${path}`, {
      next: { revalidate: REVALIDATE, tags: [WP_TAG] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error(`WordPress ${path} -> ${res.status}`);
      return null;
    }
    return { data: (await res.json()) as T, total: Number(res.headers.get("X-WP-Total") || 0) };
  } catch (err) {
    console.error(`WordPress ${path} failed`, err);
    return null;
  }
}

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…");

export const stripTags = (html: string) => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** Sanitises post HTML, gives h2/h3 anchor ids, lazy-loads media and collects a table of contents. */
function prepareContent(html: string) {
  const headings: Post["headings"] = [];
  const used = new Set<string>();
  const heading = (level: 2 | 3) => (tagName: string, attribs: sanitizeHtml.Attributes) => ({ tagName, attribs });

  const clean = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption", "iframe", "video", "source", "sup", "sub", "del", "ins", "details", "summary", "mark"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["id", "class"],
      img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "loading"],
      video: ["src", "controls", "width", "height", "poster", "preload"],
      source: ["src", "type"],
      a: ["href", "name", "target", "rel", "title"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com", "docs.google.com", "datawrapper.dwcdn.net", "public.flourish.studio"],
    transformTags: {
      h2: heading(2),
      h3: heading(3),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
      iframe: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href || "") && !(WP_URL && attribs.href?.startsWith(WP_URL));
        return { tagName, attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs };
      },
    },
  });

  // Add ids to headings in a second pass so we can read their text content.
  const content = clean.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/g, (match, tag: string, attrs: string, inner: string) => {
    const text = stripTags(inner);
    if (!text) return match;
    const existing = /\sid="([^"]+)"/.exec(attrs)?.[1];
    let id = existing || slugify(text) || "section";
    if (!existing) {
      let n = 2;
      const base = id;
      while (used.has(id)) id = `${base}-${n++}`;
    }
    used.add(id);
    headings.push({ id, text, level: tag === "h2" ? 2 : 3 });
    return existing ? match : `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });

  // Rewrite links that point at the WordPress front end to this site's research pages.
  const rewritten = WP_URL ? content.replace(new RegExp(`href="${WP_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/(?:\\d{4}/\\d{2}/(?:\\d{2}/)?)?([a-z0-9-]+)/?"`, "g"), 'href="/research/$1"') : content;

  return { content: rewritten, headings };
}

function toPost(p: WPPost, withContent: boolean): Post {
  const media = p._embedded?.["wp:featuredmedia"]?.[0];
  const terms = p._embedded?.["wp:term"] ?? [];
  const pick = (tax: string) => terms.flat().filter((t) => t?.taxonomy === tax).map(({ id, name, slug }) => ({ id, name: decode(name), slug }));
  const words = stripTags(p.content.rendered).split(" ").length;
  const prepared = withContent ? prepareContent(p.content.rendered) : { content: "", headings: [] };
  return {
    id: p.id,
    slug: p.slug,
    title: decode(stripTags(p.title.rendered)),
    excerpt: stripTags(p.excerpt.rendered).replace(/\s*\[…\]$|\s*\[&hellip;\]$/, "…"),
    content: prepared.content,
    headings: prepared.headings,
    date: `${p.date_gmt}Z`,
    modified: `${p.modified_gmt}Z`,
    author: p._embedded?.author?.[0]?.name ?? "Rajiv Aryal",
    image: media?.source_url
      ? { url: media.source_url, alt: media.alt_text || "", width: media.media_details?.width, height: media.media_details?.height }
      : null,
    categories: pick("category").filter((c) => c.slug !== "uncategorized"),
    tags: pick("post_tag"),
    readingMinutes: Math.max(1, Math.round(words / 225)),
  };
}

const LIST_FIELDS = "id,slug,date_gmt,modified_gmt,title,excerpt,content,_links,_embedded";

export async function getPosts({ page = 1, perPage = 12, category }: { page?: number; perPage?: number; category?: number } = {}) {
  const q = new URLSearchParams({ _embed: "author,wp:featuredmedia,wp:term", per_page: String(perPage), page: String(page), _fields: LIST_FIELDS });
  if (category) q.set("categories", String(category));
  const res = await wp<WPPost[]>(`posts?${q}`);
  return { posts: res?.data.map((p) => toPost(p, false)) ?? [], total: res?.total ?? 0 };
}

/** Every published post, for static generation, the sitemap and feeds. */
export async function getAllPosts(): Promise<Post[]> {
  const all: Post[] = [];
  for (let page = 1; page <= 20; page++) {
    const { posts, total } = await getPosts({ page, perPage: 100 });
    all.push(...posts);
    if (all.length >= total || posts.length === 0) break;
  }
  return all;
}

export async function getPost(slug: string): Promise<Post | null> {
  const q = new URLSearchParams({ slug, _embed: "author,wp:featuredmedia,wp:term" });
  const res = await wp<WPPost[]>(`posts?${q}`);
  const p = res?.data[0];
  return p ? toPost(p, true) : null;
}

export async function getCategories(): Promise<Term[]> {
  const res = await wp<Term[]>(`categories?per_page=100&hide_empty=true&_fields=id,name,slug,count`);
  return (res?.data ?? []).filter((c) => c.slug !== "uncategorized").map((c) => ({ ...c, name: decode(c.name) }));
}

export async function getCategory(slug: string): Promise<Term | null> {
  const res = await wp<Term[]>(`categories?slug=${encodeURIComponent(slug)}&_fields=id,name,slug,count`);
  const c = res?.data[0];
  return c ? { ...c, name: decode(c.name) } : null;
}
