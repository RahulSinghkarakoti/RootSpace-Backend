// PasswordResetEmail.js
// Pure React.createElement — no JSX, no Babel needed. Works in plain Node/Express.

import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const e = React.createElement;

export function PasswordResetEmail({
  username      = "User",
  resetLink     = "https://yourapp.com/reset-password?token=xxx",
  expiresInHours = 2,
  appName       = "YourApp",
  logoUrl       = "",
  baseUrl       = process.env.APP_URL || "https://yourapp.com",
}) {
  return e(Html, { lang: "en" },
    e(Head, null),
    e(Preview, null, `Reset your ${appName} password — link expires in ${expiresInHours} hours`),

    e(Body, { style: styles.body },
      e(Container, { style: styles.container },

        // ── Header ──────────────────────────────────────────
        e(Section, { style: styles.header },
          logoUrl
            ? e(Img, { src: logoUrl, width: "40", height: "40", alt: appName, style: styles.logo })
            : e(Text, { style: styles.logoText }, appName)
        ),

        // ── Lock icon ────────────────────────────────────────
        e(Section, { style: styles.iconSection },
          e(Text, { style: styles.lockIcon }, "🔐")
        ),

        // ── Main content ─────────────────────────────────────
        e(Section, { style: styles.content },
          e(Heading, { style: styles.heading }, "Password Reset Request"),
          e(Text, { style: styles.greeting }, `Hi ${username},`),
          e(Text, { style: styles.paragraph },
            `We received a request to reset the password for your ${appName} account. `,
            "Click the button below to choose a new password."
          ),

          // CTA button
          e(Section, { style: styles.buttonSection },
            e(Button, { href: resetLink, style: styles.button }, "Reset My Password")
          ),

          e(Text, { style: styles.expiry },
            "This link will expire in ",
            e("strong", null, `${expiresInHours} hours`),
            "."
          ),

          e(Hr, { style: styles.divider }),

          // Fallback link
          e(Text, { style: styles.fallbackTitle }, "Button not working?"),
          e(Text, { style: styles.fallbackText }, "Copy and paste the URL below into your browser:"),
          e(Link, { href: resetLink, style: styles.fallbackLink }, resetLink),

          e(Hr, { style: styles.divider }),

          // Security note
          e(Section, { style: styles.securityBox },
            e(Text, { style: styles.securityText },
              "🛡️  If you didn't request a password reset, you can safely ignore this email. ",
              "Your password will remain unchanged. Never share this link with anyone."
            )
          )
        ),

        // ── Footer ───────────────────────────────────────────
        e(Section, { style: styles.footer },
          e(Text, { style: styles.footerText },
            `© ${new Date().getFullYear()} ${appName}. All rights reserved.`
          ),
          e(Text, { style: styles.footerLinks },
            e(Link, { href: `${baseUrl}/help`,    style: styles.footerLink }, "Help Center"),
            " · ",
            e(Link, { href: `${baseUrl}/privacy`, style: styles.footerLink }, "Privacy Policy"),
            " · ",
            e(Link, { href: `${baseUrl}/terms`,   style: styles.footerLink }, "Terms of Service")
          )
        )

      )
    )
  );
}

export default PasswordResetEmail;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    margin: 0,
    padding: "32px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e4e4e7",
    maxWidth: "560px",
    margin: "0 auto",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#18181b",
    padding: "24px 40px",
    textAlign: "center",
  },
  logo: { borderRadius: "8px" },
  logoText: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    margin: 0,
  },
  iconSection: {
    textAlign: "center",
    padding: "36px 40px 0",
  },
  lockIcon: { fontSize: "48px", margin: 0, lineHeight: 1 },
  content: { padding: "24px 40px 32px" },
  heading: {
    color: "#18181b",
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    margin: "16px 0 20px",
    textAlign: "center",
  },
  greeting:  { color: "#3f3f46", fontSize: "16px", margin: "0 0 12px" },
  paragraph: { color: "#52525b", fontSize: "15px", lineHeight: "1.65", margin: "0 0 28px" },
  buttonSection: { textAlign: "center", margin: "0 0 20px" },
  button: {
    backgroundColor: "#18181b",
    borderRadius: "6px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.02em",
    padding: "14px 36px",
    textDecoration: "none",
  },
  expiry: { color: "#71717a", fontSize: "13px", textAlign: "center", margin: "0 0 24px" },
  divider: { borderColor: "#e4e4e7", borderTopWidth: "1px", margin: "0 0 20px" },
  fallbackTitle: { color: "#3f3f46", fontSize: "13px", fontWeight: "600", margin: "0 0 4px" },
  fallbackText:  { color: "#71717a", fontSize: "13px", margin: "0 0 8px" },
  fallbackLink: {
    color: "#2563eb",
    fontSize: "12px",
    wordBreak: "break-all",
    display: "block",
    marginBottom: "20px",
  },
  securityBox: {
    backgroundColor: "#fafafa",
    border: "1px solid #e4e4e7",
    borderRadius: "6px",
    padding: "14px 16px",
  },
  securityText: { color: "#71717a", fontSize: "13px", lineHeight: "1.6", margin: 0 },
  footer: {
    backgroundColor: "#fafafa",
    borderTop: "1px solid #e4e4e7",
    padding: "20px 40px",
    textAlign: "center",
  },
  footerText:  { color: "#a1a1aa", fontSize: "12px", margin: "0 0 6px" },
  footerLinks: { color: "#a1a1aa", fontSize: "12px", margin: 0 },
  footerLink:  { color: "#71717a", textDecoration: "underline" },
};