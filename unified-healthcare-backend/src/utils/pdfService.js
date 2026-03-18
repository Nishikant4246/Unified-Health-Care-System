import PDFDocument from "pdfkit";
import cloudinary from "../config/cloudinary.js";

// ─── Generate Prescription PDF + Upload to Cloudinary ─────────
// Returns the secure_url of the uploaded PDF
export const generateAndUploadPrescriptionPdf = async ({ patient, doctor, record }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc    = new PDFDocument({ margin: 50, size: "A4" });
      const chunks = [];

      // Collect buffer chunks
      doc.on("data",  (chunk) => chunks.push(chunk));
      doc.on("error", reject);
      doc.on("end",   async () => {
        try {
          const buffer = Buffer.concat(chunks);

          // ── Upload to Cloudinary as RAW (fixes 401 / PDF render issue) ──
          const result = await new Promise((res, rej) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder:        "uhcs/prescriptions",
                resource_type: "raw",              // MUST be raw for PDFs
                public_id:     `prescription-${record._id}`,
                overwrite:     true,
              },
              (error, result) => {
                if (error) rej(error);
                else res(result);
              }
            );
            stream.end(buffer);
          });

          resolve(result.secure_url);
        } catch (err) {
          reject(err);
        }
      });

      // ══════════════════════════════════════════════════════
      // PDF CONTENT
      // ══════════════════════════════════════════════════════

      const PURPLE = "#7c3aed";
      const GRAY   = "#6b7280";
      const DARK   = "#1a1a2e";
      const LINE   = "#e5e7eb";

      // ── Header bar ───────────────────────────────────────
      doc.rect(0, 0, 595, 80).fill(PURPLE);

      doc.fillColor("#ffffff")
         .font("Helvetica-Bold")
         .fontSize(22)
         .text("UHCS", 50, 22);

      doc.fillColor("rgba(255,255,255,0.7)")
         .font("Helvetica")
         .fontSize(10)
         .text("Unified Health Care System", 50, 48);

      doc.fillColor("#ffffff")
         .font("Helvetica-Bold")
         .fontSize(11)
         .text("PRESCRIPTION", 430, 30, { align: "right", width: 115 });

      doc.fillColor("rgba(255,255,255,0.7)")
         .font("Helvetica")
         .fontSize(9)
         .text(
           new Date(record.visitDate).toLocaleDateString("en-IN", {
             day: "numeric", month: "long", year: "numeric",
           }),
           430, 48, { align: "right", width: 115 }
         );

      // ── Doctor info block ────────────────────────────────
      doc.fillColor(DARK)
         .font("Helvetica-Bold")
         .fontSize(13)
         .text(`Dr. ${doctor.name}`, 50, 100);

      doc.fillColor(GRAY)
         .font("Helvetica")
         .fontSize(10)
         .text(
           [
             doctor.specialization || "General Physician",
             doctor.hospital       || "",
             doctor.phone          || "",
           ].filter(Boolean).join("  ·  "),
           50, 118
         );

      // Divider
      doc.moveTo(50, 140).lineTo(545, 140).strokeColor(LINE).lineWidth(1).stroke();

      // ── Patient info ─────────────────────────────────────
      doc.fillColor(GRAY)
         .font("Helvetica")
         .fontSize(9)
         .text("PATIENT", 50, 155);

      doc.fillColor(DARK)
         .font("Helvetica-Bold")
         .fontSize(12)
         .text(patient.name, 50, 168);

      doc.fillColor(GRAY)
         .font("Helvetica")
         .fontSize(10)
         .text(
           `ID: ${patient.uniqueId}   ·   ${patient.phone || patient.email || ""}`,
           50, 184
         );

      // Divider
      doc.moveTo(50, 205).lineTo(545, 205).strokeColor(LINE).lineWidth(1).stroke();

      let y = 220;

      // ── Diagnosis ────────────────────────────────────────
      doc.fillColor(GRAY)
         .font("Helvetica")
         .fontSize(9)
         .text("DIAGNOSIS", 50, y);

      y += 14;

      doc.fillColor(DARK)
         .font("Helvetica-Bold")
         .fontSize(13)
         .text(record.diagnosis, 50, y);

      y += 30;

      // ── Medicines ────────────────────────────────────────
      if (record.medicines?.length > 0) {
        doc.fillColor(GRAY)
           .font("Helvetica")
           .fontSize(9)
           .text("PRESCRIBED MEDICINES", 50, y);

        y += 14;

        record.medicines.forEach((med, i) => {
          // Pill-style background
          doc.roundedRect(50, y, 495, 28, 4)
             .fill(i % 2 === 0 ? "#f5f3ff" : "#faf9ff");

          doc.fillColor(PURPLE)
             .font("Helvetica-Bold")
             .fontSize(10)
             .text(`${i + 1}.`, 62, y + 9);

          doc.fillColor(DARK)
             .font("Helvetica")
             .fontSize(10)
             .text(med, 80, y + 9);

          y += 34;
        });

        y += 6;
      }

      // ── Doctor Notes ─────────────────────────────────────
      if (record.notes) {
        doc.fillColor(GRAY)
           .font("Helvetica")
           .fontSize(9)
           .text("DOCTOR'S NOTES", 50, y);

        y += 14;

        doc.roundedRect(50, y, 495, 60).fill("#f9fafb");

        doc.fillColor(DARK)
           .font("Helvetica")
           .fontSize(10)
           .text(record.notes, 62, y + 12, { width: 470, lineGap: 4 });

        y += 70;
      }

      // ── Payment ──────────────────────────────────────────
      if (record.paymentAmount > 0) {
        y += 10;
        doc.moveTo(50, y).lineTo(545, y).strokeColor(LINE).lineWidth(1).stroke();
        y += 14;

        doc.fillColor(GRAY)
           .font("Helvetica")
           .fontSize(10)
           .text("Consultation Fee:", 50, y);

        doc.fillColor(PURPLE)
           .font("Helvetica-Bold")
           .fontSize(12)
           .text(`₹${record.paymentAmount}`, 200, y);

        y += 20;
      }

      // ── Footer ───────────────────────────────────────────
      doc.rect(0, 780, 595, 62).fill("#f9fafb");

      doc.fillColor(GRAY)
         .font("Helvetica")
         .fontSize(8)
         .text(
           "This prescription was generated digitally by UHCS — Unified Health Care System.",
           50, 792, { align: "center", width: 495 }
         );

      doc.fillColor(GRAY)
         .font("Helvetica")
         .fontSize(8)
         .text(
           `Record ID: ${record._id}   ·   Generated: ${new Date().toLocaleString("en-IN")}`,
           50, 808, { align: "center", width: 495 }
         );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};