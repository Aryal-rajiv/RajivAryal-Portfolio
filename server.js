const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const verifycaptcha = require("./middleware/recaptchmiddleware");
require("dotenv").config();

const port = process.env.PORT;
const app = express();
const cors = require("cors");

//Midedleware to parse form data
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//POSt route to handle submission with reCAPTCHA
app.post("/submit-form", verifycaptcha, async(req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // validate form data
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All field are required" });
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
      subject: `New message from${name}`,
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
    return res.status(200).json({
      success: true,
      message: "Error in form submission",
    });
  }
});

//start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});