import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import cloudinary from "../config/cloudinary.js";

// ─── Generate signed Cloudinary URL (fixes 401 on PDFs) ───────
const getSignedUrl = (url) => {
  try {
    if (!url) return url;

    // Extract public_id from full Cloudinary URL
    // e.g. https://res.cloudinary.com/demo/raw/upload/v123/uhcs/imported-reports/file.pdf
    const regex = /\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+)$/;
    const match = url.match(regex);
    if (!match) return url;

    const publicIdWithExt = match[1]; // uhcs/imported-reports/file.pdf
    const ext             = publicIdWithExt.split(".").pop(); // pdf
    const publicId        = publicIdWithExt.replace(`.${ext}`, ""); // uhcs/imported-reports/file
    const isPdf           = ext === "pdf";

    return cloudinary.url(publicId, {
      resource_type: isPdf ? "raw" : "image",
      format:        ext,
      sign_url:      true,
      secure:        true,
      expires_at:    Math.floor(Date.now() / 1000) + 3600, // 1 hour
    });
  } catch {
    return url;
  }
};

// ================= GET MY RECORDS =================
export const getMyRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id })
      .populate("doctor", "name uniqueId specialization")
      .sort({ visitDate: -1 });

    const signedRecords = records.map((record) => {
      const rec = record.toObject();
      rec.reports = (rec.reports || []).map((rep) => ({
        ...rep,
        fileUrl: getSignedUrl(rep.fileUrl),
      }));
      return rec;
    });

    res.status(200).json(signedRecords);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch records", error: error.message });
  }
};

// ================= UPLOAD OLD REPORT =================
export const uploadOldReport = async (req, res) => {
  try {
    const { notes, visitDate } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    let uploadedReports = [];

    for (const file of req.files) {
      const isPdf        = file.mimetype === "application/pdf";
      const isImage      = file.mimetype.startsWith("image/");
      const resourceType = isPdf ? "raw" : isImage ? "image" : "raw";

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "uhcs/imported-reports", resource_type: resourceType },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      uploadedReports.push({
        fileUrl:    result.secure_url,
        fileType:   file.mimetype,
        fileName:   file.originalname,
        uploadedAt: new Date(),
      });
    }

    const record = await MedicalRecord.create({
      patient:       req.user._id,
      doctor:        null,
      diagnosis:     "Imported Record",
      medicines:     [],
      notes:         notes || "Patient uploaded past report",
      reports:       uploadedReports,
      visitDate:     visitDate || Date.now(),
      paymentAmount: 0,
      recordType:    "imported",
    });

    res.status(201).json({ message: "Old report uploaded successfully", record });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload report", error: error.message });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// ================= GET PAYMENT HISTORY =================
export const getPaymentHistory = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patient:       req.user._id,
      paymentAmount: { $gt: 0 },
    })
      .populate("doctor", "name specialization uniqueId")
      .select("doctor diagnosis paymentAmount visitDate")
      .sort({ visitDate: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment history", error: error.message });
  }
};

// ================= GET PATIENT STATS =================
export const getPatientStats = async (req, res) => {
  try {
    const records      = await MedicalRecord.find({ patient: req.user._id });
    const totalRecords = records.length;
    const totalSpent   = records.reduce((sum, r) => sum + (r.paymentAmount || 0), 0);
    const totalDoctors = [...new Set(records.map((r) => r.doctor?.toString()).filter(Boolean))].length;
    res.status(200).json({ totalRecords, totalSpent, totalDoctors });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};