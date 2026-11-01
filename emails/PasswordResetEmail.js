// emails/PasswordResetEmail.js
// Pure HTML email template — zero external dependencies, works directly in Node/Express.

export function PasswordResetEmail({
  username = "User",
  resetLink = "https://yourapp.com/reset-password?token=xxx",
  expiresInHours = 2,
  appName = "RootSpace",
  logoUrl = "",
  baseUrl = process.env.FRONTEND_URL || "https://yourapp.com",
} = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your ${appName} password</title>
</head>
<body style="background-color: #f4f4f5; font-family: 'Georgia', 'Times New Roman', serif; margin: 0; padding: 32px 0;">
  <div style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; max-width: 560px; margin: 0 auto; overflow: hidden;">
    <div style="background-color: #18181b; padding: 24px 40px; text-align: center;">
      ${logoUrl 
        ? `<img src="${logoUrl}" width="40" height="40" alt="${appName}" style="border-radius: 8px;" />` 
        : `<h1 style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; margin: 0;">${appName}</h1>`
      }
    </div>

    <div style="text-align: center; padding: 36px 40px 0;">
      <span style="font-size: 48px; margin: 0; line-height: 1;">🔐</span>
    </div>

    <div style="padding: 24px 40px 32px;">
      <h2 style="color: #18181b; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 16px 0 20px; text-align: center;">Password Reset Request</h2>
      <p style="color: #3f3f46; font-size: 16px; margin: 0 0 12px;">Hi ${username},</p>
      <p style="color: #52525b; font-size: 15px; line-height: 1.65; margin: 0 0 28px;">
        We received a request to reset the password for your ${appName} account. Click the button below to choose a new password.
      </p>

      <div style="text-align: center; margin: 0 0 20px;">
        <a href="${resetLink}" style="background-color: #18181b; border-radius: 6px; color: #ffffff; display: inline-block; font-size: 15px; font-weight: 600; letter-spacing: 0.02em; padding: 14px 36px; text-decoration: none;">Reset My Password</a>
      </div>

      <p style="color: #71717a; font-size: 13px; text-align: center; margin: 0 0 24px;">
        This link will expire in <strong>${expiresInHours} hours</strong>.
      </p>

      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 0 0 20px;" />

      <p style="color: #3f3f46; font-size: 13px; font-weight: 600; margin: 0 0 4px;">Button not working?</p>
      <p style="color: #71717a; font-size: 13px; margin: 0 0 8px;">Copy and paste the URL below into your browser:</p>
      <a href="${resetLink}" style="color: #2563eb; font-size: 12px; word-break: break-all; display: block; margin-bottom: 20px;">${resetLink}</a>

      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 0 0 20px;" />

      <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 14px 16px;">
        <p style="color: #71717a; font-size: 13px; line-height: 1.6; margin: 0;">
          🛡️ If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged. Never share this link with anyone.
        </p>
      </div>
    </div>

    <div style="background-color: #fafafa; border-top: 1px solid #e4e4e7; padding: 20px 40px; text-align: center;">
      <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 6px;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
        <a href="${baseUrl}/help" style="color: #71717a; text-decoration: underline;">Help Center</a> &middot;
        <a href="${baseUrl}/privacy" style="color: #71717a; text-decoration: underline;">Privacy Policy</a> &middot;
        <a href="${baseUrl}/terms" style="color: #71717a; text-decoration: underline;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export default PasswordResetEmail;
