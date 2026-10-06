import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchIndex } from "@/components/ResearchIndex";
import { site } from "@/lib/site";
import { getCategories, getCategory, getPosts } from "@/lib/wordpress";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategory((await params).slug);
  if (!cat) return {};
  const description = `${cat.name} by ${site.name}: studies and writing on web systems, security and responsible AI.`;
  return {
    title: cat.name,
    description,
    alternates: { canonical: `/research/category/${cat.slug}` },
    openGraph: { title: `${cat.name} | ${site.name}`, description, url: `/research/category/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [cat, categories] = await Promise.all([getCategory(slug), getCategories()]);
  if (!cat) notFound();
  const { posts } = await getPosts({ category: cat.id, perPage: 100 });
  return (
    <ResearchIndex
      title={cat.name}
      intro={`${cat.name} from my research journal on web systems, usable security, digital infrastructure and responsible AI.`}
      posts={posts}
      categories={categories}
      active={cat.slug}
    />
  );
}
