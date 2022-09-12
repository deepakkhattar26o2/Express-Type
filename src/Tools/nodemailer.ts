require('dotenv').config();
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASSWORD,
    },
  })
);

const sendMail = (to : string, subject : string, bodyText : string) =>{
    var mailOptions = {
        from: "collegeconnection2cu@gmail.com",
        to: to,
        subject: subject,
        text: bodyText,
    };
    return new Promise((resolve, reject)=>{
        transporter.sendMail(mailOptions, function (error: Error, info : {}) {
            if (error) {
                reject(error)
            } else {
              resolve(info)
            }
    })
  });
}

export {sendMail}