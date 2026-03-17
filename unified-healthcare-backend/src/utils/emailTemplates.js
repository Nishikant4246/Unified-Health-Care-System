const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── Design Tokens ─────────────────────────────────────────────
const GOLD        = "#C9A84C";
const GOLD_LIGHT  = "#F0D98C";
const GOLD_DARK   = "#A07830";
const NAVY        = "#0D1B2A";
const NAVY_MID    = "#1A2E45";
const WHITE       = "#FFFFFF";
const TEXT_DARK   = "#1A1A2E";
const TEXT_MID    = "#4A5568";
const TEXT_LIGHT  = "#718096";
const BG_SOFT     = "#FAFAF7";
const BORDER      = "#E8E0CC";

// ─── Shared Wrapper ────────────────────────────────────────────
const wrap = (accentColor, iconEmoji, title, subtitle, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F1E8;font-family:'Source Sans 3',Georgia,sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#F4F1E8;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;background:${WHITE};
                      border-radius:12px;overflow:hidden;
                      border:1px solid ${BORDER};
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Gold top bar -->
          <tr>
            <td style="background:linear-gradient(90deg,${GOLD_DARK},${GOLD},${GOLD_LIGHT},${GOLD},${GOLD_DARK});
                       height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(160deg,${NAVY} 0%,${NAVY_MID} 100%);
                       padding:40px 48px 36px;text-align:center;">
              <div style="margin-bottom:20px;">
                <span style="display:inline-block;background:rgba(201,168,76,0.15);
                             border:1px solid rgba(201,168,76,0.4);
                             border-radius:50%;width:64px;height:64px;
                             line-height:64px;font-size:28px;">
                  ${iconEmoji}
                </span>
              </div>
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;
                        color:${GOLD};font-weight:600;text-transform:uppercase;
                        font-family:'Source Sans 3',sans-serif;">
                Unified Health Care System
              </p>
              <h1 style="margin:8px 0 0;font-family:'Playfair Display',Georgia,serif;
                         font-size:26px;font-weight:700;color:${WHITE};
                         letter-spacing:0.3px;line-height:1.3;">
                ${title}
              </h1>
              ${subtitle ? `<p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.6);
                                font-family:'Source Sans 3',sans-serif;">${subtitle}</p>` : ""}
            </td>
          </tr>

          <!-- Gold divider line -->
          <tr>
            <td style="background:linear-gradient(90deg,${GOLD_DARK},${GOLD},${GOLD_LIGHT},${GOLD},${GOLD_DARK});
                       height:2px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:${WHITE};padding:40px 48px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${BG_SOFT};border-top:1px solid ${BORDER};
                       padding:20px 48px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:${TEXT_LIGHT};
                        font-family:'Source Sans 3',sans-serif;">
                © 2026 Unified Health Care System &nbsp;·&nbsp;
                <a href="${BASE_URL}" style="color:${GOLD_DARK};text-decoration:none;">Portal</a>
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#A0A0A0;
                        font-family:'Source Sans 3',sans-serif;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

          <!-- Bottom gold bar -->
          <tr>
            <td style="background:linear-gradient(90deg,${GOLD_DARK},${GOLD},${GOLD_LIGHT},${GOLD},${GOLD_DARK});
                       height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

// ─── CTA Button ────────────────────────────────────────────────
const ctaBtn = (label = "Login to UHCS") => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="margin:32px 0 8px;">
  <tr>
    <td align="center">
      <a href="${BASE_URL}"
         style="display:inline-block;background:linear-gradient(135deg,${GOLD_DARK},${GOLD});
                color:${NAVY};padding:14px 36px;border-radius:6px;
                text-decoration:none;font-size:15px;font-weight:600;
                font-family:'Source Sans 3',sans-serif;
                letter-spacing:0.4px;
                border:1px solid ${GOLD_DARK};">
        ${label}
      </a>
    </td>
  </tr>
</table>`;

// ─── Data Table ────────────────────────────────────────────────
const dataTable = (rows) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background:${BG_SOFT};border:1px solid ${BORDER};
              border-radius:8px;margin:24px 0;overflow:hidden;">
  ${rows.map(([label, value, valueColor], i) => `
  <tr style="background:${i % 2 === 0 ? WHITE : BG_SOFT};">
    <td style="padding:11px 18px;font-size:13px;color:${TEXT_LIGHT};
               font-family:'Source Sans 3',sans-serif;
               width:150px;white-space:nowrap;
               border-bottom:1px solid ${BORDER};">
      ${label}
    </td>
    <td style="padding:11px 18px;font-size:13px;
               font-weight:600;color:${valueColor || TEXT_DARK};
               font-family:'Source Sans 3',sans-serif;
               border-bottom:1px solid ${BORDER};">
      ${value}
    </td>
  </tr>`).join("")}
</table>`;

// ─── Info / Alert Box ──────────────────────────────────────────
const infoBox = (text, type = "gold") => {
  const styles = {
    gold:  { bg: "#FEF9EC", border: GOLD,      text: "#7A5C1E" },
    green: { bg: "#F0FDF4", border: "#16A34A", text: "#14532D" },
    red:   { bg: "#FEF2F2", border: "#DC2626", text: "#7F1D1D" },
    blue:  { bg: "#EFF6FF", border: "#1D4ED8", text: "#1E3A5F" },
    teal:  { bg: "#F0FDFA", border: "#0F766E", text: "#134E4A" },
  };
  const s = styles[type] || styles.gold;
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="margin:20px 0;">
  <tr>
    <td style="background:${s.bg};border-left:4px solid ${s.border};
               border-radius:0 6px 6px 0;padding:14px 18px;">
      <p style="margin:0;font-size:14px;line-height:1.6;color:${s.text};
                font-family:'Source Sans 3',sans-serif;">
        ${text}
      </p>
    </td>
  </tr>
</table>`;
};

// ─── Greeting & Intro paragraph ───────────────────────────────
const greeting = (name, message) => `
<p style="margin:0 0 8px;font-size:17px;font-weight:600;color:${TEXT_DARK};
           font-family:'Playfair Display',Georgia,serif;">
  Dear ${name},
</p>
<p style="margin:0 0 4px;font-size:15px;color:${TEXT_MID};line-height:1.7;
           font-family:'Source Sans 3',sans-serif;">
  ${message}
</p>`;


// ══════════════════════════════════════════════════════════════
// 1. Patient Welcome
// ══════════════════════════════════════════════════════════════
export const patientWelcomeEmail = (patient) => ({
  subject: "Welcome to UHCS – Your Health Portal is Ready",
  html: wrap(
    GOLD, "🏥",
    "Welcome to N's UHCS",
    "Your patient portal has been activated",
    `
    ${greeting(
      `<strong>${patient.name}</strong>`,
      "Your patient account has been <strong>successfully created</strong>. You now have full access to your health portal — view your medical timeline, track payments, and upload past reports."
    )}
    ${dataTable([
      ["Patient ID",     patient.uniqueId, GOLD_DARK],
      ["Full Name",      patient.name],
      ["Email",          patient.email],
      ["Phone",          patient.phone || "—"],
      ["Account Status", "Active ✓",       "#16A34A"],
    ])}
    ${infoBox(
      "💡 <strong>Getting Started:</strong> Log in to explore your Medical Timeline, upload older reports, and view your complete payment history.",
      "gold"
    )}
    ${ctaBtn("Access Your Portal")}
    `
  ),
});

// ══════════════════════════════════════════════════════════════
// 2. Doctor Welcome (Pending Approval)
// ══════════════════════════════════════════════════════════════
export const doctorWelcomeEmail = (doctor) => ({
  subject: "UHCS – Registration Received, Pending Approval",
  html: wrap(
    GOLD, "👨‍⚕️",
    "Registration Received",
    "Your application is under review",
    `
    ${greeting(
      `<strong>Dr. ${doctor.name}</strong>`,
      "Thank you for registering on UHCS. Your application is currently <strong>under review</strong> by our admin team. You will receive an email notification once your account is approved."
    )}
    ${dataTable([
      ["Doctor ID",      doctor.uniqueId,           GOLD_DARK],
      ["Full Name",      `Dr. ${doctor.name}`],
      ["Email",          doctor.email],
      ["Specialization", doctor.specialization || "—"],
      ["Hospital",       doctor.hospital || "—"],
      ["Status",         "Pending Approval ⏳",      "#D97706"],
    ])}
    ${infoBox(
      "⏳ Approval typically takes <strong>24–48 hours</strong>. We will notify you by email the moment your account is reviewed.",
      "gold"
    )}
    <p style="margin:24px 0 0;font-size:13px;color:${TEXT_LIGHT};text-align:center;
               font-family:'Source Sans 3',sans-serif;">
      Questions? Contact the UHCS admin team at
      <a href="${BASE_URL}" style="color:${GOLD_DARK};text-decoration:none;">our portal</a>.
    </p>
    `
  ),
});

// ══════════════════════════════════════════════════════════════
// 3. New Prescription / Medical Record
// ══════════════════════════════════════════════════════════════
export const prescriptionEmail = (patient, doctor, record, pdfPath) => ({
  subject: `UHCS – New Prescription from Dr. ${doctor.name}`,
  html: wrap(
    GOLD, "💊",
    "New Prescription",
    `Issued by Dr. ${doctor.name}`,
    `
    ${greeting(
      `<strong>${patient.name}</strong>`,
      `Dr. <strong>${doctor.name}</strong> has added a new medical record to your profile. Your prescription is attached to this email as a PDF and is also available in your portal.`
    )}
    ${dataTable([
      ["Patient ID",       patient.uniqueId],
      ["Doctor",           `Dr. ${doctor.name}${doctor.specialization ? ` · ${doctor.specialization}` : ""}`],
      ["Diagnosis",        record.diagnosis],
      ["Medicines",        record.medicines?.join(", ") || "—"],
      ["Visit Date",       new Date(record.visitDate).toLocaleDateString("en-IN")],
      ["Consultation Fee", `₹${record.paymentAmount || 0}`, GOLD_DARK],
    ])}
    ${record.notes ? infoBox(`📝 <strong>Doctor's Notes:</strong> ${record.notes}`, "teal") : ""}
    ${infoBox(
      "📎 Your prescription PDF is attached to this email. You can also download it anytime from <strong>UHCS Portal → Medical Timeline</strong>.",
      "gold"
    )}
    ${ctaBtn("View in Portal")}
    `
  ),
  attachments: pdfPath
    ? [{ filename: `prescription-${record._id}.pdf`, path: pdfPath }]
    : [],
});

// ══════════════════════════════════════════════════════════════
// 4. Appointment Requested → Doctor
// ══════════════════════════════════════════════════════════════
export const appointmentRequestEmail = (doctor, patient, appointment) => ({
  subject: "UHCS – New Appointment Request",
  html: wrap(
    GOLD, "📅",
    "New Appointment Request",
    "Action required — please respond at your earliest convenience",
    `
    ${greeting(
      `<strong>Dr. ${doctor.name}</strong>`,
      "A patient has requested an appointment with you. Please log in to your portal to <strong>accept or decline</strong> the request."
    )}
    ${dataTable([
      ["Patient Name",   patient.name],
      ["Patient ID",     patient.uniqueId],
      ["Phone",          patient.phone || "—"],
      ["Requested Date", new Date(appointment.date).toLocaleDateString("en-IN")],
      ["Time Slot",      appointment.timeSlot],
      ["Reason",         appointment.reason || "Not specified"],
    ])}
    ${infoBox(
      "⚡ <strong>Quick action needed:</strong> Timely responses help patients plan their care. Please log in to confirm or decline.",
      "blue"
    )}
    ${ctaBtn("Respond to Request")}
    `
  ),
});

// ══════════════════════════════════════════════════════════════
// 5. Appointment Confirmed → Patient
// ══════════════════════════════════════════════════════════════
export const appointmentAcceptedEmail = (patient, doctor, appointment) => ({
  subject: "UHCS – Your Appointment is Confirmed ✅",
  html: wrap(
    GOLD, "✅",
    "Appointment Confirmed",
    "Your booking has been accepted",
    `
    ${greeting(
      `<strong>${patient.name}</strong>`,
      `Great news! Your appointment with <strong>Dr. ${doctor.name}</strong> has been <strong>confirmed</strong>. Please plan to arrive a few minutes early.`
    )}
    ${dataTable([
      ["Doctor",         `Dr. ${doctor.name}`],
      ["Specialization", doctor.specialization || "—"],
      ["Hospital",       doctor.hospital || "—"],
      ["Date",           new Date(appointment.date).toLocaleDateString("en-IN")],
      ["Time Slot",      appointment.timeSlot],
      ["Status",         "Confirmed ✅",  "#16A34A"],
    ])}
    ${infoBox(
      `📍 <strong>Location:</strong> ${doctor.hospital || "Please contact the doctor's office for exact location details."}`,
      "green"
    )}
    ${ctaBtn("View Appointment")}
    `
  ),
});

// ══════════════════════════════════════════════════════════════
// 6. Appointment Declined → Patient
// ══════════════════════════════════════════════════════════════
export const appointmentDeclinedEmail = (patient, doctor, appointment) => ({
  subject: "UHCS – Appointment Request Could Not Be Confirmed",
  html: wrap(
    GOLD, "📋",
    "Appointment Declined",
    "We're sorry for the inconvenience",
    `
    ${greeting(
      `<strong>${patient.name}</strong>`,
      `Unfortunately, your appointment request with <strong>Dr. ${doctor.name}</strong> could not be confirmed at this time.`
    )}
    ${dataTable([
      ["Doctor",         `Dr. ${doctor.name}`],
      ["Date Requested", new Date(appointment.date).toLocaleDateString("en-IN")],
      ["Time Slot",      appointment.timeSlot],
      ["Reason",         appointment.declineReason || "No reason provided"],
    ])}
    ${infoBox(
      "🔄 <strong>What's next?</strong> You can book a new appointment with a different time slot or another available doctor directly from your Patient Portal.",
      "red"
    )}
    ${ctaBtn("Book Another Appointment")}
    `
  ),
});

// ══════════════════════════════════════════════════════════════
// 7. Doctor Created by Admin  →  used in createDoctor()
// ══════════════════════════════════════════════════════════════
export const doctorCreatedByAdminEmail = (doctor) => ({
  subject: "UHCS – Your Doctor Account is Approved",
  html: wrap(
    GOLD, "👨‍⚕️",
    "Account Approved",
    "Created & approved by UHCS administration",
    `
    ${greeting(
      `<strong>Dr. ${doctor.name}</strong>`,
      "Your doctor account has been <strong>created and approved</strong> by the UHCS admin. You can log in immediately and start using the system."
    )}
    ${dataTable([
      ["Doctor ID",      doctor.uniqueId,    GOLD_DARK],
      ["Email",          doctor.email],
      ["Specialization", doctor.specialization || "—"],
      ["Status",         "Approved ✓",        "#16A34A"],
    ])}
    ${infoBox(
      "✅ <strong>Admin Verified:</strong> Your account was directly created and approved by the UHCS administration team. No further action is needed.",
      "green"
    )}
    ${ctaBtn("Login to UHCS")}
    `
  ),
});

// ══════════════════════════════════════════════════════════════
// 8. Doctor Approved (Manual)  →  used in approveDoctor()
// ══════════════════════════════════════════════════════════════
export const doctorApprovedEmail = (doctor) => ({
  subject: "UHCS – Your Account Has Been Approved",
  html: wrap(
    GOLD, "✅",
    "Account Approved",
    "Your registration has been verified",
    `
    ${greeting(
      `<strong>Dr. ${doctor.name}</strong>`,
      "Great news! Your doctor account on UHCS has been <strong>approved</strong>. You can now log in and start using the system."
    )}
    ${dataTable([
      ["Doctor ID",      doctor.uniqueId,  GOLD_DARK],
      ["Specialization", doctor.specialization || "—"],
      ["Hospital",       doctor.hospital || "—"],
      ["Status",         "Approved ✓",      "#16A34A"],
    ])}
    ${infoBox(
      "🎉 <strong>Welcome aboard!</strong> You now have full access to your doctor dashboard — manage appointments, add medical records, and view your patients.",
      "green"
    )}
    ${ctaBtn("Login to UHCS")}
    `
  ),
});

// ══════════════════════════════════════════════════════════════
// 9. Doctor Approved via NMC  →  used in approveDoctorViaNMC()
// ══════════════════════════════════════════════════════════════
export const doctorApprovedViaNMCEmail = (doctor, nmcData) => ({
  subject: "UHCS – Your Account Has Been Approved via NMC Verification",
  html: wrap(
    GOLD, "🏛️",
    "Account Approved",
    "Verified via National Medical Commission",
    `
    ${greeting(
      `<strong>Dr. ${doctor.name}</strong>`,
      "Your doctor account has been approved following successful <strong>NMC verification</strong>. You can now log in to UHCS."
    )}
    ${dataTable([
      ["Doctor ID",      doctor.uniqueId,                    GOLD_DARK],
      ["NMC Reg. No.",   nmcData?.registrationNo || "N/A",   GOLD_DARK],
      ["Council",        nmcData?.stateMedicalCouncil || "—"],
      ["Qualification",  nmcData?.qualification || "—"],
      ["Specialization", doctor.specialization || "—"],
      ["Status",         "Approved ✓",                        "#16A34A"],
    ])}
    ${infoBox(
      "🏛️ <strong>NMC Verified:</strong> Your credentials were successfully validated against the National Medical Commission registry.",
      "teal"
    )}
    ${ctaBtn("Login to UHCS")}
    `
  ),
});

// ══════════════════════════════════════════════════════════════
// 10. Doctor Suspended  →  used in suspendDoctor()
// ══════════════════════════════════════════════════════════════
export const doctorSuspendedEmail = (doctor) => ({
  subject: "UHCS – Your Account Has Been Suspended",
  html: wrap(
    GOLD, "⚠️",
    "Account Suspended",
    "Your access to UHCS has been restricted",
    `
    ${greeting(
      `<strong>Dr. ${doctor.name}</strong>`,
      "We regret to inform you that your UHCS doctor account has been <strong>suspended</strong> by the administration."
    )}
    ${dataTable([
      ["Doctor ID", doctor.uniqueId],
      ["Status",    "Suspended",                             "#DC2626"],
      ["Reason",    doctor.suspendedReason || "Suspended by admin"],
    ])}
    ${infoBox(
      "📩 <strong>Appeal this decision:</strong> If you believe this is a mistake or wish to appeal, please contact the UHCS admin team through the portal.",
      "red"
    )}
    <p style="margin:24px 0 0;font-size:13px;color:${TEXT_LIGHT};text-align:center;
               font-family:'Source Sans 3',sans-serif;">
      For queries, visit
      <a href="${BASE_URL}" style="color:${GOLD_DARK};text-decoration:none;">our portal</a>
      and contact the admin team.
    </p>
    `
  ),
});

// ══════════════════════════════════════════════════════════════
// 11. Doctor Reinstated  →  used in reinstateDoctor()
// ══════════════════════════════════════════════════════════════
export const doctorReinstatedEmail = (doctor) => ({
  subject: "UHCS – Your Account Has Been Reinstated",
  html: wrap(
    GOLD, "✅",
    "Account Reinstated",
    "Your full access has been restored",
    `
    ${greeting(
      `<strong>Dr. ${doctor.name}</strong>`,
      "Your UHCS doctor account has been <strong>reinstated</strong>. You now have full access to the system again."
    )}
    ${dataTable([
      ["Doctor ID", doctor.uniqueId, GOLD_DARK],
      ["Status",    "Active ✓",       "#16A34A"],
    ])}
    ${infoBox(
      "🎉 <strong>Welcome back!</strong> Your account is fully active. You can log in and resume managing your appointments and patient records.",
      "green"
    )}
    ${ctaBtn("Login to UHCS")}
    `
  ),
});