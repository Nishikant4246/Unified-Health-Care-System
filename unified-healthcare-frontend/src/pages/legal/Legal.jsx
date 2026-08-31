import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo";

const EMERALD = "#10b981";
const GOLD = "#C9A84C";
const LAST_UPDATED = "31 August 2026 By Nishikant Kshirsagar";

/* ─── small presentational helpers ─────────────────────────── */
function Section({ n, title, children }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "var(--text-primary)",
          margin: "0 0 10px",
        }}
      >
        {n}. {title}
      </h2>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)" }}>
        {children}
      </div>
    </section>
  );
}

const P = ({ children }) => <p style={{ margin: "0 0 12px" }}>{children}</p>;

const UL = ({ children }) => (
  <ul style={{ margin: "0 0 12px", paddingLeft: 20, listStyle: "disc" }}>{children}</ul>
);

const LI = ({ children }) => <li style={{ marginBottom: 6 }}>{children}</li>;

/* ─── Terms of Service body ────────────────────────────────── */
function TermsBody() {
  return (
    <>
      <P>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Unified Health Care
        System (&ldquo;UHCS&rdquo;, &ldquo;the platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By
        creating an account or using the platform as a patient, doctor, or administrator, you agree to
        these Terms. If you do not agree, please do not use the platform.
      </P>

      <Section n="1" title="About this platform">
        <P>
          UHCS is an academic project that lets patients keep a single, portable medical history and
          lets authorised doctors read and add to that history. It is provided for educational and
          demonstration purposes and is not a commercial medical service.
        </P>
      </Section>

      <Section n="2" title="Eligibility & accounts">
        <UL>
          <LI>You must be at least 18 years old, or use the platform under the supervision of a parent or legal guardian.</LI>
          <LI>You must provide accurate, current and complete information when registering and keep it up to date.</LI>
          <LI>You are responsible for keeping your password confidential and for all activity under your account.</LI>
          <LI>Notify an administrator immediately if you believe your account has been accessed without your permission.</LI>
        </UL>
      </Section>

      <Section n="3" title="Doctor verification & professional responsibility">
        <UL>
          <LI>Doctors must submit a valid medical registration/license number and a clear copy of their license for review. Accounts remain <em>pending</em> until an administrator approves them.</LI>
          <LI>Submitting false, forged or misleading credentials will result in permanent rejection and removal.</LI>
          <LI>Doctors are solely responsible for the clinical accuracy of the records, diagnoses and prescriptions they enter, and for complying with the laws and professional codes that apply to them.</LI>
        </UL>
      </Section>

      <Section n="4" title="Acceptable use">
        <P>You agree not to:</P>
        <UL>
          <LI>access, or try to access, records or accounts that do not belong to you or that you are not authorised to view;</LI>
          <LI>upload malicious code, attempt to break, overload or reverse-engineer the platform, or bypass its security or role controls;</LI>
          <LI>enter content that is unlawful, abusive, or infringes someone else&rsquo;s rights;</LI>
          <LI>use another person&rsquo;s identity or medical information without a lawful basis and their consent.</LI>
        </UL>
      </Section>

      <Section n="5" title="Medical disclaimer">
        <P>
          UHCS is a record-keeping tool. It does <strong>not</strong> provide medical advice,
          diagnosis or treatment, and it is not a substitute for consultation with a qualified health
          professional. <strong>In an emergency, call your local emergency number immediately</strong> —
          do not rely on this platform.
        </P>
      </Section>

      <Section n="6" title="Your content">
        <P>
          You keep ownership of the information you submit. You grant UHCS a limited licence to store,
          process and display that information to you and to the people your role permits (for
          example, an assigned doctor or an administrator) so the platform can function.
        </P>
      </Section>

      <Section n="7" title="Availability & &ldquo;as is&rdquo; service">
        <P>
          The platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
          warranties of any kind. As an academic project it may be changed, interrupted or
          discontinued at any time, and data may be reset. Do not use it as the only copy of any
          medical record you cannot afford to lose.
        </P>
      </Section>

      <Section n="8" title="Limitation of liability">
        <P>
          To the maximum extent permitted by law, UHCS and its developer will not be liable for any
          indirect, incidental or consequential loss, or for any loss of data, profit or goodwill,
          arising from your use of or inability to use the platform.
        </P>
      </Section>

      <Section n="9" title="Suspension & termination">
        <P>
          We may suspend or remove an account that breaches these Terms or that is used unlawfully.
          You may ask an administrator to close your account at any time.
        </P>
      </Section>

      <Section n="10" title="Changes to these Terms">
        <P>
          We may update these Terms from time to time. Material changes will be reflected by the
          &ldquo;last updated&rdquo; date above. Continued use after a change means you accept the
          updated Terms.
        </P>
      </Section>

      <Section n="11" title="Governing law">
        <P>
          These Terms are governed by the laws of India. Any dispute will be subject to the exclusive
          jurisdiction of the courts of India.
        </P>
      </Section>

      <Section n="12" title="Contact">
        <P>
          For any question about these Terms, contact the UHCS administrator through the platform.
        </P>
      </Section>
    </>
  );
}

/* ─── Privacy Policy body ──────────────────────────────────── */
function PrivacyBody() {
  return (
    <>
      <P>
        This Privacy Policy explains what personal and health information the Unified Health Care
        System (&ldquo;UHCS&rdquo;) collects, why, how it is protected, and the choices you have. It
        applies to patients, doctors and administrators.
      </P>

      <Section n="1" title="Information we collect">
        <P><strong>Account details</strong> — name, email address, phone number, and a securely hashed password.</P>
        <P><strong>Patient health data</strong> — date of birth, height and weight (optional), and the medical records, prescriptions, visit notes and reports created for you or uploaded by you.</P>
        <P><strong>Doctor details</strong> — specialisation, qualifications, years of experience, hospital/clinic, consultation fee, medical registration/license number and an uploaded copy of your license, and (optionally) a practice location.</P>
        <P><strong>Technical data</strong> — a login token stored in your browser to keep you signed in, and basic server logs needed to run and secure the service.</P>
      </Section>

      <Section n="2" title="How we use it">
        <UL>
          <LI>to create and operate your account and provide the platform&rsquo;s features;</LI>
          <LI>to let authorised doctors view and add to a patient&rsquo;s medical history;</LI>
          <LI>to let administrators verify doctors and keep the platform safe;</LI>
          <LI>to calculate simple derived values such as age and BMI for display;</LI>
          <LI>to send transactional email (welcome, doctor approval/suspension, password reset).</LI>
        </UL>
        <P>We do not sell your data and we do not use it for advertising.</P>
      </Section>

      <Section n="3" title="Who can see your data">
        <UL>
          <LI><strong>You</strong> — your own profile and records.</LI>
          <LI><strong>Doctors</strong> — a doctor can see a patient&rsquo;s records when treating them; records they create are visible to that patient and to other authorised doctors for continuity of care.</LI>
          <LI><strong>Administrators</strong> — can see account information and doctor verification documents to manage the platform.</LI>
        </UL>
        <P>Access is enforced by role-based permissions on every request.</P>
      </Section>

      <Section n="4" title="Service providers">
        <P>
          We use trusted third parties only to run the service: a managed MongoDB database (MongoDB
          Atlas) for storage, a media/file host (Cloudinary) for uploaded reports and license
          documents, an email provider (Brevo) to deliver transactional email, and a cloud platform
          (Render) for hosting. Uploaded files that contain health information are served through
          time-limited, signed links.
        </P>
      </Section>

      <Section n="5" title="Security">
        <UL>
          <LI>passwords are hashed with bcrypt and never stored or shown in plain text;</LI>
          <LI>sessions use signed JSON Web Tokens that expire;</LI>
          <LI>connections use HTTPS; access to records is checked against your role on every request;</LI>
          <LI>password-reset links are single-use and expire after 30 minutes.</LI>
        </UL>
        <P>No system is perfectly secure, but we take reasonable measures appropriate to an academic project.</P>
      </Section>

      <Section n="6" title="Data retention">
        <P>
          We keep your information for as long as your account is active. If your account is closed,
          associated personal data is deleted or anonymised, except where a limited record must be
          kept to meet a legal or safety obligation. Because this is an academic project, data may
          also be cleared during maintenance or resets.
        </P>
      </Section>

      <Section n="7" title="Your rights">
        <UL>
          <LI><strong>Access & update</strong> — view and edit most of your details from your profile page.</LI>
          <LI><strong>Correction</strong> — ask a doctor or administrator to correct a clinical record.</LI>
          <LI><strong>Deletion</strong> — ask an administrator to delete your account and personal data.</LI>
          <LI><strong>Withdraw consent</strong> — stop using the platform and request closure at any time.</LI>
        </UL>
      </Section>

      <Section n="8" title="Cookies & local storage">
        <P>
          UHCS does not use tracking or advertising cookies. It stores a single authentication token
          (and your theme/language choice) in your browser&rsquo;s local storage so you stay signed
          in and see your preferences. Clearing your browser storage signs you out.
        </P>
      </Section>

      <Section n="9" title="Children">
        <P>
          The platform is not intended for independent use by anyone under 18. A parent or legal
          guardian may manage a minor&rsquo;s record on their behalf.
        </P>
      </Section>

      <Section n="10" title="Changes to this Policy">
        <P>
          We may update this Policy from time to time. The &ldquo;last updated&rdquo; date above shows
          the current version; significant changes will be highlighted on the platform.
        </P>
      </Section>

      <Section n="11" title="Contact">
        <P>
          For any privacy question, or to exercise a right above, contact the UHCS administrator
          through the platform.
        </P>
      </Section>
    </>
  );
}

/* ─── page shell ──────────────────────────────────────────── */
export default function Legal({ doc = "terms" }) {
  const isTerms = doc === "terms";
  const title = isTerms ? "Terms of Service" : "Privacy Policy";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "12px clamp(16px, 4vw, 40px)",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <Logo subtitle="Unified Health Care System" size={30} wordmarkSize={16} subtitleSize={10} />
        </Link>
        <Link
          to="/"
          style={{ fontSize: 13, fontWeight: 700, color: EMERALD, textDecoration: "none" }}
        >
          ← Back to Home
        </Link>
      </header>

      {/* content */}
      <main
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "clamp(28px, 6vw, 56px) clamp(16px, 5vw, 32px) 64px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: EMERALD,
            marginBottom: 8,
          }}
        >
          Legal
        </div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 10 }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div style={{ marginTop: 8, borderTop: `2px solid ${GOLD}`, paddingTop: 12 }}>
          {isTerms ? <TermsBody /> : <PrivacyBody />}
        </div>

        {/* cross-link */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          {isTerms ? "See also: " : "See also: "}
          <Link
            to={isTerms ? "/privacy" : "/terms"}
            style={{ color: EMERALD, fontWeight: 700, textDecoration: "none" }}
          >
            {isTerms ? "Privacy Policy" : "Terms of Service"}
          </Link>
          &nbsp;&nbsp; &mdash;&nbsp;&nbsp;
          {"  Way to   "}
          <Link to="/" style={{ color: EMERALD, fontWeight: 700, textDecoration: "none" }}>
            &nbsp;Home Page
          </Link>
        </div>
      </main>
    </div>
  );
}
