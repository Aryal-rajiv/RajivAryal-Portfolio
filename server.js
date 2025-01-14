const express = require('express');

const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const cors = require ('cors');


//Midedleware to parse form data
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true}));

// Serve static to handle form submission
app.use(express.static('public'));

//POSt route to handle submission
app.post('/submit-form', (req, res) =>{
    const { name, email, subject, message } = req.body;


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
    })

    //Email options
    const mailoptions = {
        from: process.env.EMAIL_USER,
        to: process.env.YOUR_EMAIL,
        subject: 'New message from${name}',
        text: `The uername is ${name} email is ${email} & subject is ${subject} and the message is ${message}`
    };

    //Send email
    transporter.sendMail(mailoptions, (error, info) => {
        if (error){
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        } else{
            console.log('Email sent:', info.response);
            res.status(200).send('Email sent successfully');
        }

    });
});

//start the server
app.listen(port, () => {
 console.log('Server is running on port ${port}');
});