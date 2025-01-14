const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();
const port = process.env.PORT || 3000;
const app = express();

//Midedleware to parse form data
app.use(bodyParser.urlencoded({ extended: true}));

// Serve static to handle form submission
app.use(express.static('public'));

//POSt route to handle submission
app.post('/submit-form', (req, res) =>{
    const {name, email, subject, message} = req.body;
})

//Create a Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.GMAIL_USER, //Gmail user
        pass: process.env.GMAIL_PASS  // Gmail API pass
    }
});

//Email options
const mailoptions = {
    from: process.env.GMAIL_USER,
    to: process.env.YOUR_EMAIL,
    subject: 'New message from${name}',
    text: message
};

//Send email
transporter.sendMail(mailoptions, (error, info)) => {
    if (error){
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    } else{
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent successfully');
    }

}

//start the server
app.listen(port, () => {
 console.log('Server is running on port ${port}');
});