import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import cloudinary from "../config/cloudinary.js";

// GET /api/doctor/search-patient/:uniqueId
export const searchPatient = async (req, res) => {
  try {
    const { uniqueId } = req.params; // ← fixed from req.query

    const patient = await User.findOne({
      role: "patient",
      $or: [{ uniqueId }, { email: uniqueId }],
    }).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/doctor/add-record
export const addMedicalRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, medicines, notes, paymentAmount, visitDate } =
      req.body;

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    // ← fixed: handle comma-separated string OR array OR empty
    let medicinesArray = [];
    if (medicines) {
      if (Array.isArray(medicines)) {
        medicinesArray = medicines.filter(m => m.trim());
      } else {
        medicinesArray = medicines
          .split(",")
          .map(m => m.trim())
          .filter(m => m);
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
          fileUrl: result.secure_url,
          fileType: file.mimetype,
          fileName: file.originalname,
        });
      }
    }

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user._id,
      diagnosis,
      medicines: medicinesArray,
      notes,
      reports: uploadedReports,
      paymentAmount: paymentAmount || 0,
      visitDate: visitDate || Date.now(),
      recordType: "system-generated",
    });

    res.status(201).json({
      message: "Medical record added successfully",
      record,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/doctor/my-records
export const getDoctorRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ doctor: req.user._id })
      .populate("patient", "name uniqueId email")
      .sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/doctor/patient-records/:patientId
export const getPatientRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patient: req.params.patientId,
    })
      .populate("doctor", "name uniqueId specialization")
      .sort({ visitDate: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};