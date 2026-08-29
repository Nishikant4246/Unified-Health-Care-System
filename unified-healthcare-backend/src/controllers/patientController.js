import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import cloudinary from "../config/cloudinary.js";

// ─── Generate signed Cloudinary URL ───────────────────────────
const getSignedUrl = (url) => {
  try {
    if (!url) return url;
    const regex = /\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+)$/;
    const match = url.match(regex);
    if (!match) return url;
    const publicIdWithExt = match[1];
    const ext             = publicIdWithExt.split(".").pop();
    const publicId        = publicIdWithExt.replace(`.${ext}`, "");
    const isPdf           = ext === "pdf";
    return cloudinary.url(publicId, {
      resource_type: isPdf ? "raw" : "image",
      format:        ext,
      sign_url:      true,
      secure:        true,
      expires_at:    Math.floor(Date.now() / 1000) + 3600,
    });
  } catch {
    return url;
  }
};

// ─── Haversine distance (km) ───────────────────────────────────
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
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
          (error, result) => { if (error) reject(error); else resolve(result); }
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
    const { name, phone, dateOfBirth, heightCm, weightKg } = req.body;

    // Only touch fields that were actually sent — keeps everything else intact
    const update = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;

    if (dateOfBirth !== undefined) {
      if (!dateOfBirth) {
        update.dateOfBirth = null;
      } else {
        const d = new Date(dateOfBirth);
        if (isNaN(d.getTime()) || d > new Date() || d < new Date("1900-01-01")) {
          return res.status(400).json({ message: "Enter a valid date of birth" });
        }
        update.dateOfBirth = d;
      }
    }

    if (heightCm !== undefined) {
      if (heightCm === "" || heightCm === null) {
        update.heightCm = null;
      } else {
        const h = Number(heightCm);
        if (!Number.isFinite(h) || h < 30 || h > 300) {
          return res.status(400).json({ message: "Enter a valid height in cm (30–300)" });
        }
        update.heightCm = h;
      }
    }

    if (weightKg !== undefined) {
      if (weightKg === "" || weightKg === null) {
        update.weightKg = null;
      } else {
        const w = Number(weightKg);
        if (!Number.isFinite(w) || w < 1 || w > 600) {
          return res.status(400).json({ message: "Enter a valid weight in kg (1–600)" });
        }
        update.weightKg = w;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, update, { new: true, runValidators: true }
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
      patient: req.user._id, paymentAmount: { $gt: 0 },
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

// ================= GET NEARBY DOCTORS =================
// Returns approved doctors that have a map location, sorted by distance.
export const getNearbyDoctors = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const patientLat = parseFloat(lat);
    const patientLng = parseFloat(lng);
    const maxRadius  = radius ? parseFloat(radius) : null;

    // $type: "number" already implies the path exists and is a real number
    const doctors = await User.find({
      role:   "doctor",
      status: "approved",
      "location.lat": { $type: "number" },
      "location.lng": { $type: "number" },
    }).select(
      "name specialization qualification experience hospital consultationFee phone location available uniqueId",
    );

    let nearby = doctors
      .map((doc) => ({
        ...doc.toObject(),
        distance: getDistance(patientLat, patientLng, doc.location.lat, doc.location.lng),
      }))
      .sort((a, b) => a.distance - b.distance);

    // Prefer doctors within the requested radius, but never hide every UHCS
    // doctor just because the patient is far away — fall back to the nearest 20.
    if (maxRadius) {
      const within = nearby.filter((d) => d.distance <= maxRadius);
      nearby = within.length > 0 ? within : nearby.slice(0, 20);
    }

    console.log(`Nearby doctors: ${doctors.length} with location, returning ${nearby.length}`);
    res.status(200).json(nearby);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch nearby doctors", error: error.message });
  }
};