import nodemailer from 'nodemailer';
import config from '../config/config.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: config.GOOGLE_USER,
        clientId: config.CLIENT_ID,
        clientSecret: config.CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN
    }
});

transporter.verify((error, success) =>{
    if(error){
        console.log('Error connecting to email service:', error);
    }else{
        console.log('Email service is ready to send messages');
    }
});


const sendEmail = async(to,subject,text,html)=>{
    try {
  const info = await transporter.sendMail({
    from: `"Campus In" <${config.GOOGLE_USER}>`, // sender address
    to, // list of recipients
    subject, // subject line
    text, // plain text body
    html// HTML body
  });

  console.log("Message sent: %s", info.messageId);
  // Preview URL is only available when using an Ethereal test account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
} catch (err) {
  console.error("Error while sending mail:", err);
}
}

export { transporter, sendEmail };