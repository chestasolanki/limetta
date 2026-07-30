import nodemailer from 'nodemailer';

/**
 * Email utility to send OTP codes using Gmail SMTP via Nodemailer.
 *
 * Setup required in .env:
 *   EMAIL_USER=youraddress@gmail.com
 *   EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   (Google App Password, NOT your login password)
 *
 * Generate an App Password at: https://myaccount.google.com/apppasswords
 * (requires 2-Step Verification to be enabled on the Google account)
 */

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }
  return transporter;
};

export const sendOTPEmail = async (email, otp) => {
  const { EMAIL_USER, EMAIL_APP_PASSWORD } = process.env;

  if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
    console.warn(`[Email Service WARNING] Email credentials not configured in .env.
Please set EMAIL_USER and EMAIL_APP_PASSWORD.
Generated OTP code for ${email} is: ${otp}`);
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: `"Limetta" <${EMAIL_USER}>`,
      to: email,
      subject: 'Your Limetta verification code',
      text: `Your verification code is: ${otp}. It is valid for 5 minutes. If you did not request this, you can ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #111;">Verify your email</h2>
          <p>Your Limetta verification code is:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111;">${otp}</p>
          <p style="color: #666; font-size: 13px;">This code expires in 5 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `
    });

    console.log(`[Email Service] OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('[Email Service] Failed to send OTP email:', error.message);
    return false;
  }
};