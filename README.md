# RajivAryal-Portfolio
My portfolio website. An Express server serves the pages in `public/`, sends contact-form emails, and runs a small CMS for editing the site's content.

🧰 Tech Stack
- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js, Express.js
- Email Service: Nodemailer
- Bot Protection: Google reCAPTCHA v2
- Content: JSON files in `content/`, edited through the CMS at `/admin`

## Run locally
```
npm install
npm run dev      # restarts when server files change
# or: npm start
```
Then open http://localhost:PORT (the `PORT` in `.env`, default 3000).

## Pages
- `/` home: about, skills, experience (professional and community tabs), featured projects, blog links, donations, contact
- `/projects` all projects, with search and category filters
- `/donations` donations I've made
- `/cv` printable CV built from the same content, plus the Download CV button
- `/admin` CMS

## Updating content (CMS)
1. Set `ADMIN_PASSWORD` in `.env` and start the server.
2. Open `/admin` and log in.
3. Edit the profile, experience, projects, donations, blog posts, education, participations and skills, or upload a new CV PDF.
4. Changes are saved to `content/*.json` (and `public/uploads/` for the CV). Check the site, then commit and push.

The CMS only works locally. Vercel's file system is read-only, so `/admin` is turned off in production.

🔐 Environment Variables (see `.env.example`)
```
PORT=3000
EMAIL_USER=your@gmail.com
EMAIL_PASS=yourGmailAppPassword
YOUR_EMAIL=where-messages-go@email.com
RECAPTCHA_SECRET_KEY=yourGoogleRecaptchaSecretKey
ADMIN_PASSWORD=password-for-/admin
```

📬 Contact Form Workflow
- Visitor fills out the contact form on the site.
- Google reCAPTCHA verifies the user is human.
- Form data is sent to the Express server via POST `/submit-form`.
- Server validates the reCAPTCHA token with Google's API.
- If valid, Nodemailer sends the email to my inbox.
- User receives a success or error message.
