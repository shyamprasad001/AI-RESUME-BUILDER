import nodemailer from 'nodemailer';
import dns from 'dns/promises';

const sendEmail = async (options) => {
  try {
    // If SMTP credentials aren't set, just log the OTP for development purposes
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[DEV MODE] Skipping actual email send. Email content to ${options.email}:`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message: ${options.message}`);
      return;
    }

    let hostIp = process.env.SMTP_HOST;
    try {
      // Manually force IPv4 resolution to bypass Render/Node IPv6 bugs
      const ips = await dns.resolve4(process.env.SMTP_HOST);
      if (ips && ips.length > 0) {
        hostIp = ips[0];
      }
    } catch (dnsError) {
      console.warn(`Could not resolve IPv4 for ${process.env.SMTP_HOST}, falling back to default.`, dnsError);
    }

    const transporter = nodemailer.createTransport({
      host: hostIp,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // Must provide servername when connecting directly to an IP address
        servername: process.env.SMTP_HOST,
      }
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
