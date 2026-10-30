/**
 * Renders the portfolio from /api/content (edited through the CMS at /admin).
 * Every value is inserted as text, never as HTML.
 */
(function () {
  "use strict";

  /* ---------- helpers ---------- */

  function safeHref(url) {
    const v = String(url || "").trim();
    if (v.startsWith("/") && !v.startsWith("//")) return v;
    return /^(https?:|mailto:|tel:)/i.test(v) ? v : "";
  }

  // el("a", { class: "x", href: "/" }, "text", child, [more])
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "href" || key === "src") {
        const safe = safeHref(value);
        if (safe) node.setAttribute(key, safe);
      } else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false || child === "") continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }

  const icon = (name) => el("i", { class: `bi bi-${name}`, "aria-hidden": "true" });
  const external = (href) => (href && /^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});
  const mount = (id, ...nodes) => {
    const target = document.getElementById(id);
    if (target) target.replaceChildren(...nodes);
    return target;
  };

  function formatDate(iso, withDay) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return iso || "";
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
      day: withDay ? "numeric" : undefined, month: "short", year: "numeric", timeZone: "UTC",
    });
  }

  const byDateDesc = (a, b) => String(b.date || "").localeCompare(String(a.date || ""));

  function sectionHead(eyebrow, title, sub, extra) {
    return el("div", { class: "section-head" },
      el("div", {},
        el("span", { class: "eyebrow" }, eyebrow),
        el("h2", { class: "section-title" }, title),
        sub && el("p", { class: "section-sub" }, sub)),
      extra);
  }

  function cvButton(profile, className) {
    if (!profile.cvFile) return null;
    const fileName = `${(profile.name || "CV").replace(/\s+/g, "-")}-CV.pdf`;
    return el("a", { class: className, href: profile.cvFile, download: fileName },
      icon("download"), " Download CV");
  }

  const SOCIALS = [
    ["linkedin", "LinkedIn"], ["github", "GitHub"], ["medium", "Medium"],
    ["youtube", "YouTube"], ["facebook", "Facebook"], ["instagram", "Instagram"],
  ];

  function socialLinks(profile) {
    return el("div", { class: "socials" },
      SOCIALS.filter(([key]) => profile[key]).map(([key, label]) =>
        el("a", { href: profile[key], "aria-label": label, title: label, ...external(profile[key]) }, icon(key))));
  }

  /* ---------- chrome ---------- */

  function renderHeader(profile, page) {
    const links = [
      ["About", "/#about", "home"],
      ["Experience", "/#experience"],
      ["Projects", "/projects", "projects"],
      ["Writing", "/#writing"],
      ["Donations", "/donations", "donations"],
      ["CV", "/cv", "cv"],
      ["Contact", "/#contact"],
    ];
    const nav = el("nav", { class: "nav-links", id: "site-nav", "aria-label": "Main" },
      links.map(([label, href, key]) =>
        el("a", { href, "aria-current": key && key === page && key !== "home" ? "page" : null }, label)),
      cvButton(profile, "btn btn-primary btn-sm"));

    const toggle = el("button", { class: "nav-toggle", "aria-label": "Menu", "aria-expanded": "false", "aria-controls": "site-nav" }, icon("list"));
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.firstChild.className = `bi bi-${open ? "x-lg" : "list"}`;
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });

    const initials = (profile.name || "").split(/\s+/).map((w) => w[0]).join("").slice(0, 2);
    const header = mount("site-header",
      el("div", { class: "container nav" },
        el("a", { class: "brand", href: "/" }, el("span", { class: "brand-mark" }, initials), profile.name),
        toggle, nav));

    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function renderFooter(profile) {
    mount("site-footer",
      el("div", { class: "container footer-inner" },
        el("span", {}, `© ${new Date().getFullYear()} ${profile.name}`),
        el("div", { class: "footer-links" },
          el("a", { href: "/projects" }, "Projects"),
          el("a", { href: "/donations" }, "Donations"),
          el("a", { href: "/cv" }, "CV"),
          el("a", { href: "/#contact" }, "Contact")),
        socialLinks(profile)));
  }

  /* ---------- shared pieces ---------- */

  function projectCard(p) {
    return el("article", { class: "card project reveal", "data-category": p.category || "" },
      el("div", { class: "project-meta" },
        p.category ? el("span", { class: "project-cat" }, p.category) : el("span"),
        el("span", {}, p.year)),
      el("h3", {}, p.title),
      el("p", {}, p.summary),
      p.highlights && p.highlights.length
        ? el("details", {}, el("summary", {}, "Details ", icon("chevron-down")),
            el("ul", {}, p.highlights.map((h) => el("li", {}, h))))
        : null,
      p.tags && p.tags.length ? el("ul", { class: "chips" }, p.tags.map((t) => el("li", { class: "chip" }, t))) : null,
      (p.url || p.repo) && el("div", { class: "project-links" },
        p.url && el("a", { href: p.url, ...external(p.url) }, "Visit site ", icon("arrow-up-right")),
        p.repo && el("a", { href: p.repo, ...external(p.repo) }, icon("github"), " Code")));
  }

  function donationStats(donations) {
    const orgs = new Set(donations.map((d) => d.organization.trim().toLowerCase()));
    const causes = new Set(donations.map((d) => (d.cause || "").trim().toLowerCase()).filter(Boolean));
    return [
      [donations.length, donations.length === 1 ? "donation" : "donations"],
      [orgs.size, orgs.size === 1 ? "organisation" : "organisations"],
      [causes.size, causes.size === 1 ? "cause" : "causes"],
    ];
  }

  /* ---------- home ---------- */

  function renderHome(data) {
    const { profile } = data;
    const firstName = (profile.name || "").split(" ")[0];

    // Hero
    const stats = (profile.stats || []).map((s) => s.split("|").map((x) => x.trim())).filter((s) => s[0]);
    mount("hero",
      el("div", { class: "container" },
        el("div", { class: "hero-grid" },
          el("div", {},
            profile.role && el("span", { class: "hero-role" }, profile.role),
            el("h1", {}, "Hey, I'm ", el("span", {}, firstName), "."),
            el("p", { class: "hero-lead" }, profile.headline),
            el("div", { class: "hero-actions" },
              cvButton(profile, "btn btn-primary"),
              el("a", { class: "btn btn-ghost", href: "#contact" }, icon("envelope"), " Get in touch")),
            socialLinks(profile)),
          el("div", { class: "hero-photo" },
            el("img", { src: "/assets/img/profile-img.jpg", alt: profile.name, width: "360", height: "360" }))),
        stats.length ? el("div", { class: "stats" },
          stats.map(([value, label]) => el("div", { class: "card stat reveal" }, el("strong", {}, value), el("span", {}, label)))) : null));

    // About
    const paragraphs = String(profile.about || "").split(/\n\s*\n/).filter(Boolean);
    mount("about",
      el("div", { class: "container" },
        sectionHead("About", "Software for people and the planet"),
        el("div", { class: "about-grid" },
          el("div", { class: "about-text reveal" }, paragraphs.map((p) => el("p", {}, p))),
          el("div", { class: "side-stack" },
            profile.interests && profile.interests.length && el("div", { class: "card side-card reveal" },
              el("h3", {}, "Focus areas"),
              el("ul", { class: "chips" }, profile.interests.map((i) => el("li", { class: "chip chip-accent" }, i)))),
            data.education.length && el("div", { class: "card side-card reveal" },
              el("h3", {}, "Education"),
              data.education.map((e) => el("div", { class: "edu" },
                el("h4", {}, e.degree),
                el("p", {}, [e.institution, e.period].filter(Boolean).join(" · "))))),
            profile.achievements && profile.achievements.length && el("div", { class: "card side-card reveal" },
              el("h3", {}, "Achievements"),
              el("ul", { class: "ticks" }, profile.achievements.map((a) => el("li", {}, a))))))));

    // Skills
    mount("skills",
      el("div", { class: "container" },
        sectionHead("Toolbox", "Technologies I use"),
        el("div", { class: "skills" },
          data.skills.map((s) => el("div", { class: "card skill reveal" },
            el("img", { src: s.icon, alt: "", loading: "lazy", width: "44", height: "44" }),
            el("span", {}, s.name))))));

    renderExperience(data.experience);

    // Featured projects
    const featured = data.projects.filter((p) => p.featured);
    const shown = (featured.length ? featured : data.projects).slice(0, 3);
    mount("projects",
      el("div", { class: "container" },
        sectionHead("Projects", "Selected work", null,
          el("a", { class: "link-arrow", href: "/projects" }, `All ${data.projects.length} projects `, icon("arrow-right"))),
        el("div", { class: "projects-grid" }, shown.map(projectCard))));

    // Writing
    const posts = [...data.blogs].sort(byDateDesc);
    mount("writing",
      el("div", { class: "container" },
        sectionHead("Writing", "Blog & articles", "Things I've written about web systems, security and advocacy.",
          profile.medium && el("a", { class: "link-arrow", href: profile.medium, ...external(profile.medium) }, "More on Medium ", icon("arrow-right"))),
        posts.length
          ? el("div", { class: "posts" }, posts.map((b) =>
              el("a", { class: "card post reveal", href: b.url, ...external(b.url) },
                el("div", {},
                  el("div", { class: "post-meta" }, [b.platform, formatDate(b.date, true)].filter(Boolean).join(" · ")),
                  el("h3", {}, b.title),
                  b.summary && el("p", {}, b.summary)),
                icon("arrow-up-right"))))
          : el("p", { class: "empty" }, "Articles are coming soon.")));

    // Donations teaser
    const donations = [...data.donations].sort(byDateDesc);
    mount("giving",
      el("div", { class: "container" },
        el("div", { class: "card giving-teaser reveal" },
          el("div", {},
            el("span", { class: "eyebrow" }, "Giving back"),
            el("h2", {}, "Donations"),
            el("p", {}, profile.donationsIntro),
            donations.length ? el("div", { class: "mini-stats" },
              donationStats(donations).slice(0, 2).map(([n, label]) => el("div", {}, el("strong", {}, n), el("span", {}, label)))) : null,
            el("a", { class: "btn btn-ghost", href: "/donations" }, "See all donations ", icon("arrow-right"))),
          donations.length
            ? el("ul", { class: "donation-list" }, donations.slice(0, 3).map(donationRow))
            : el("p", { class: "empty" }, "Donation records are coming soon."))));

    // Participations
    mount("participations",
      el("div", { class: "container" },
        sectionHead("Community", "Conferences, fellowships & events"),
        el("ul", { class: "events" }, data.participations.map((e) =>
          el("li", { class: "event" },
            el("div", {}, el("strong", {}, e.title), e.organizer && el("small", {}, e.organizer)),
            el("span", { class: "year" }, e.year))))));

    // Contact details (the form itself is static HTML)
    mount("contact-info",
      el("h3", {}, "Let's talk"),
      el("p", {}, "Open to research, security and web systems work. Send a message and I'll get back to you."),
      el("ul", {},
        profile.email && el("li", {}, icon("envelope"), el("div", {}, el("small", {}, "Email"), el("a", { href: `mailto:${profile.email}` }, profile.email))),
        profile.phone && el("li", {}, icon("telephone"), el("div", {}, el("small", {}, "Phone"), el("a", { href: `tel:${profile.phone.replace(/\s+/g, "")}` }, profile.phone))),
        profile.location && el("li", {}, icon("geo-alt"), el("div", {}, el("small", {}, "Location"), el("span", {}, profile.location)))));
  }

  function donationRow(d) {
    return el("li", { class: "donation-row" },
      el("span", { class: "donation-icon" }, icon("heart-fill")),
      el("div", {}, el("strong", {}, d.organization), el("small", {}, [d.cause, formatDate(d.date)].filter(Boolean).join(" · "))),
      d.amount ? el("span", { class: "donation-amount" }, d.amount) : el("span"));
  }

  function renderExperience(experience) {
    const groups = [
      { key: "professional", label: "Professional" },
      { key: "community", label: "Community & volunteering" },
    ].map((g) => ({ ...g, items: experience.filter((e) => e.type === g.key) }));

    const tabs = el("div", { class: "tabs", role: "tablist", "aria-label": "Experience type" });
    const panels = groups.map((g, i) => {
      const tab = el("button", {
        class: "tab", role: "tab", id: `tab-${g.key}`, "aria-controls": `panel-${g.key}`,
        "aria-selected": String(i === 0), tabindex: i === 0 ? "0" : "-1",
      }, g.label, el("span", { class: "count" }, g.items.length));
      tabs.append(tab);

      return el("ol", {
        class: "timeline", role: "tabpanel", id: `panel-${g.key}`, "aria-labelledby": `tab-${g.key}`, hidden: i !== 0,
      }, g.items.length ? g.items.map((e, j) => experienceItem(e, j === 0)) : el("li", { class: "empty" }, "Nothing here yet."));
    });

    const select = (index) => {
      [...tabs.children].forEach((t, i) => {
        t.setAttribute("aria-selected", String(i === index));
        t.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      tabs.children[index].focus();
      revealAll(panels[index]);
    };
    [...tabs.children].forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      t.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          select((i + (e.key === "ArrowRight" ? 1 : -1) + groups.length) % groups.length);
        }
      });
    });

    mount("experience",
      el("div", { class: "container" },
        sectionHead("Experience", "Where I've worked", "Tap a role to see what I did there.", tabs),
        panels));
  }

  function experienceItem(e, open) {
    return el("li", {},
      el("details", { class: "card exp reveal", open: open || null },
        el("summary", {},
          el("span", { class: "exp-period" }, e.period),
          el("div", {},
            el("h3", { class: "exp-role" }, e.role),
            el("div", {},
              e.url ? el("a", { class: "exp-org", href: e.url, ...external(e.url) }, e.organization) : el("span", { class: "exp-org" }, e.organization),
              e.location && el("span", { class: "exp-loc" }, ` · ${e.location}`)),
            e.summary && el("p", { class: "exp-summary" }, e.summary)),
          e.highlights && e.highlights.length ? el("span", { class: "exp-toggle", "aria-hidden": "true" }, icon("plus-lg")) : el("span")),
        e.highlights && e.highlights.length
          ? el("div", { class: "exp-body" }, el("ul", {}, e.highlights.map((h) => el("li", {}, h))))
          : null));
  }

  /* ---------- projects page ---------- */

  function renderProjects(data) {
    const projects = data.projects;
    const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];
    let active = "";
    let query = "";

    const grid = el("div", { class: "projects-grid" });
    const count = el("p", { class: "section-sub", "aria-live": "polite" });

    const update = () => {
      const q = query.toLowerCase();
      const matches = projects.filter((p) =>
        (!active || p.category === active) &&
        (!q || [p.title, p.summary, p.category, ...(p.tags || []), ...(p.highlights || [])].join(" ").toLowerCase().includes(q)));
      grid.replaceChildren(...(matches.length ? matches.map(projectCard) : [el("p", { class: "empty" }, "No projects match your search.")]));
      count.textContent = `Showing ${matches.length} of ${projects.length} projects`;
      revealAll(grid);
    };

    const filters = el("div", { class: "filters" },
      ["", ...categories].map((c) => el("button", {
        class: "filter", type: "button", "aria-pressed": String(c === ""),
        onclick: (e) => {
          active = c;
          filters.querySelectorAll(".filter").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
          update();
        },
      }, c || "All")));

    mount("page",
      el("section", { class: "page-hero" },
        el("div", { class: "container" },
          el("span", { class: "eyebrow" }, "Projects"),
          el("h1", {}, "Everything I've built"),
          el("p", {}, "Client websites, security work, research and open-source tools."))),
      el("section", {},
        el("div", { class: "container" },
          el("div", { class: "toolbar" },
            el("label", { class: "search" },
              icon("search"),
              el("span", { class: "visually-hidden" }, "Search projects"),
              el("input", { type: "search", placeholder: "Search projects or tech…", oninput: (e) => { query = e.target.value.trim(); update(); } })),
            filters),
          count,
          grid)));
    update();
  }

  /* ---------- donations page ---------- */

  function renderDonations(data) {
    const donations = [...data.donations].sort(byDateDesc);
    const years = new Map();
    for (const d of donations) {
      const y = (d.date || "").slice(0, 4) || "Other";
      if (!years.has(y)) years.set(y, []);
      years.get(y).push(d);
    }

    mount("page",
      el("section", { class: "page-hero" },
        el("div", { class: "container" },
          el("span", { class: "eyebrow" }, "Giving back"),
          el("h1", {}, "Donations"),
          el("p", {}, data.profile.donationsIntro),
          donations.length ? el("div", { class: "mini-stats" },
            donationStats(donations).map(([n, label]) => el("div", {}, el("strong", {}, n), el("span", {}, label)))) : null)),
      el("section", {},
        el("div", { class: "container" },
          donations.length
            ? [...years].map(([year, items]) => el("div", { class: "year-group" },
                el("h2", {}, year),
                el("div", { class: "donation-cards" }, items.map((d) =>
                  el("article", { class: "card donation-card reveal" },
                    el("span", { class: "donation-icon" }, icon("heart-fill")),
                    el("div", {},
                      el("h3", {}, d.url ? el("a", { href: d.url, ...external(d.url) }, d.organization) : d.organization),
                      el("div", { class: "meta" },
                        d.cause && el("span", {}, d.cause),
                        el("span", {}, formatDate(d.date, true))),
                      d.note && el("p", {}, d.note)),
                    d.amount ? el("span", { class: "donation-amount" }, d.amount) : null)))))
            : el("p", { class: "empty" }, "Donation records are coming soon."))));
  }

  /* ---------- printable CV page ---------- */

  function renderCv(data) {
    const { profile } = data;
    const cvSection = (title, ...body) => el("section", { class: "cv-section" }, el("h2", {}, title), body);
    const cvItem = (title, sub, right, text, list) => el("div", { class: "cv-item" },
      el("div", { class: "cv-item-head" },
        el("div", {}, el("strong", {}, title), sub && ` — ${sub}`),
        right && el("span", {}, right)),
      text && el("p", {}, text),
      list && list.length ? el("ul", {}, list.map((x) => el("li", {}, x))) : null);
    const work = (type) => data.experience.filter((e) => e.type === type)
      .map((e) => cvItem(e.role, e.organization, e.period, e.summary, (e.highlights || []).slice(0, 2)));
    const links = SOCIALS.filter(([k]) => ["linkedin", "github", "medium"].includes(k) && profile[k]);

    mount("page",
      el("section", { class: "page-hero no-print" },
        el("div", { class: "container" },
          el("span", { class: "eyebrow" }, "Curriculum vitae"),
          el("h1", {}, "CV"),
          el("p", {}, "A short, printable summary of my experience. Print it, save it as PDF, or download my full CV."),
          el("div", { class: "cv-actions" },
            cvButton(profile, "btn btn-primary"),
            el("button", { class: "btn btn-ghost", type: "button", onclick: () => window.print() }, icon("printer"), " Print / Save as PDF")))),
      el("div", { class: "container" },
        el("article", { class: "card cv" },
          el("header", { class: "cv-head" },
            el("div", {}, el("h1", {}, profile.name), el("div", { class: "role" }, profile.role)),
            el("div", { class: "cv-contact" },
              profile.email && el("a", { href: `mailto:${profile.email}` }, profile.email),
              profile.phone && el("span", {}, profile.phone),
              profile.location && el("span", {}, profile.location),
              links.length ? el("span", {}, links.map(([k, label], i) => [i ? " · " : "", el("a", { href: profile[k] }, label)])) : null)),
          cvSection("Profile", el("p", {}, profile.headline)),
          cvSection("Professional experience", work("professional")),
          cvSection("Community & volunteering", work("community")),
          cvSection("Selected projects", data.projects.filter((p) => p.featured)
            .map((p) => cvItem(p.title, (p.tags || []).slice(0, 3).join(", "), p.year, p.summary))),
          el("div", { class: "cv-two" },
            cvSection("Education", data.education.map((e) => cvItem(e.degree, null, e.period, e.institution))),
            cvSection("Skills", el("p", {}, data.skills.map((s) => s.name).join(" · ")))),
          profile.achievements && profile.achievements.length
            ? cvSection("Achievements", el("ul", {}, profile.achievements.map((a) => el("li", {}, a))))
            : null)));
  }

  /* ---------- reveal on scroll ---------- */

  let observer;
  function revealAll(root) {
    const items = (root || document).querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) return items.forEach((n) => n.classList.add("in"));
    observer = observer || new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: "0px 0px -40px 0px" });
    items.forEach((n) => observer.observe(n));
  }

  /* ---------- boot ---------- */

  const pages = { home: renderHome, projects: renderProjects, donations: renderDonations, cv: renderCv };

  async function boot() {
    const page = document.body.dataset.page;
    try {
      const res = await fetch("/api/content");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderHeader(data.profile, page);
      renderFooter(data.profile);
      if (pages[page]) pages[page](data);
      revealAll();
      // Content loads after the page, so jump to #section links once it exists.
      if (location.hash) {
        const target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView();
      }
    } catch (err) {
      console.error("Could not load content:", err);
      mount(page === "home" ? "hero" : "page",
        el("div", { class: "container" }, el("p", { class: "empty" }, "Sorry, the content could not be loaded. Please refresh the page.")));
    }
  }

  boot();
})();
