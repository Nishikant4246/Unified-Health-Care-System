import nodemailer from "nodemailer";

// ── Single cached transporter ────────────────────────────────
// Rebuilt only if it was never created or previously failed to build.
let transporter = null;
let warnedMissingEnv = false;

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    if (!warnedMissingEnv) {
      console.error(
        "❌ Email disabled: EMAIL_USER / EMAIL_PASS are not set in the environment. " +
        "Set them in your host's env vars (a committed .env is not used in production).",
      );
      warnedMissingEnv = true;
    }
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      // don't let a stuck SMTP socket hang an awaited request forever
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }
  return transporter;
};

// ── Boot check — call once from server.js after connectDB() ──
// Non-blocking. Prints exactly why email would fail, if it would.
export const verifyEmailTransport = async () => {
  const t = getTransporter();
  if (!t) return { ok: false, error: "EMAIL_USER / EMAIL_PASS missing" };
  try {
    await t.verify();
    console.log(`✅ Email transport ready (${process.env.EMAIL_USER})`);
    return { ok: true };
  } catch (error) {
    transporter = null; // force rebuild on next attempt
    console.error(
      "❌ Email transport verification FAILED —",
      `code=${error.code || "?"} responseCode=${error.responseCode || "?"} :: ${error.message}`,
    );
    return { ok: false, error };
  }
};

// ── Send one email. Never throws. Returns { ok, error? }. ────
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const t = getTransporter();
  if (!t) return { ok: false, error: "email-not-configured" };

  try {
    const info = await t.sendMail({
      from: `"Unified Health Care System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log(`✅ Email sent to ${to} (id: ${info.messageId})`);
    return { ok: true, info };
  } catch (error) {
    // full detail so the real cause is visible in logs, not just a vague message
    console.error(
      `❌ Email send failed to ${to} —`,
      `code=${error.code || "?"} responseCode=${error.responseCode || "?"} command=${error.command || "?"} :: ${error.message}`,
    );
    if (error.code === "EAUTH" || error.responseCode === 535) {
      transporter = null; // bad creds — rebuild next time in case env was fixed
    }
    return { ok: false, error };
  }
};

export default sendEmail;
