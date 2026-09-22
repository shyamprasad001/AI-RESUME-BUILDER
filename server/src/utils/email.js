import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // If SMTP credentials aren't set, just log the OTP for development purposes
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[DEV MODE] Skipping actual email send. Email content to ${options.email}:`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message: ${options.message}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      family: 4, // Force IPv4 to fix ENETUNREACH on Render/cloud hosts
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@atsresumebuilder.com',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email could not be sent:', error);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;
