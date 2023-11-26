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
  const url = `${process.env.URL}/api/auth/confirm-email/${email_confirmation_code}`;
  let sendResult = await transporter.sendMail({
    from: "MacroQuiet <noreply@macroquiet.com>",
    to: email,
    subject: "Please confirm your MacroQuiet account.",
    html: `
      <div style="font-family: Poppins, sans-serif; padding: 10px; text-align: center;">
        <img src="https://macroquiet.com/assets/macroquiet_logo_icon-63f24a7c.png" alt="MacroQuiet Logo" style="display: block; margin: 0 auto;" width="100" height="100">
        <h2 style="color: #333;">Hello there ${username}</h2>
        <p style="color: #666;">We are so excited you've decided to join our community!</p>
        <p style="color: #666;">Please confirm your email by clicking <a href="${url}" style="color: #337ab7; text-decoration: none;">here</a>.</p> 
      </div>
    `,
  });
}

async function sendPasswordResetEmail(username, email, password_reset_code) {
  const url = `${process.env.URL}/api/auth/reset-password/${password_reset_code}`;
  let sendResult = await transporter.sendMail({
    from: "MacroQuiet <noreply@macroquiet.com>",
    to: email,
    subject: "Password reset for your MacroQuiet account.",
    html: `
    <div style="font-family: Poppins, sans-serif; padding: 10px; text-align: center;">
      <img src="https://macroquiet.com/assets/macroquiet_logo_icon-63f24a7c.png" alt="MacroQuiet Logo" style="display: block; margin: 0 auto;" width="100" height="100">
      <h2 style="color: #333;">Hi ${username},</h2>
      <p style="color: #666;">Looks like a request was made to reset the password for your MacroQuiet account.</p>
      <p style="color: #666;">No problem!, You can reset your password now by clicking on the button below.</p>
      
      <a href="${url}" 
         style="background-color: #ae3b3b; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block; margin: 20px 0;">
         Reset Password
      </a>
      
      <p style="color: #666;">If you didn't want to reset your password, you can safely ignore this email and carry on! If you need help logging in to your MacroQuiet account, don't hesitate to <a href="https://macroquiet.com/contact-us" target="_blank">contact us</a>.</p>
    </div>
  `,
  });
}

export default {
  generateToken,
  sendConfirmationEmail,
  sendPasswordResetEmail,
};
