import nodemailer from "nodemailer";
import { getDB } from "./db.js";

// Default email template — {{MESSAGE}} is replaced with actual content
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:#f97316;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">{{COMPANY_NAME}}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">You have a new message from our support team:</p>
              <div style="background:#fff7ed;border-left:4px solid #f97316;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;">
                <p style="margin:0;color:#1f2937;font-size:15px;line-height:1.6;">{{MESSAGE}}</p>
              </div>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.5;">Reply to this email or visit our website to continue the conversation.</p>
              <a href="{{SITE_URL}}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Open Chat</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e5e7eb;background:#fafafa;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">Sent from {{COMPANY_NAME}} support</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Get SMTP settings from DB
 */
export async function getEmailSettings() {
  const db = getDB();
  const settings = await db.collection("settings").findOne({ key: "email_smtp" });
  return {
    enabled: settings?.enabled || false,
    host: settings?.host || "",
    port: settings?.port || 587,
    secure: settings?.secure || false,
    user: settings?.user || "",
    pass: settings?.pass || "",
    fromEmail: settings?.fromEmail || "",
    fromName: settings?.fromName || "Support Team",
    companyName: settings?.companyName || "Support",
    siteUrl: settings?.siteUrl || "",
    cc: settings?.cc || "",
    template: settings?.template || DEFAULT_TEMPLATE,
  };
}

/**
 * Check if SMTP is configured and enabled
 */
export async function isEmailConfigured() {
  const settings = await getEmailSettings();
  return settings.enabled && settings.host && settings.user && settings.pass;
}

/**
 * Send an email to the visitor with the agent's message
 */
export async function sendEmailToVisitor(toEmail, message, visitorName) {
  const settings = await getEmailSettings();

  if (!settings.enabled || !settings.host || !settings.user || !settings.pass) {
    throw new Error("SMTP not configured");
  }

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
  });

  // Build HTML from template
  let html = settings.template || DEFAULT_TEMPLATE;
  html = html.replace(/\{\{MESSAGE\}\}/g, escapeHtml(message).replace(/\n/g, "<br>"));
  html = html.replace(/\{\{COMPANY_NAME\}\}/g, escapeHtml(settings.companyName || "Support"));
  html = html.replace(/\{\{SITE_URL\}\}/g, settings.siteUrl || "#");
  html = html.replace(/\{\{VISITOR_NAME\}\}/g, escapeHtml(visitorName || "there"));

  const mailOptions = {
    from: `"${settings.fromName}" <${settings.fromEmail || settings.user}>`,
    to: toEmail,
    subject: `New message from ${settings.companyName || "Support"}`,
    html,
    text: `You have a new message:\n\n${message}\n\nReply to this email or visit ${settings.siteUrl || "our website"} to continue.`,
  };

  // Add CC if configured
  if (settings.cc) {
    mailOptions.cc = settings.cc;
  }

  await transporter.sendMail(mailOptions);
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export { DEFAULT_TEMPLATE };
