// Single source of truth for profile content. Edit this file to update the CV sections of the site.

export const site = {
  name: "Rajiv Aryal",
  shortName: "Rajiv",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://aryalrajiv.com.np").replace(/\/$/, ""),
  title: "Rajiv Aryal | Web Systems, Security & Research",
  role: "Research-Oriented Web Systems and Security Professional",
  description:
    "Rajiv Aryal is a computer science graduate from Nepal working on web systems, usable security, authentication, digital research infrastructure and responsible AI. Read his research, surveys and technical writing.",
  email: "rajivary1@gmail.com",
  phone: "+977 9860620334",
  location: "Ratnanagar-11, Chitwan, Nepal",
  locale: "en_US",
  cv: "/Rajiv-Aryal-CV.pdf",
  keywords: [
    "Rajiv Aryal",
    "web systems research",
    "usable security",
    "authentication research",
    "cybersecurity Nepal",
    "responsible AI",
    "AI safety",
    "headless WordPress developer",
    "Next.js developer Nepal",
    "WordPress developer Nepal",
    "research assistant",
    "animal advocacy technology",
  ],
  social: {
    github: "https://github.com/Aryal-rajiv",
    linkedin: "https://www.linkedin.com/in/%F0%9F%8C%B1rajiv-aryal-3610bb198/",
    youtube: "https://www.youtube.com/@rajivaryal7836",
    facebook: "https://www.facebook.com/romeo.rajiv.52/",
    instagram: "https://www.instagram.com/its.rajiv.aryal/",
  },
};

export const profile = {
  headline: "I build secure, reliable web systems and research how people and organisations stay safe online.",
  summary: [
    "I am a Computer Science and Information Technology graduate and web systems practitioner with experience in usable security, authentication, infrastructure resilience, full-stack development and digital research communication.",
    "I have worked with international nonprofits, research organisations and technology companies, translating technical investigations into prototypes, documentation and operational guidance for mission-driven teams. I am now focused on research: surveys and studies at the intersection of software engineering, security and socially beneficial AI.",
  ],
  interests: [
    "Web and software systems",
    "Usable security and privacy",
    "Identity and authentication",
    "Organisational cybersecurity",
    "Digital research infrastructure",
    "Responsible and socially beneficial AI",
  ],
  stats: [
    { value: "4+", label: "years of professional web work" },
    { value: "40+", label: "awareness programmes organised" },
    { value: "15+", label: "schools reached" },
    { value: "25", label: "wildlife rescues" },
  ],
};

export const skills = [
  {
    group: "Programming & web",
    items: ["Python", "JavaScript", "PHP", "React.js", "Next.js", "Node.js", "Express.js", "WordPress", "REST APIs", "HTML", "CSS", "MongoDB"],
  },
  {
    group: "Security & infrastructure",
    items: ["OAuth 2.0", "Passkeys", "DMARC", "Web application firewalls", "CSP / HSTS / HTTP security headers", "Endpoint security", "Backup & disaster recovery", "Google Workspace"],
  },
  {
    group: "Research & tooling",
    items: ["Git / GitHub", "Jupyter Notebook", "NumPy", "pandas", "Matplotlib", "Postman", "Zotero", "Technical SEO"],
  },
];

export type Role = {
  title: string;
  org: string;
  period: string;
  points: string[];
};

export const experience: Role[] = [
  {
    title: "Security Consultant",
    org: "We Animals",
    period: "Mar 2026 – Jun 2026",
    points: [
      "Designed and implemented organisational security infrastructure spanning passwordless authentication, credential management, endpoint protection and disaster recovery.",
      "Deployed enterprise browser management, email authentication and web application firewall controls; wrote security playbooks, onboarding guides and operating procedures.",
      "Delivered awareness sessions on phishing prevention, authentication, and backup and recovery practices.",
    ],
  },
  {
    title: "Web Systems & Security Analyst",
    org: "ANDA",
    period: "Jan 2026 – Apr 2026",
    points: [
      "Analysed and security-tested a Next.js and headless WordPress system, identifying application-security and performance gaps.",
      "Researched and implemented CSP, HSTS and other HTTP security headers; documented the system for maintainability and knowledge transfer.",
    ],
  },
  {
    title: "Research Library Web Publisher",
    org: "Faunalytics",
    period: "May 2025 – Dec 2025",
    points: [
      "Transformed research reports into accurate, accessible, web-ready resources for an online research library.",
      "Reviewed, formatted and published articles while improving consistency, content organisation, usability and accessibility with the Resource Library Manager.",
    ],
  },
  {
    title: "WordPress & PHP Developer",
    org: "Mangobyte Digital",
    period: "May 2024 – May 2025",
    points: [
      "Developed reusable JavaScript, CSS, PHP and WordPress components that improved maintainability and content-management workflows.",
      "Conducted technical audits, data extraction and performance analysis; customised administrative systems to improve usability.",
    ],
  },
  {
    title: "WordPress Developer",
    org: "DMC Marketing",
    period: "Jan 2024 – Apr 2024",
    points: [
      "Built and maintained functional, user-friendly WordPress websites optimised for speed and performance.",
      "Worked with the SEO team to apply technical SEO that improved rankings and search visibility.",
    ],
  },
  {
    title: "Website Manager",
    org: "Vegan Travel Asia, VegVoyages Foundation (USA)",
    period: "Jan 2023 – Jan 2024",
    points: [
      "Maintained accessible organisational websites and digital communication systems, resolving issues and optimising platform reliability.",
      "Supported advocacy outreach through website operations and Google Ads campaign management.",
    ],
  },
  {
    title: "Web GIS Intern",
    org: "NAXA – Location Matters",
    period: "Apr 2022 – Jul 2022",
    points: [
      "Contributed to React.js front-end development and API integration; supported an Express.js and MongoDB back end.",
      "Managed SEO metadata with React Helmet.",
    ],
  },
];

export const leadership: Role[] = [
  {
    title: "Secretary",
    org: "Animal Rights Club",
    period: "2019 – present",
    points: [
      "Organised more than 40 municipality and district-level awareness programmes for the welfare and conservation of wild, companion, farm and working animals in Nepal.",
      "Led 25 wildlife rescues from illegal zoos and private houses with Chitwan National Park and the Division Forest Office, Chitwan.",
      "Ran animal-rights education programmes in 15+ schools in Chitwan and lobbied local government to shut down illegal zoos.",
      "Took part in conservation programmes with Chitwan National Park, community forests and the Community Based Anti-Poaching Unit (CBAPU).",
    ],
  },
  {
    title: "Python Programming Trainer",
    org: "Krinjal Foundation / Techie Nepal / U.S. Embassy collaboration",
    period: "2021 – 2022",
    points: [
      "Taught Python, computational thinking and problem solving to high-school students, connecting programming concepts to introductory Raspberry Pi projects.",
    ],
  },
  {
    title: "Founding President",
    org: "Birendra Open Source Club",
    period: "2021 – 2022",
    points: [
      "Co-founded an undergraduate open-source community, ran Git/GitHub and Hacktoberfest workshops, and mentored students in sustainable collaboration practices.",
    ],
  },
  {
    title: "President",
    org: "CSIT Association of Nepal – Chitwan",
    period: "2019 – 2022",
    points: [
      "Led teams delivering technical workshops, hackathons, conferences and regional networking programmes; coordinated logistics, outreach and technical operations.",
    ],
  },
];

export const education = {
  degree: "B.Sc. in Computer Science and Information Technology",
  school: "Institute of Science and Technology, Tribhuvan University, Kirtipur",
  period: "2019 – 2023",
  coursework:
    "Data Structures and Algorithms, Design and Analysis of Algorithms, Artificial Intelligence, Statistics, Mathematics, Software Engineering, Object-Oriented Programming, Databases, Systems Analysis and Design.",
};

export type Project = {
  title: string;
  stack: string;
  points: string[];
  href: string;
  linkLabel: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    title: "Organisational Security & Backup Infrastructure",
    stack: "Google Workspace · Passkeys · DMARC · Browser management",
    points: [
      "Investigated security architectures for authentication, credential management, browser administration, backup and organisational identity.",
      "Implemented passkeys, DMARC, centralised browser policies and recovery workflows, evaluating operational trade-offs and resilience.",
    ],
    href: "https://weanimals.org/",
    linkLabel: "We Animals",
    featured: true,
  },
  {
    title: "Messenger Link Impersonation Vulnerability",
    stack: "Node.js · Express.js · Responsible disclosure",
    points: [
      "Investigated a potential impersonation vulnerability in Messenger link previews through a controlled proof of concept focused on user trust and authentication risk.",
      "Documented the methodology and findings and reported them through Meta's Bug Bounty Program.",
    ],
    href: "https://github.com/Aryal-rajiv/Messenger-bugbounty-research",
    linkLabel: "View on GitHub",
    featured: true,
  },
  {
    title: "Microsoft Login Plugin for WordPress",
    stack: "PHP · OAuth 2.0 · Microsoft Identity Platform",
    points: [
      "Studied OAuth 2.0 flows and Microsoft Identity Platform requirements for enterprise single sign-on in WordPress.",
      "Built a plugin handling authentication, token exchange and API communication, with a 'Login with Microsoft' button for all users.",
    ],
    href: "https://github.com/Aryal-rajiv/Microsoft-Login-Plugin",
    linkLabel: "View on GitHub",
    featured: true,
  },
  {
    title: "ANDA Security Analysis",
    stack: "Next.js · Headless WordPress · HTTP security headers",
    points: [
      "Researched and implemented CSP, HSTS and HTTP security headers to harden the application.",
      "Audited existing systems and wrote documentation for maintainability and future development.",
    ],
    href: "https://anda.jor.br/",
    linkLabel: "Visit site",
  },
  {
    title: "ImPower Healthcare Web Platform",
    stack: "WordPress · PHP · JavaScript · Responsive design",
    points: [
      "Designed and built a mobile-first healthcare website from UX planning to deployment, including custom functionality and third-party integrations.",
      "Evaluated analytics, responsiveness and performance to improve usability across devices.",
    ],
    href: "https://impowerhealthcare.com/",
    linkLabel: "Visit site",
  },
  {
    title: "LawToolBox",
    stack: "WordPress · Custom plugins · JavaScript",
    points: [
      "Rebuilt an existing website with a new design while preserving all content and functionality.",
      "Recreated legacy features with custom CSS and JavaScript and built custom plugins for specific requirements.",
    ],
    href: "https://lawtoolbox.com/",
    linkLabel: "Visit site",
  },
  {
    title: "MyOffshoreStaff",
    stack: "WordPress · Elementor · Figma",
    points: [
      "Implemented a Figma design pixel-accurately in WordPress with custom Elementor templates.",
      "Added custom functionality with JavaScript and CSS.",
    ],
    href: "https://myoffshorestaff.com.au/",
    linkLabel: "Visit site",
  },
];

export const fellowships = [
  { title: "EAGxIndia Conference", period: "Sep 2026", note: "AI safety discussions, networking and collaboration in AI safety." },
  { title: "Worldbuilding AI Futures Course", period: "Aug 2026", note: "Completed course on imagining and stress-testing AI futures." },
  { title: "Future of AI, BlueDot Impact", period: "2026", note: "AI and AGI development pathways, case studies and societal implications." },
  { title: "Futurekind AI Fellowship", period: "2025 – 2026", note: "Training and project work on AI that benefits the planet and sentient life." },
  { title: "OSM Hackfest, Chitwan Region", period: "2023", note: "Mentored teams in web development, problem solving and presentation." },
  { title: "CSITAN Hackathon", period: "2022", note: "National hackathon by the CSIT Association of Nepal." },
  { title: "Code Camp, Western Regional Campus", period: "2019", note: "Built a mobile app promoting local tourism." },
];

export const participations = [
  "WordCamp Nepal 2024",
  "Provathon 2023 by CSIT Association of Nepal",
  "Asia Farm Animal Day Conference 2023, Kuala Lumpur, by Asia for Animals Coalition and AVA Summit",
  "Animal Advocacy Academy Nepal 2023 by Animal Alliance Asia",
  "Animal Advocacy Conference Asia 2022 by Animal Alliance Asia",
  "“The Impact of History and Culture on Animal Justice” by Animal Alliance Asia",
  "Seminar on Conservation of Clouded Leopard and its Habitat, Chitwan National Park",
  "HULT Prize IOST 2019",
];

export const achievements = [
  "Second Runner-up and ‘Best Idea Award’, HULT Prize IOST 2019 (national idea-pitching competition)",
  "Founder of “Chance to Lead”",
  "Founder of Birendra Open Source Club",
];
