# RajivAryal-Portfolio
It's a portfolio website. The sole purpose of this site is to show my information
index.html consists of all the HTML code that builds my single-page application
server.js for backend code backend code which handles form submission
Noide mailer for SMTP mail sending protocol
Recaptcha middleware to handle recaptcha

🧰 Tech Stack
- Frontend: HTML5, CSS3
- Backend: Node.js, Express.js
- Email Service: Nodemailer
- Bot Protection: Google reCAPTCHA v2
- Environment Config: dotenv

🔐 Environment Variable
PORT= Desirable port 
EMAIL_USER=your@email.com
EMAIL_PASS=yourEmailPassword
EMAIL_RECEIVER=your@email.com
RECAPTCHA_SECRET=yourGoogleRecaptchaSecretKey

📬 Contact Form Workflow
- Visitor fills out the contact form on the site.
- Google reCAPTCHA verifies the user is human.
- Form data is sent to the Express server via POST.
- Server validates the reCAPTCHA token with Google’s API.
- If valid, Nodemailer sends the email to my inbox.
- User receives a success or error message.


### 📌 Features

- Responsive design for desktop and mobile
- Clean, semantic HTML structure
- Styled with modular CSS
- Secure email handling with environment variables
- Easy to deploy and customize
