import { Resend } from 'resend';

import { render } from "@react-email/render";
import { PasswordResetEmail } from '../../emails/PasswordResetEmail.js';
// import verificationEmail from '../../emails/verificationEmail.ts';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmailTemplate(to, username, resetToken) {
    try {
        console.log("Sending password reset email to:", to);
        const appName = process.env.APP_NAME || "YourApp";
        const appUrl = process.env.FRONTEND_URL || "https://yourapp.com";
        const expiresInHours = Number(process.env.RESET_TOKEN_EXPIRY_HOURS) || 2;
        const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

        const html = await render(PasswordResetEmail({ username, resetLink, expiresInHours, appName }));

        const { data, error } = await resend.emails.send({
            from: `${appName}  <onboarding@resend.dev>`,
            to,
            subject: `${appName} Password Assistance`,
            html,
        });

        if (error) {
            console.error("Resend API error:", error);
            console.log(typeof to, to);
            throw new Error("Failed to send email", 500);
        }

        return { data };
    } catch (err) {
        console.error("Error sending email:", err);
        throw new Error("Failed to send email", 500);
    }

}