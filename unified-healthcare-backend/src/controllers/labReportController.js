import User from "../models/User.js";
import LabReport from "../models/LabReport.js";
import cloudinary from "../config/cloudinary.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

// ─── Signed Cloudinary URL (mirrors patientController's helper) ───
// Lab report files live in a private folder; hand out 1-hour signed links.
const getSignedUrl = (url) => {
  try {
    if (!url) return url;
    const match = url.match(/\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return url;
    const publicIdWithExt = match[1];
    const ext = publicIdWithExt.split(".").pop();
    const publicId = publicIdWithExt.replace(`.${ext}`, "");
    const isPdf = ext === "pdf";
    return cloudinary.url(publicId, {
      resource_type: isPdf ? "raw" : "image",
      format: ext,
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
  } catch {
    return url;
  }
};

const signReport = (doc) => {
  const r = doc.toObject ? doc.toObject() : doc;
  if (r.file?.fileUrl) r.file = { ...r.file, fileUrl: getSignedUrl(r.file.fileUrl) };
  return r;
};

// ================= DOCTOR: ADD LAB REPORT =================
// POST /api/doctor/lab-reports/:patientId   (multipart, field "file")
export const addLabReport = async (req, res) => {
  try {
    const patient = await User.findById(req.params.patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Please attach a report file (JPEG, PNG or PDF)" });
    }

    const { title, testDate, notes } = req.body;

    let when = null;
    if (testDate) {
      const d = new Date(testDate);
      if (isNaN(d.getTime()) || d > new Date()) {
        return res.status(400).json({ message: "Enter a valid test date" });
      }
      when = d;
    }

    const uploaded = await uploadBufferToCloudinary(req.file, "uhcs/lab-reports");

    const report = await LabReport.create({
      patient: patient._id,
      doctor: req.user._id,
      title: (title || "").trim().slice(0, 150),
      testDate: when || Date.now(),
      notes: (notes || "").trim().slice(0, 2000),
      file: {
        fileUrl: uploaded.secure_url,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
      },
    });

    const populated = await report.populate("doctor", "name uniqueId specialization");
    res.status(201).json({ message: "Lab report added", report: signReport(populated) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= DOCTOR: LIST A PATIENT'S LAB REPORTS =================
// GET /api/doctor/lab-reports/:patientId
export const getPatientLabReports = async (req, res) => {
  try {
    const reports = await LabReport.find({ patient: req.params.patientId })
      .populate("doctor", "name uniqueId specialization")
      .sort({ testDate: -1, createdAt: -1 });
    res.status(200).json(reports.map(signReport));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= DOCTOR: LIST LAB REPORTS I UPLOADED =================
// GET /api/doctor/lab-reports
export const getMyUploadedLabReports = async (req, res) => {
  try {
    const reports = await LabReport.find({ doctor: req.user._id })
      .populate("patient", "name uniqueId email phone")
      .sort({ testDate: -1, createdAt: -1 });
    res.status(200).json(reports.map(signReport));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= PATIENT: LIST MY LAB REPORTS =================
// GET /api/patient/lab-reports
export const getMyLabReports = async (req, res) => {
  try {
    const reports = await LabReport.find({ patient: req.user._id })
      .populate("doctor", "name uniqueId specialization")
      .sort({ testDate: -1, createdAt: -1 });
    res.status(200).json(reports.map(signReport));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lab reports", error: error.message });
  }
};
