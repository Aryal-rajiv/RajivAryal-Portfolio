const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const Path = require("path"); // Importing path module to handle file paths
const verifycaptcha = require("./middleware/recaptchmiddleware");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const content = require("./lib/content");
const { router: adminRouter, isProduction } = require("./lib/admin");


const port = process.env.PORT || 3000;
const app = express();

app.disable("x-powered-by");
//On Vercel, requests come through its proxy; trust it so req.ip is the visitor's IP
if (process.env.VERCEL) app.set("trust proxy", 1);

//Midedleware to parse form data
app.use(bodyParser.json({ limit: "200kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "200kb" }));

//Security headers
const csp = [
  "default-src 'self'",
  "script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
  "frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", csp);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  if (isProduction()) res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  next();
});

//The CMS page doesn't exist online
app.use((req, res, next) => {
  if (!/^\/admin(\.html)?\/?$/i.test(req.path)) return next();
  if (isProduction()) return res.status(404).sendFile(Path.join(__dirname, "public", "404.html"));
  res.setHeader("Cache-Control", "no-store");
  next();
});

//Serve static files from the public directory (/projects -> projects.html, etc.)
app.use(express.static(Path.join(__dirname, 'public'), { extensions: ["html"] }));

//Public site content, managed through the CMS at /admin
app.get("/api/content", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(content.readAll());
});

//CMS API
app.use("/api/admin", adminRouter);



//Max 5 messages per visitor every 15 minutes
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { success: false, message: "Too many messages. Please try again later." },
});

//Field length limits
const LIMITS = { name: 100, email: 254, subject: 200, message: 5000 };

//POSt route to handle submission with reCAPTCHA
app.post("/submit-form", formLimiter, verifycaptcha, async(req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // validate form data
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All field are required" });
    }

    for (const [field, max] of Object.entries(LIMITS)) {
      if (typeof req.body[field] !== "string" || req.body[field].length > max) {
        return res.status(400).json({ message: `${field} is too long (max ${max} characters)` });
      }
    }

    //Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    //Create a Nodemailer transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, //Gmail user
        pass: process.env.EMAIL_PASS, // Gmail API pass
      },
    });

    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });

    //Email options
    const mailoptions = {
      from: process.env.EMAIL_USER,
      to: process.env.YOUR_EMAIL,
      replyTo: email,
      subject: `New message from ${name.replace(/[\r\n]+/g, " ")}`,
      text: `Username: ${name} \n Email: ${email} \n Subject: ${subject} \n Message: ${message}`,
    };

    //Send email
    transporter.sendMail(mailoptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ success: false, message: "Error sending email" });
      } else {
        console.log("Email sent:", info.response);
        return res
          .status(200)
          .json({ success: true, message: "Email sent successfully" });
      }
    });
  } catch (error) {
    console.error("Error in form submission:", error);
    return res.status(500).json({
      success: false,
      message: "Error in form submission",
    });
  }
});

//Unknown pages
app.use((req, res) => {
  res.status(404).sendFile(Path.join(__dirname, "public", "404.html"));
});

//start the server when run directly (Vercel imports the app instead)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  }).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the other server (or change PORT in .env) and try again.`);
      process.exit(1);
    }
    throw err;
  });
}

module.exports = app;
