import { Resend } from 'resend';

/**
 * Send a verification code through Resend's HTTPS API.
 *
 * Required environment variables:
 *   RESEND_API_KEY=re_replace_me
 *   EMAIL_FROM=Limetta <noreply@example.com>
 *
 * Production delivery requires EMAIL_FROM to use a domain verified in Resend.
 */
export const sendOTPEmail = async (email, otp) => {
  const { RESEND_API_KEY, EMAIL_FROM } = process.env;

  if (!RESEND_API_KEY || !EMAIL_FROM) {
    console.error('[Email Service] Email provider is not configured.');
    return false;
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Your Limetta verification code',
      text: `Your verification code is: ${otp}. It is valid for 5 minutes. If you did not request this, you can ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #111; font-family: Garamond, serif;">Limetta Luxury Interiors</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #b8860b;">${otp}</p>
          <p style="color: #666; font-size: 13px;">This code expires in 5 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `
    });

    if (error || !data?.id) {
      console.error('[Email Service] Email provider rejected the request.');
      return false;
    }

    return true;
  } catch {
    console.error('[Email Service] Email provider request failed.');
    return false;
  }
};
