import type { Metadata } from "next";
import { ResearchIndex } from "@/components/ResearchIndex";
import { site } from "@/lib/site";
import { getAllPosts, getCategories } from "@/lib/wordpress";

export const revalidate = 3600;

const description =
  "Research, surveys and technical writing by Rajiv Aryal on web systems, usable security, authentication, digital research infrastructure and responsible AI.";

export const metadata: Metadata = {
  title: "Research & Writing",
  description,
  alternates: { canonical: "/research" },
  openGraph: { title: `Research & Writing | ${site.name}`, description, url: "/research" },
};

export default async function ResearchPage() {
  const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);
  return <ResearchIndex title="Research & Writing" intro={description} posts={posts} categories={categories} />;
}
