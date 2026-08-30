import nodemailer from "nodemailer";

/**
 * Transport is picked once, by which env vars are present:
 *
 *   1. Resend HTTP API   → RESEND_API_KEY            (port 443 — never blocked,
 *                                                     no SMTP handshake, works
 *                                                     from any cloud host)
 *   2. Generic SMTP      → SMTP_HOST / SMTP_USER …   (Brevo / SendGrid / Mailgun)
 *   3. Gmail SMTP        → EMAIL_USER / EMAIL_PASS   (fine locally; Gmail often
 *                                                     blocks SMTP auth from a
 *                                                     datacenter IP e.g. Render)
 *
 * Templates are unchanged — every caller still passes { subject, html }.
 */

// Resolved lazily — env vars aren't loaded yet when this module first evaluates.
const fromAddress = () =>
  process.env.EMAIL_FROM ||
  `"Unified Health Care System" <${process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@uhcs.app"}>`;

const resolveMode = () =>
  process.env.RESEND_API_KEY
    ? "resend"
    : process.env.SMTP_HOST || process.env.SMTP_USER || process.env.EMAIL_USER
    ? "smtp"
    : "none";

let transporter = null;
let warnedMissing = false;

// ── SMTP transport (cached) ─────────────────────────────────
const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    if (!warnedMissing) {
      console.error(
        "❌ Email disabled: no RESEND_API_KEY and no SMTP credentials " +
        "(set them in your host's env vars — a committed .env is NOT used in production).",
      );
      warnedMissing = true;
    }
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,       // 465 = implicit TLS, 587 = STARTTLS
      requireTLS: port !== 465,
      auth: { user, pass },
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 25000,
    });
  }
  return transporter;
};

// ── Resend HTTP API ────────────────────────────────────────
const sendViaResend = async ({ to, subject, html, attachments }) => {
  const body = {
    from: process.env.EMAIL_FROM || "Unified Health Care System <onboarding@resend.dev>",
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  const files = (attachments || []).filter((a) => a && (a.path || a.content));
  if (files.length) {
    body.attachments = files.map((a) =>
      a.path
        ? { filename: a.filename, path: a.path }
        : { filename: a.filename, content: a.content },
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || `Resend HTTP ${res.status}`);
    err.code = `RESEND_${res.status}`;
    throw err;
  }
  return { messageId: data?.id };
};

// ── Boot check — call once from server.js after connectDB() ─
export const verifyEmailTransport = async () => {
  const mode = resolveMode();

  if (mode === "none") {
    console.error(
      "❌ Email disabled: set RESEND_API_KEY, or SMTP_HOST/SMTP_USER/SMTP_PASS, " +
      "or EMAIL_USER/EMAIL_PASS in the environment.",
    );
    return { ok: false, error: "no email transport configured" };
  }

  if (mode === "resend") {
    console.log(
      `✅ Email transport ready (Resend HTTP API · from: ${
        process.env.EMAIL_FROM || "onboarding@resend.dev"
      })`,
    );
    return { ok: true };
  }

  const t = getTransporter();
  if (!t) return { ok: false, error: "SMTP credentials missing" };
  try {
    await t.verify();
    console.log(
      `✅ Email transport ready (SMTP ${process.env.SMTP_HOST || "smtp.gmail.com"} · from: ${fromAddress()})`,
    );
    return { ok: true };
  } catch (error) {
    transporter = null;
    console.error(
      "❌ Email transport verification FAILED —",
      `code=${error.code || "?"} responseCode=${error.responseCode || "?"} :: ${error.message}`,
    );
    return { ok: false, error };
  }
};

// ── Send one email. Never throws. Returns { ok, error? }. ───
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const mode = resolveMode();
  if (mode === "none") return { ok: false, error: "email-not-configured" };

  try {
    let info;
    if (mode === "resend") {
      info = await sendViaResend({ to, subject, html, attachments });
    } else {
      const t = getTransporter();
      if (!t) return { ok: false, error: "email-not-configured" };
      info = await t.sendMail({ from: fromAddress(), to, subject, html, attachments });
    }
    console.log(`✅ Email sent to ${to} (${mode} · id: ${info.messageId})`);
    return { ok: true, info };
  } catch (error) {
    console.error(
      `❌ Email send failed to ${to} (${mode}) —`,
      `code=${error.code || "?"} responseCode=${error.responseCode || "?"} command=${error.command || "?"} :: ${error.message}`,
    );
    if (error.code === "EAUTH" || error.responseCode === 535) {
      transporter = null; // bad creds — rebuild next time in case env was fixed
    }
    return { ok: false, error };
  }
};

export default sendEmail;
