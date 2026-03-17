import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import cloudinary from "../config/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";
import { prescriptionEmail } from "../utils/emailTemplates.js";

// ================= SEARCH PATIENT =================
export const searchPatient = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json([]);
    const patients = await User.find({
      role: "patient",
      $or: [
        { uniqueId: { $regex: query, $options: "i" } },
        { email:    { $regex: query, $options: "i" } },
        { name:     { $regex: query, $options: "i" } },
      ],
    }).select("-password");
    res.status(200).json(patients);
  } catch (error) {
    console.log("SEARCH ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= ADD MEDICAL RECORD =================
export const addMedicalRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, medicines, notes, paymentAmount, visitDate } = req.body;

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    let medicinesArray = [];
    if (medicines) {
      if (Array.isArray(medicines)) {
        medicinesArray = medicines.filter((m) => m.trim());
      } else {
        medicinesArray = medicines.split(",").map((m) => m.trim()).filter((m) => m);
      }
    }

    let uploadedReports = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "uhcs/reports", resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        uploadedReports.push({
          fileUrl:  result.secure_url,
          fileType: file.mimetype,
          fileName: file.originalname,
        });
      }
    }

    const record = await MedicalRecord.create({
      patient:       patientId,
      doctor:        req.user._id,
      diagnosis,
      medicines:     medicinesArray,
      notes,
      reports:       uploadedReports,
      paymentAmount: paymentAmount || 0,
      visitDate:     visitDate || Date.now(),
      recordType:    "system-generated",
    });

    // ── Email prescription to patient (non-blocking) ──────────
    const { subject, html, attachments } = prescriptionEmail(
      patient, req.user, record, null
    );
    sendEmail({ to: patient.email, subject, html, attachments }).catch(() => {});

    res.status(201).json({ message: "Medical record added successfully", record });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET DOCTOR'S OWN RECORDS =================
export const getDoctorRecords = async (req, res) => {
  try {
    const limit   = parseInt(req.query.limit) || 100;
    const records = await MedicalRecord.find({ doctor: req.user._id })
      .populate("patient", "name uniqueId email phone")
      .sort({ createdAt: -1 })
      .limit(limit);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET PATIENT RECORDS =================
export const getPatientRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate("doctor", "name uniqueId specialization")
      .sort({ visitDate: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET DOCTOR STATS =================
export const getDoctorStats = async (req, res) => {
  try {
    const doctorId     = req.user._id;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [totalRecords, thisMonthRecords, patientIds] = await Promise.all([
      MedicalRecord.countDocuments({ doctor: doctorId }),
      MedicalRecord.countDocuments({ doctor: doctorId, createdAt: { $gte: startOfMonth } }),
      MedicalRecord.distinct("patient", { doctor: doctorId }),
    ]);
    res.status(200).json({
      totalRecords,
      thisMonthRecords,
      totalPatients: patientIds.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET PATIENT FULL PROFILE =================
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.params.patientId).select("-password");
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate("doctor",  "name uniqueId specialization")
      .populate("patient", "name uniqueId email phone")
      .sort({ visitDate: -1, createdAt: -1 });
    res.status(200).json({ patient, records });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET MY PATIENTS =================
export const getMyPatients = async (req, res) => {
  try {
    const patientIds = await MedicalRecord.distinct("patient", { doctor: req.user._id });
    const patients = await User.find({ _id: { $in: patientIds } })
      .select("name email phone uniqueId createdAt")
      .sort({ name: 1 });
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};