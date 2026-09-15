const nodemailer = require("nodemailer");

let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendEmail(to, subject, html, text = "") {
  try {
    if (!transporter) {
      console.warn(`[EMAIL SERVICE] No email credentials configured. Email to ${to} skipped.`);
      return { success: false, message: "No email transporter configured" };
    }

    const info = await transporter.sendMail({
      from: `"PhysioProgress" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });

    console.log("[EMAIL SENT]: %s to %s", info.messageId, to);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed sending to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = sendEmail;