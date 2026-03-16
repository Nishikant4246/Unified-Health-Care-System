import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

// ================= PATIENT REGISTER =================
export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

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

    if (!specialization || !qualification || !licenseNumber || !hospital) {
      return res.status(400).json({
        message: "Specialization, qualification, license number and hospital are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueId = await generateUniqueId("doctor");

    await User.create({
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

// ================= GET ME =================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("GET ME ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};