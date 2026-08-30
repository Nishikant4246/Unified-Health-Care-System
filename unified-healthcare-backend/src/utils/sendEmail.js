import fs from "fs";
import nodemailer from "nodemailer";

/**
 * Transport is picked lazily, by which env vars are present:
 *
 *   1. Brevo HTTP API    → BREVO_API_KEY             (port 443 — never blocked,
 *                                                     works on Render free tier,
 *                                                     sends to ANY address once a
 *                                                     single sender email is
 *                                                     verified — no domain DNS)
 *   2. Resend HTTP API   → RESEND_API_KEY            (port 443; free tier without
 *                                                     a verified domain can only
 *                                                     mail the account owner)
 *   3. Generic SMTP      → SMTP_HOST / SMTP_USER …   (Brevo / SendGrid / Mailgun)
 *   4. Gmail SMTP        → EMAIL_USER / EMAIL_PASS   (fine locally; Gmail blocks
 *                                                     SMTP auth from a datacenter
 *                                                     IP e.g. Render — do NOT
 *                                                     rely on this in production)
 *
 * Templates are unchanged — every caller still passes { subject, html }.
 */

// ── Resolved lazily — env isn't loaded when this module first evaluates ──
// Trims values so a stray space pasted into the host dashboard (a very common
// Render mistake) doesn't silently disable a transport.
const env = (key) => {
  const v = process.env[key];
  return typeof v === "string" && v.trim() ? v.trim() : "";
};

const parseFrom = () => {
  const raw =
    env("EMAIL_FROM") ||
    `Unified Health Care System <${
      env("SMTP_USER") || env("EMAIL_USER") || "no-reply@uhcs.app"
    }>`;
  const m = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || "Unified Health Care System", email: m[2].trim() };
  return { name: "Unified Health Care System", email: raw.trim() };
};

const fromAddress = () => {
  const { name, email } = parseFrom();
  return `"${name}" <${email}>`;
};

export const resolveMode = () =>
  env("BREVO_API_KEY")
    ? "brevo"
    : env("RESEND_API_KEY")
    ? "resend"
    : env("SMTP_HOST") || env("SMTP_USER") || env("EMAIL_USER")
    ? "smtp"
    : "none";

// Booleans only — never returns secret values. Used by the admin diagnostics route.
export const emailEnvSummary = () => ({
  mode: resolveMode(),
  from: parseFrom().email,
  hasBrevoKey: !!env("BREVO_API_KEY"),
  hasResendKey: !!env("RESEND_API_KEY"),
  hasSmtpHost: !!env("SMTP_HOST"),
  hasSmtpUser: !!(env("SMTP_USER") || env("EMAIL_USER")),
  hasSmtpPass: !!(env("SMTP_PASS") || env("EMAIL_PASS")),
  hasEmailFrom: !!env("EMAIL_FROM"),
  hasFrontendUrl: !!env("FRONTEND_URL"),
});

let transporter = null;
let warnedMissing = false;

// ── SMTP transport (cached) ─────────────────────────────────
const getTransporter = () => {
  const host = env("SMTP_HOST") || "smtp.gmail.com";
  const port = Number(env("SMTP_PORT") || env("EMAIL_PORT")) || 587;
  const user = env("SMTP_USER") || env("EMAIL_USER");
  const pass = env("SMTP_PASS") || env("EMAIL_PASS");

  if (!user || !pass) {
    if (!warnedMissing) {
      console.error(
        "❌ Email disabled: no BREVO_API_KEY / RESEND_API_KEY and no SMTP credentials " +
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

// ── attachments → [{ filename, content(base64) }] for HTTP APIs ──
const encodeAttachments = (attachments) =>
  (attachments || [])
    .filter((a) => a && (a.path || a.content))
    .map((a) => {
      const buf = a.path
        ? fs.readFileSync(a.path)
        : Buffer.isBuffer(a.content)
        ? a.content
        : Buffer.from(String(a.content));
      return { filename: a.filename, base64: buf.toString("base64") };
    });

// ── Brevo HTTP API ─────────────────────────────────────────
const sendViaBrevo = async ({ to, subject, html, attachments }) => {
  const { name, email } = parseFrom();
  const recipients = (Array.isArray(to) ? to : [to]).map((e) => ({ email: e }));
  const body = {
    sender: { name, email },
    to: recipients,
    subject,
    htmlContent: html,
  };
  const files = encodeAttachments(attachments);
  if (files.length) body.attachment = files.map((f) => ({ name: f.filename, content: f.base64 }));

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env("BREVO_API_KEY"),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || `Brevo HTTP ${res.status}`);
    err.code = `BREVO_${res.status}`;
    throw err;
  }
  return { messageId: data?.messageId };
};

// ── Resend HTTP API ────────────────────────────────────────
const sendViaResend = async ({ to, subject, html, attachments }) => {
  const body = {
    from: env("EMAIL_FROM") || "Unified Health Care System <onboarding@resend.dev>",
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  const files = encodeAttachments(attachments);
  if (files.length) body.attachments = files.map((f) => ({ filename: f.filename, content: f.base64 }));

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("RESEND_API_KEY")}`,
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
      "❌ Email disabled: set BREVO_API_KEY (recommended for Render), or RESEND_API_KEY, " +
      "or SMTP_HOST/SMTP_USER/SMTP_PASS, or EMAIL_USER/EMAIL_PASS in the environment.",
    );
    return { ok: false, error: "no email transport configured" };
  }

  if (mode === "brevo") {
    console.log(`✅ Email transport ready (Brevo HTTP API · from: ${parseFrom().email})`);
    if (!env("EMAIL_FROM")) {
      console.warn(
        "⚠️  EMAIL_FROM is not set — Brevo will reject sends unless the sender " +
        "address is a verified sender in your Brevo account.",
      );
    }
    return { ok: true };
  }

  if (mode === "resend") {
    console.log(
      `✅ Email transport ready (Resend HTTP API · from: ${
        env("EMAIL_FROM") || "onboarding@resend.dev"
      })`,
    );
    return { ok: true };
  }

  const t = getTransporter();
  if (!t) return { ok: false, error: "SMTP credentials missing" };
  try {
    await t.verify();
    console.log(
      `✅ Email transport ready (SMTP ${env("SMTP_HOST") || "smtp.gmail.com"} · from: ${fromAddress()})`,
    );
    if (!env("SMTP_HOST")) {
      console.warn(
        "⚠️  Using Gmail SMTP (smtp.gmail.com). This usually FAILS on Render / cloud hosts. " +
        "Set BREVO_API_KEY for reliable delivery in production.",
      );
    }
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
  if (mode === "none") {
    console.error(`❌ Email NOT sent to ${to} — no transport configured (mode=none).`);
    return { ok: false, error: "email-not-configured" };
  }

  try {
    let info;
    if (mode === "brevo") {
      info = await sendViaBrevo({ to, subject, html, attachments });
    } else if (mode === "resend") {
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
    return { ok: false, error: error.message || String(error) };
  }
};

export default sendEmail;
