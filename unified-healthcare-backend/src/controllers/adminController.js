import bcrypt from "bcryptjs";
import User from "../models/User.js";
import MedicalRecord from "../models/MedicalRecord.js";

// Generate Unique ID
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

    res.status(200).json({
      totalDoctors,
      totalPatients,
      totalRecords,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= CREATE DOCTOR (ADMIN DIRECT) =================
export const createDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization } = req.body;

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
      specialization,
      status: "approved", // admin created = auto approved
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

// ================= APPROVE DOCTOR =================
export const approveDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.status = "approved";
    await doctor.save();

    res.status(200).json({
      message: "Doctor approved successfully",
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