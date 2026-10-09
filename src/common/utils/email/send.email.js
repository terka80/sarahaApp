import { APP_EMAIL, APP_PASSWORD, APPLICATION_NAME } from "../../../config.js";

import nodemailer  from "nodemailer";
import { BadException } from "../../exceptions/error.exception.js";



export const userEmailKey= ({email, subject})=>{
  return  `User::${email}::${subject}::OTP`
}

export const userEmailTrailsKey= ({email, subject})=>{
  return  `${userEmailKey({email, subject})}::Trails`
}

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service:'gmail',
  auth: {
    user: APP_EMAIL,
    pass: APP_PASSWORD,
  },
});





export const sendEmail= async ({
    to, // list of recipients
    subject, // subject line
    cc,
    bcc,
    text, // plain text body
    html, // HTML body
    attachments=[]
})=>{


    try {
        if (!to?.length && !bcc?.length&& !cc?.length) {
            throw BadException(' missing  email recipients')
        }
        if (!html?.length && !text?.length&& !attachments?.length) {
            throw BadException(' missing  email content')
        }
  const info = await transporter.sendMail({
    from:` '${APPLICATION_NAME} <${APP_EMAIL}>'`, // sender address
    to, // list of recipients
    subject, // subject line
    cc,
    bcc,
    text, // plain text body
    html, // HTML body
    attachments
  });


  console.log("Message sent: %s", info.messageId);
  // Preview URL is only available when using an Ethereal test account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
} catch (err) {
  console.error("Error while sending mail:", err);
}

}