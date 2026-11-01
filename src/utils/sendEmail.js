import { Resend } from 'resend';
import { PasswordResetEmail } from '../../emails/PasswordResetEmail.js';
import logger from './logger.js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmailTemplate(to, username, resetToken) {
  try {
    if (!resend) {
      logger.warn("RESEND_API_KEY not set. Skipping password reset email.");
      return;
    }
    logger.info(`Sending password reset email to: ${to}`);
    const appName = process.env.APP_NAME || "RootSpace";
    const appUrl = process.env.FRONTEND_URL || "https://yourapp.com";
    const expiresInHours = Number(process.env.RESET_TOKEN_EXPIRY_HOURS) || 2;
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

    const html = PasswordResetEmail({ username, resetLink, expiresInHours, appName, baseUrl: appUrl });

    const { data, error } = await resend.emails.send({
      from: `${appName} <onboarding@resend.dev>`,
      to,
      subject: `${appName} Password Assistance`,
      html,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error("Failed to send email");
    }

    return { data };
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send email");
  }
}
