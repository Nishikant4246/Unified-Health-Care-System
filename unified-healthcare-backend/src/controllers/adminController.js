import bcrypt from "bcryptjs";
import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import sendEmail from "../utils/sendEmail.js";
import {
  doctorCreatedByAdminEmail,
  doctorApprovedEmail,
  doctorApprovedViaNMCEmail,
  doctorSuspendedEmail,
  doctorReinstatedEmail,
} from "../utils/emailTemplates.js";

// ─── Utility: Generate Unique ID ─────────────────────────────
const generateUniqueId = async (role) => {
  const prefix = role === "doctor" ? "DOC" : "PAT";
  const count = await User.countDocuments({ role });
  const number = String(count + 1).padStart(4, "0");
  return `${prefix}${number}`;
};

// ================= DASHBOARD STATS =================
export const getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({
      role: "doctor",
      status: "approved",
    });
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalRecords = await MedicalRecord.countDocuments();
    const pendingDoctors = await User.countDocuments({
      role: "doctor",
      status: "pending",
    });

    res.status(200).json({
      totalDoctors,
      totalPatients,
      totalRecords,
      pendingDoctors,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= CREATE DOCTOR (ADMIN DIRECT) =================
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      specialization,
      qualification,
      licenseNumber,
      experience,
      hospital,
      consultationFee,
      bio,
      education,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueId = await generateUniqueId("doctor");

    const doctor = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
      uniqueId,
      phone,
      gender: gender || "",
      specialization: specialization || "",
      qualification: qualification || "",
      licenseNumber: licenseNumber || "",
      experience: Number(experience) || 0,
      hospital: hospital || "",
      consultationFee: Number(consultationFee) || 0,
      bio: bio || "",
      education: Array.isArray(education) ? education : [],
      status: "approved",
      verificationMethod: "admin",
      adminVerifiedBy: req.user._id,
      verifiedAt: new Date(),
    });

    // ── Email: Account approved (admin-created doctor) ────
    const { subject, html } = doctorCreatedByAdminEmail(doctor);
    await sendEmail({ to: doctor.email, subject, html });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        uniqueId: doctor.uniqueId,
        specialization: doctor.specialization,
        status: doctor.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET ALL DOCTORS =================
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET PENDING DOCTORS =================
export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: "doctor",
      status: "pending",
    }).select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= APPROVE DOCTOR (ADMIN MANUAL) =================
export const approveDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.status = "approved";
    doctor.verificationMethod = "admin";
    doctor.adminVerifiedBy = req.user._id;
    doctor.verifiedAt = new Date();
    doctor.suspendedReason = "";
    await doctor.save();

    // ── Email: Account approved ───────────────────────────
    const { subject, html } = doctorApprovedEmail(doctor);
    await sendEmail({ to: doctor.email, subject, html });

    res.status(200).json({ message: "Doctor approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= APPROVE DOCTOR VIA NMC =================
export const approveDoctorViaNMC = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const { nmcData } = req.body;

    doctor.status = "approved";
    doctor.verificationMethod = "nmc";
    doctor.nmcVerified = true;
    doctor.nmcData = {
      doctorName: nmcData.doctorName || "",
      registrationNo: nmcData.registrationNo || "",
      stateMedicalCouncil: nmcData.stateMedicalCouncil || "",
      qualification: nmcData.qualification || "",
      checkedAt: new Date(),
    };
    doctor.verifiedAt = new Date();
    doctor.suspendedReason = "";
    await doctor.save();

    // ── Email: Approved via NMC ───────────────────────────
    const { subject, html } = doctorApprovedViaNMCEmail(doctor, nmcData);
    await sendEmail({ to: doctor.email, subject, html });

    res.status(200).json({ message: "Doctor approved via NMC verification" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= SUSPEND DOCTOR =================
export const suspendDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const { reason } = req.body;

    doctor.status = "suspended";
    doctor.suspendedReason = reason || "Suspended by admin";
    await doctor.save();

    // ── Email: Account suspended ──────────────────────────
    const { subject, html } = doctorSuspendedEmail(doctor);
    await sendEmail({ to: doctor.email, subject, html });

    res.status(200).json({ message: "Doctor suspended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= REINSTATE DOCTOR =================
export const reinstateDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.status = "approved";
    doctor.suspendedReason = "";
    await doctor.save();

    // ── Email: Account reinstated ─────────────────────────
    const { subject, html } = doctorReinstatedEmail(doctor);
    await sendEmail({ to: doctor.email, subject, html });

    res.status(200).json({ message: "Doctor reinstated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= NMC CHECK =================
export const verifyDoctorNMC = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: "Doctor name required" });
    }

    let results = [];
    let reachable = true;

    try {
      const response = await fetch(
        `https://www.nmc.org.in/MCIRest/open/getPaginatedData?service=getDoctorOrHospitalByName&doctor=${encodeURIComponent(
          name.trim()
        )}&pageNo=0&pageSize=10`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        results = data?.content || [];
      } else {
        reachable = false;
      }
    } catch {
      reachable = false;
    }

    res.status(200).json({
      found: results.length > 0,
      reachable,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET ALL PATIENTS =================
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET DOCTOR PROFILE =================
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id)
      .select("-password")
      .populate("adminVerifiedBy", "name");

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const totalRecords = await MedicalRecord.countDocuments({
      doctor: req.params.id,
    });

    const recentPatients = await MedicalRecord.find({ doctor: req.params.id })
      .populate("patient", "name uniqueId phone")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("diagnosis visitDate patient");

    res.status(200).json({ doctor, totalRecords, recentPatients });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET PATIENT PROFILE =================
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select("-password");

    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    const records = await MedicalRecord.find({ patient: req.params.id })
      .populate("doctor", "name uniqueId specialization")
      .sort({ visitDate: -1 })
      .select("diagnosis medicines notes visitDate paymentAmount doctor");

    res.status(200).json({
      patient,
      totalRecords: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};