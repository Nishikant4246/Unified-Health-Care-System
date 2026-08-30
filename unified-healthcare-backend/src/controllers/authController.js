import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";                                    // NEW
import {
  patientWelcomeEmail,
  doctorWelcomeEmail,
  passwordResetEmail,
} from "../utils/emailTemplates.js"; // NEW
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";       // NEW

// Read lazily at request time so the value is whatever the host set,
// regardless of module-load / dotenv ordering.
const frontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

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

    // ── Date of birth (required) + optional height / weight ──
    const { dateOfBirth, heightCm, weightKg } = req.body;
    if (!dateOfBirth) {
      return res.status(400).json({ message: "Date of birth is required" });
    }
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()) || dob > new Date() || dob < new Date("1900-01-01")) {
      return res.status(400).json({ message: "Enter a valid date of birth" });
    }

    let heightVal = null;
    if (heightCm !== undefined && heightCm !== null && heightCm !== "") {
      const h = Number(heightCm);
      if (!Number.isFinite(h) || h < 30 || h > 300) {
        return res.status(400).json({ message: "Enter a valid height in cm (30–300)" });
      }
      heightVal = h;
    }

    let weightVal = null;
    if (weightKg !== undefined && weightKg !== null && weightKg !== "") {
      const w = Number(weightKg);
      if (!Number.isFinite(w) || w < 1 || w > 600) {
        return res.status(400).json({ message: "Enter a valid weight in kg (1–600)" });
      }
      weightVal = w;
    }

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
      dateOfBirth: dob,
      heightCm: heightVal,
      weightKg: weightVal,
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

    // education arrives as a JSON string when the form is sent as multipart/form-data
    let educationList = Array.isArray(education) ? education : [];
    if (typeof education === "string") {
      try {
        const parsed = JSON.parse(education);
        educationList = Array.isArray(parsed) ? parsed : [];
      } catch {
        educationList = [];
      }
    }

    // Uploaded proof of medical license (image or PDF) — required for self-registration
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a photo or PDF of your medical license for verification",
      });
    }
    const uploadedLicense = await uploadBufferToCloudinary(req.file, "uhcs/licenses");
    const licenseImage = {
      url:        uploadedLicense.secure_url,
      publicId:   uploadedLicense.public_id,
      fileType:   req.file.mimetype,
      uploadedAt: new Date(),
    };

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
      licenseImage,
      experience: Number(experience) || 0,
      hospital,
      consultationFee: Number(consultationFee) || 0,
      bio: bio || "",
      education: educationList,
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

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    // normalise the same way registration does, so case / spaces never block a login
    const email = typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : req.body.email;
    const password = req.body.password;

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

// ================= REFRESH TOKEN =================
// Sliding session: a still-valid token is swapped for a fresh 7-day one.
// Called by the app on load, so an active user never gets logged out mid-use;
// an inactive user's token still expires after 7 days.
export const refreshToken = (req, res) => {
  res.status(200).json({ token: generateToken(req.user._id) });
};

const hashResetToken = (raw) =>
  crypto.createHash("sha256").update(String(raw)).digest("hex");

// ================= FORGOT PASSWORD =================
// Emails a one-time reset link. Always responds the same way so it never
// reveals which addresses are registered.
export const forgotPassword = async (req, res) => {
  const genericResponse = {
    message: "If that email is registered, a password reset link has been sent.",
  };
  try {
    const email = typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
    if (!email) return res.status(200).json(genericResponse);

    const user = await User.findOne({ email });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = hashResetToken(rawToken);
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      await user.save();

      const link = `${frontendUrl()}/reset-password/${rawToken}`;
      const { subject, html } = passwordResetEmail(user, link);
      // Awaited so the server log records the real outcome; the HTTP response
      // stays generic either way so we never reveal which emails are registered.
      const result = await sendEmail({ to: user.email, subject, html });
      if (!result.ok) {
        console.error(
          `FORGOT PASSWORD: reset link for ${user.email} could NOT be emailed —`,
          result.error,
        );
      }
    }

    res.status(200).json(genericResponse);
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);
    res.status(200).json(genericResponse); // still don't leak anything
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const password = req.body.password;

    if (typeof password !== "string" || password.length < 6 || password.length > 128 || /\s/.test(password)) {
      return res.status(400).json({
        message: "Password must be 6-128 characters and cannot contain spaces",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: hashResetToken(token),
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password updated. You can now sign in." });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};