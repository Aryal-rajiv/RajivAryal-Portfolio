// Describes every piece of CMS-editable content. The admin UI builds its forms
// from this, and the server uses it to validate whatever the admin saves.
//
// Field types: text, textarea, url, date, select, checkbox,
//              list (one item per line), tags (comma separated)

const collections = {
  experience: {
    label: "Experience",
    hint: "Jobs, volunteering and community roles. Order here is the order on the site (newest first).",
    titleField: "role",
    subtitleField: "organization",
    fields: [
      { name: "type", label: "Type", type: "select", options: [
        { value: "professional", label: "Professional" },
        { value: "community", label: "Community & volunteering" },
      ], required: true },
      { name: "role", label: "Role / title", type: "text", required: true },
      { name: "organization", label: "Organisation", type: "text", required: true },
      { name: "period", label: "Period", type: "text", placeholder: "Mar 2026 – Jun 2026" },
      { name: "location", label: "Location", type: "text" },
      { name: "summary", label: "One-line summary", type: "textarea", rows: 2 },
      { name: "highlights", label: "Highlights (one per line)", type: "list" },
      { name: "url", label: "Organisation link", type: "url" },
    ],
  },
  projects: {
    label: "Projects",
    hint: "Every project you've done. Tick \"Featured\" to show it on the home page.",
    titleField: "title",
    subtitleField: "category",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "text", placeholder: "Security, Research, Client work…" },
      { name: "year", label: "Year", type: "text" },
      { name: "summary", label: "One-line summary", type: "textarea", rows: 2, required: true },
      { name: "highlights", label: "Highlights (one per line)", type: "list" },
      { name: "tags", label: "Tech / tags (comma separated)", type: "tags" },
      { name: "url", label: "Live site link", type: "url" },
      { name: "repo", label: "Code / GitHub link", type: "url" },
      { name: "featured", label: "Featured on home page", type: "checkbox" },
    ],
  },
  donations: {
    label: "Donations",
    hint: "Donations you've made. Shown on the Donations page, newest first.",
    titleField: "organization",
    subtitleField: "date",
    fields: [
      { name: "organization", label: "Organisation", type: "text", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "cause", label: "Cause", type: "text", placeholder: "Animal welfare, education…" },
      { name: "amount", label: "Amount (optional)", type: "text", placeholder: "NPR 5,000" },
      { name: "note", label: "Note", type: "textarea", rows: 3 },
      { name: "url", label: "Organisation link", type: "url" },
    ],
  },
  blogs: {
    label: "Blog posts",
    hint: "Links to articles you've written elsewhere (Medium, LinkedIn, etc.). Newest first.",
    titleField: "title",
    subtitleField: "platform",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "url", label: "Link", type: "url", required: true },
      { name: "platform", label: "Platform", type: "text", placeholder: "Medium" },
      { name: "date", label: "Published", type: "date" },
      { name: "summary", label: "Short summary", type: "textarea", rows: 2 },
    ],
  },
  education: {
    label: "Education",
    titleField: "degree",
    subtitleField: "institution",
    fields: [
      { name: "degree", label: "Degree", type: "text", required: true },
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "period", label: "Period", type: "text" },
      { name: "details", label: "Details", type: "textarea", rows: 2 },
    ],
  },
  participations: {
    label: "Participations",
    hint: "Conferences, fellowships, hackathons and courses.",
    titleField: "title",
    subtitleField: "year",
    fields: [
      { name: "title", label: "Event / programme", type: "text", required: true },
      { name: "organizer", label: "Organiser", type: "text" },
      { name: "year", label: "Year", type: "text" },
    ],
  },
  skills: {
    label: "Skills",
    hint: "Technology logos. Icon is a path to an image in /public, e.g. /assets/img/node.png",
    titleField: "name",
    subtitleField: "icon",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "icon", label: "Icon path", type: "text", required: true },
    ],
  },
};

const profile = {
  label: "Profile",
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "role", label: "Role line", type: "text" },
    { name: "headline", label: "Headline", type: "textarea", rows: 2 },
    { name: "about", label: "About (blank line between paragraphs)", type: "textarea", rows: 8 },
    { name: "interests", label: "Focus areas (one per line)", type: "list" },
    { name: "stats", label: "Stats (one per line, as: value | label)", type: "list" },
    { name: "achievements", label: "Achievements (one per line)", type: "list" },
    { name: "email", label: "Email", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "location", label: "Location", type: "text" },
    { name: "donationsIntro", label: "Donations page intro", type: "textarea", rows: 3 },
    { name: "linkedin", label: "LinkedIn", type: "url" },
    { name: "github", label: "GitHub", type: "url" },
    { name: "medium", label: "Medium / blog", type: "url" },
    { name: "youtube", label: "YouTube", type: "url" },
    { name: "facebook", label: "Facebook", type: "url" },
    { name: "instagram", label: "Instagram", type: "url" },
  ],
};

module.exports = { collections, profile };
