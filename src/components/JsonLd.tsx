import { education, profile, site } from "@/lib/site";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so post titles can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const personId = `${site.url}/#person`;

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": personId,
  name: site.name,
  url: site.url,
  image: `${site.url}/profile.jpg`,
  email: `mailto:${site.email}`,
  jobTitle: site.role,
  description: profile.summary[0],
  address: { "@type": "PostalAddress", addressLocality: "Chitwan", addressCountry: "NP" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Tribhuvan University", department: education.school },
  knowsAbout: profile.interests,
  sameAs: Object.values(site.social),
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: site.url,
  name: site.name,
  description: site.description,
  inLanguage: "en",
  publisher: { "@id": personId },
};
