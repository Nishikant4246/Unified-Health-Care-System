import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";                                    // NEW
import { patientWelcomeEmail, doctorWelcomeEmail } from "../utils/emailTemplates.js"; // NEW

// Generate Unique ID
const generateUniqueId = async (role) => {
  const prefix = role === "doctor" ? "DOC" : "PAT";

  const lastUser = await User.findOne({ role })
    .sort({ createdAt: -1 })
    .select("uniqueId");

  let nextNumber = 1;

  if (lastUser && lastUser.uniqueId) {
    const lastNumber = parseInt(lastUser.uniqueId.replace(prefix, ""));
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const emailPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const phonePattern = /^[6-9]\d{9}$/;

const validateRegistration = ({ name, email, password, phone }) => {
  if (typeof name !== "string" || name.trim().length < 3 || name.trim().length > 100) {
    return "Name must be between 3 and 100 characters";
  }
  if (typeof email !== "string" || email.length > 254 || !emailPattern.test(email)) {
    return "Enter a valid email address using English letters and numbers";
  }
  if (typeof password !== "string" || password.length < 6 || password.length > 128 || /\s/.test(password)) {
    return "Password must be 6-128 characters and cannot contain spaces";
  }
  if (typeof phone !== "string" || !phonePattern.test(phone)) {
    return "Enter a valid 10-digit Indian mobile number";
  }
  return null;
};

// ================= PATIENT REGISTER =================
export const registerPatient = async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : req.body.name;
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : req.body.email;
    const password = req.body.password;
    const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : req.body.phone;

    const validationError = validateRegistration({ name, email, password, phone });
    if (validationError) return res.status(400).json({ message: validationError });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueId = await generateUniqueId("patient");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "patient",
      uniqueId,
      phone,
      status: "approved",
    });

    // ── Welcome email (non-blocking) ──────────────────────────── NEW
    const { subject, html } = patientWelcomeEmail(user);
    sendEmail({ to: user.email, subject, html }).catch(() => {});

    res.status(201).json({
      message: "Patient registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        uniqueId: user.uniqueId,
      },
    });

  } catch (error) {
    console.log("REGISTER PATIENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DOCTOR SELF REGISTER =================
export const registerDoctor = async (req, res) => {
  try {
    const {
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
    const name = typeof req.body.name === "string" ? req.body.name.trim() : req.body.name;
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : req.body.email;
    const password = req.body.password;
    const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : req.body.phone;

    const validationError = validateRegistration({ name, email, password, phone });
    if (validationError) return res.status(400).json({ message: validationError });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (!specialization || !qualification || !licenseNumber || !hospital) {
      return res.status(400).json({
        message: "Specialization, qualification, license number and hospital are required",
      });
    }
    if (!Number.isFinite(Number(experience)) || Number(experience) < 0 || Number(experience) > 80) {
      return res.status(400).json({ message: "Enter valid years of experience between 0 and 80" });
    }
    if (consultationFee !== undefined && consultationFee !== "" &&
      (!Number.isFinite(Number(consultationFee)) || Number(consultationFee) < 0)) {
      return res.status(400).json({ message: "Enter a valid consultation fee" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueId = await generateUniqueId("doctor");

    const doctor = await User.create({                                   // NEW: capture in variable
      name,
      email,
      password: hashedPassword,
      role: "doctor",
      uniqueId,
      phone,
      gender: gender || "",
      specialization,
      qualification,
      licenseNumber,
      experience: Number(experience) || 0,
      hospital,
      consultationFee: Number(consultationFee) || 0,
      bio: bio || "",
      education: Array.isArray(education) ? education : [],
      status: "pending",
    });

    // ── Welcome email — pending notice (non-blocking) ─────────── NEW
    const { subject, html } = doctorWelcomeEmail(doctor);
    sendEmail({ to: doctor.email, subject, html }).catch(() => {});

    res.status(201).json({
      message: "Doctor registration submitted. Waiting for admin approval.",
    });

  } catch (error) {
    console.log("REGISTER DOCTOR ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN ================= (unchanged)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ── Doctor status checks ─────────────────────────────
    if (user.role === "doctor") {

      if (user.status === "pending") {
        return res.status(403).json({
          message: "Your account is pending admin approval",
        });
      }

      if (user.status === "suspended") {
        return res.status(403).json({
          message: `Your account has been suspended. Reason: ${user.suspendedReason || "Contact admin"}`,
        });
      }

    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        uniqueId: user.uniqueId,
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ME ================= (unchanged)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("GET ME ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};