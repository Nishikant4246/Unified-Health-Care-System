import bcrypt from "bcryptjs";
import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";
import sendEmail from "../utils/sendEmail.js";

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
    await sendEmail({
      to: doctor.email,
      subject: "UHCS – Your Doctor Account is Approved",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #16a34a; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Account Approved</h1>
            <p style="color: #bbf7d0; margin: 6px 0 0;">Unified Health Care System</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Dear <strong>Dr. ${doctor.name}</strong>,</p>
            <p style="font-size: 15px; color: #374151;">Your doctor account has been created and approved by the admin. You can now log in to UHCS.</p>
            <table style="width: 100%; background: #f9fafb; border-radius: 6px; padding: 16px; margin: 20px 0; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #6b7280;">Doctor ID</td><td style="padding: 6px 0;"><strong>${doctor.uniqueId}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0;"><strong>${doctor.email}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Specialization</td><td style="padding: 6px 0;"><strong>${doctor.specialization}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Status</td><td style="padding: 6px 0;"><strong style="color: #16a34a;">Approved</strong></td></tr>
            </table>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" style="background-color: #16a34a; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px;">Login to UHCS</a>
            </div>
          </div>
        </div>
      `,
    });

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
    await sendEmail({
      to: doctor.email,
      subject: "UHCS – Your Account Has Been Approved",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #16a34a; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Account Approved ✓</h1>
            <p style="color: #bbf7d0; margin: 6px 0 0;">Unified Health Care System</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Dear <strong>Dr. ${doctor.name}</strong>,</p>
            <p style="font-size: 15px; color: #374151;">Great news! Your doctor account on UHCS has been <strong>approved</strong>. You can now log in and start using the system.</p>
            <table style="width: 100%; background: #f9fafb; border-radius: 6px; padding: 16px; margin: 20px 0; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #6b7280;">Doctor ID</td><td style="padding: 6px 0;"><strong>${doctor.uniqueId}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Specialization</td><td style="padding: 6px 0;"><strong>${doctor.specialization}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Hospital</td><td style="padding: 6px 0;"><strong>${doctor.hospital}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Status</td><td style="padding: 6px 0;"><strong style="color: #16a34a;">Approved</strong></td></tr>
            </table>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" style="background-color: #16a34a; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px;">Login to UHCS</a>
            </div>
          </div>
        </div>
      `,
    });

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
    await sendEmail({
      to: doctor.email,
      subject: "UHCS – Your Account Has Been Approved via NMC Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #16a34a; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Account Approved ✓</h1>
            <p style="color: #bbf7d0; margin: 6px 0 0;">NMC Verified – Unified Health Care System</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Dear <strong>Dr. ${doctor.name}</strong>,</p>
            <p style="font-size: 15px; color: #374151;">Your doctor account has been approved following successful <strong>NMC verification</strong>. You can now log in to UHCS.</p>
            <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #15803d;">NMC Registration No: <strong>${nmcData.registrationNo || "N/A"}</strong></p>
            </div>
            <table style="width: 100%; background: #f9fafb; border-radius: 6px; padding: 16px; margin: 20px 0; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #6b7280;">Doctor ID</td><td style="padding: 6px 0;"><strong>${doctor.uniqueId}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Specialization</td><td style="padding: 6px 0;"><strong>${doctor.specialization}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Status</td><td style="padding: 6px 0;"><strong style="color: #16a34a;">Approved</strong></td></tr>
            </table>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" style="background-color: #16a34a; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px;">Login to UHCS</a>
            </div>
          </div>
        </div>
      `,
    });

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
    await sendEmail({
      to: doctor.email,
      subject: "UHCS – Your Account Has Been Suspended",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #dc2626; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Account Suspended</h1>
            <p style="color: #fecaca; margin: 6px 0 0;">Unified Health Care System</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Dear <strong>Dr. ${doctor.name}</strong>,</p>
            <p style="font-size: 15px; color: #374151;">We regret to inform you that your UHCS doctor account has been <strong>suspended</strong>.</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0 0 6px; font-size: 14px; color: #991b1b;"><strong>Reason for suspension:</strong></p>
              <p style="margin: 0; font-size: 14px; color: #7f1d1d;">${doctor.suspendedReason}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">If you believe this is a mistake or wish to appeal, please contact the UHCS admin team.</p>
            <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 24px;">This is an automated notification from UHCS.</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: "Doctor suspended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= REINSTATE DOCTOR =================
// NOTE: Add this route if you have a reinstate endpoint.
// If you currently use approveDoctor to reinstate, the email there already covers it.
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
    await sendEmail({
      to: doctor.email,
      subject: "UHCS – Your Account Has Been Reinstated",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f766e; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Account Reinstated ✓</h1>
            <p style="color: #ccfbf1; margin: 6px 0 0;">Unified Health Care System</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Dear <strong>Dr. ${doctor.name}</strong>,</p>
            <p style="font-size: 15px; color: #374151;">Your UHCS doctor account has been <strong>reinstated</strong>. You now have full access to the system again.</p>
            <table style="width: 100%; background: #f9fafb; border-radius: 6px; padding: 16px; margin: 20px 0; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #6b7280;">Doctor ID</td><td style="padding: 6px 0;"><strong>${doctor.uniqueId}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280;">Status</td><td style="padding: 6px 0;"><strong style="color: #16a34a;">Active</strong></td></tr>
            </table>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" style="background-color: #0f766e; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px;">Login to UHCS</a>
            </div>
          </div>
        </div>
      `,
    });

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