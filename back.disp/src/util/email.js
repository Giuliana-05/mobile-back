const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendResetEmail(to, token) {
  const resetLink = `https://your-app/reset-password?token=${token}`;
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Redefinição de senha",
    text: `Use este link para redefinir sua senha: ${resetLink}`,
    html: `<p>Use este link para redefinir sua senha: <a href="${resetLink}">${resetLink}</a></p>`
  });
  return info;
}

module.exports = { sendResetEmail };
