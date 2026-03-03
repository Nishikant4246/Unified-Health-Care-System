import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate Unique ID
const generateUniqueId = async (role) => {
  const prefix = role === "doctor" ? "DOC" : "PAT";
  const count = await User.countDocuments({ role });
  const number = String(count + 1).padStart(4, "0");
  return `${prefix}${number}`;
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= DOCTOR SELF REGISTER =================
export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
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
      specialization,
      status: "pending",
    });

    res.status(201).json({
      message: "Doctor registered. Waiting for admin approval.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

    // 🔥 BLOCK PENDING DOCTOR
    if (user.role === "doctor" && user.status !== "approved") {
      return res.status(403).json({
        message: "Your account is pending admin approval",
      });
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET ME =================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};