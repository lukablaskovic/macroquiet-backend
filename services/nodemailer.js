import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

import "dotenv/config";

//Set up nodemailer transporter
let transporter = nodemailer.createTransport({
  service: "SendPulse",
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_PASS,
  },
});
function generateToken(userEmail) {
  try {
    let emailToken = jwt.sign(userEmail, process.env.JWT_EMAIL_SECRET, {
      algorithm: "HS512",
    });
    return emailToken;
  } catch (e) {
    throw new Error("Server error!");
  }
}
async function sendConfirmationEmail(username, email, email_confirmation_code) {
  const url = `${process.env.URL}/api/auth/confirm/${email_confirmation_code}`;
  let sendResult = await transporter.sendMail({
    from: "MacroQuiet <noreply@macroquiet.com>",
    to: email,
    subject: "Please confirm your MacroQuiet account.",
    html: `
      <div style="font-family: Poppins, sans-serif; padding: 10px; text-align: center;">
        <img src="https://pbs.twimg.com/profile_images/1524690480256147457/1JQedO6I_400x400.png" alt="MacroQuiet Logo" style="display: block; margin: 0 auto;" width="100" height="100">
        <h2 style="color: #333;">Hello there ${username}</h2>
        <p style="color: #666;">We are so excited you've decided to join our community!</p>
        <p style="color: #666;">Please confirm your email by clicking <a href="${url}" style="color: #337ab7; text-decoration: none;">here</a>.</p> 
      </div>
    `,
  });
}
export default { generateToken, sendConfirmationEmail };
