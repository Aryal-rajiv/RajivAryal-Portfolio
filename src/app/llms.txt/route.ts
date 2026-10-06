import { education, experience, profile, projects, site, skills } from "@/lib/site";
import { getAllPosts } from "@/lib/wordpress";

export const revalidate = 3600;

// llms.txt (https://llmstxt.org): a plain-text map of the site for AI assistants and answer engines.
export async function GET() {
  const posts = await getAllPosts();
  const body = `# ${site.name}

> ${site.role}. ${profile.summary[0]}

${profile.summary[1]}

Contact: ${site.email} · ${site.location}
Profiles: ${Object.values(site.social).join(", ")}

## Research interests
${profile.interests.map((i) => `- ${i}`).join("\n")}

## Research & writing
${posts.length ? posts.map((p) => `- [${p.title}](${site.url}/research/${p.slug}): ${p.excerpt.slice(0, 200)}`).join("\n") : "- Research and surveys in progress. See " + site.url + "/research"}

## Experience
${experience.map((r) => `- ${r.title}, ${r.org} (${r.period})`).join("\n")}

## Education
- ${education.degree}, ${education.school} (${education.period})

## Selected projects
${projects.map((p) => `- [${p.title}](${p.href}): ${p.points[0]}`).join("\n")}

## Skills
${skills.map((g) => `- ${g.group}: ${g.items.join(", ")}`).join("\n")}

## Optional
- [RSS feed](${site.url}/feed.xml)
- [Sitemap](${site.url}/sitemap.xml)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
