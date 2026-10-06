import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllPosts, getCategories } from "@/lib/wordpress";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);
  const latest = posts[0]?.modified ? new Date(posts[0].modified) : new Date();
  return [
    { url: site.url, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/research`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    ...categories.map((c) => ({ url: `${site.url}/research/category/${c.slug}`, lastModified: latest, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...posts.map((p) => ({
      url: `${site.url}/research/${p.slug}`,
      lastModified: new Date(p.modified),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      ...(p.image ? { images: [p.image.url] } : {}),
    })),
  ];
}
