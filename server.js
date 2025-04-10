const express = require('express');
const axios = require('axios');
const Path = require('path'); 
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();
const cors = require ('cors');


//Serve static files from the public directory
app.use(express.static(Path.join(__dirname, 'public')));

//Midedleware to parse form data
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

// Serve static to handle form submission
app.use(express.static('public'));

//POSt route to handle submission with reCAPTCHA
app.post('/submit-form', (req, res) =>{
    const { name, email, subject, message, 'g-recaptcha-response': recaptchaToken } = req.body;

    // 1. Verify reCAPTCHA token first
    if (!recaptchaToken){
        return res.status(400).json({
            success: false,
            message: 'Please complete the recaptcha Verification'
        });
    }
    try{
        //Verify reCAPTCHA with Google 
        const recaptchaResponse = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            new URLSearchParams({
                secret: process.env.ReCAPTCHA_SECRET_KEY,
                response: recaptchaToken
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

         //Check if reCAPTCHA verification fails
         if(!recaptchaResponse.data.success) {
            console.log('reCAPTCHA verification failed:', recaptchaResponse.data);
            return res.status(400).json({
                sucess:false,
                message: 'reCAPTCHA verification failed',
                errors: recaptchaResponse.data['error-codes']

            });
         }

             // Only proceed with email sending if recaptcha is valid
             //Create a Nodemailer transporter using Gmail
              const transporter = nodemailer.createTransport({
                service: 'Gmail',
                host: "smtp.gmail.com",
                port: 465,
                secure: false,
                auth:{
                user: process.env.EMAIL_USER, //Gmail user
                pass: process.env.EMAIL_PASS  // Gmail API pass
        }
    });

    transporter.verify(function(error, success){
        if (error){
        } else{
            console.log("Server is ready to take our messages");
        }
    });

    //Email options
    const mailoptions = {
        from: process.env.EMAIL_USER,
        to: process.env.YOUR_EMAIL,
        subject: `New message from${name}`,
        text: `Username: ${name} \n Email: ${email} \n Subject: ${subject} \n Message: ${message}`
    };

    //Send email
    transporter.sendMail(mailoptions, (error, info) => {
        if (error){
            console.error('Error sending email:', error);
           return res.status(500).json({success: false, message: 'Error sending email' });
        } else{
            console.log('Email sent:', info.response);
           return res.status(200).json({success:true, message: 'Email sent successfully'});
        }

    });

}catch (error) {
    console.error('Error in form submission:', error);
    return res.status(200).json({
        success: true,
        message: 'Email sent successfully'
    });
}

});


//start the server
app.listen(port, () => {
 console.log('Server is running on port ${port}');
});