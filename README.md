# Rajiv Aryal: Portfolio & Research Journal

Personal website at [aryalrajiv.com.np](https://aryalrajiv.com.np): CV, projects, and a research journal for surveys, studies and technical writing.

## Stack

- **Frontend:** Next.js 16 (App Router, React Server Components), deployed on Vercel
- **CMS:** Headless WordPress. Posts are written in WordPress and read through the REST API.
- **Contact form:** Next.js route handler + Nodemailer (Gmail SMTP) + reCAPTCHA v2 + honeypot
- **No UI framework:** one hand-written CSS file, inline SVG icons, self-hosted fonts via `next/font`

## How publishing works

1. Write a post in WordPress and give it a category: `Research`, `Survey` or `Blog`. Posts in research/survey categories are marked up as `ScholarlyArticle` for Google Scholar.
2. Add an excerpt (used as the abstract and meta description), a featured image, and tags.
3. Publish. The `wordpress/headless-revalidate.php` mu-plugin pings `/api/revalidate` and the post is live on the site within seconds. Pages also refresh hourly on their own.

Use H2/H3 headings in long posts: three or more produce an automatic "On this page" table of contents.

## Editing CV content

All profile, experience, project and skills content lives in [`src/lib/site.ts`](src/lib/site.ts). Edit it and push.

## SEO / AI search (AIO)

- Static pre-rendering with ISR; per-page metadata, canonical URLs, Open Graph and Twitter cards
- JSON-LD: `Person`, `WebSite`, `ScholarlyArticle`/`BlogPosting`, `BreadcrumbList`, `CollectionPage`
- Google Scholar `citation_*` meta tags on every post, plus a "Cite this" block
- `/sitemap.xml`, `/robots.txt` (AI crawlers explicitly allowed), `/feed.xml` (RSS), `/llms.txt`
- Generated Open Graph image, security headers (HSTS, nosniff, frame-deny, referrer, permissions policy)

## Performance

- Server components by default. The only client JS on the page is the contact form.
- reCAPTCHA loads only when the contact form scrolls into view.
- `next/image` with AVIF/WebP, self-hosted fonts with `display: swap`, no icon fonts, no jQuery/Bootstrap.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

## Environment variables

See [`.env.example`](.env.example). Set the same keys in Vercel → Project → Settings → Environment Variables.

## WordPress setup

1. Host WordPress on any PHP host (e.g. a `cms.` subdomain).
2. Copy `wordpress/headless-revalidate.php` into `wp-content/mu-plugins/`.
3. Add `HEADLESS_FRONTEND_URL` and `HEADLESS_REVALIDATE_SECRET` to `wp-config.php` (instructions are at the top of the plugin file).
4. Settings → Permalinks → "Post name".
5. Create the categories `Research`, `Survey` and `Blog`.
