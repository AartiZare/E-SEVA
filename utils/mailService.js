import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const mailService = async (email, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: email,
      subject,
      text,
      html,
    });

    return 'sent successfully';
  } catch (err) {
    console.log('USER', process.env.USER_EMAIL);
    console.log('PASS', process.env.USER_PASS);
    console.error(err);
    return 'sent unsuccessful';
  }
};

export default mailService;