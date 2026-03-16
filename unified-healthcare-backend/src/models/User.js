import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
  degree: { type: String },
  institution: { type: String },
  year: { type: String },
}, { _id: false });

const nmcDataSchema = new mongoose.Schema({
  doctorName: { type: String },
  registrationNo: { type: String },
  stateMedicalCouncil: { type: String },
  qualification: { type: String },
  checkedAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    // ─── Common Fields ───────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      required: true,
    },
    uniqueId: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    // ─── Status & Verification ───────────────────────────────
    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: function () {
        return this.role === "doctor" ? "pending" : "approved";
      },
    },

    // tracks HOW the doctor was verified
    verificationMethod: {
      type: String,
      enum: ["admin", "nmc", null],
      default: null,
    },

    // NMC auto-verification fields
    nmcVerified: {
      type: Boolean,
      default: false,
    },
    nmcData: {
      type: nmcDataSchema,
      default: null,
    },

    // Admin manual verification fields
    adminVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },

    // Suspension reason if suspended
    suspendedReason: {
      type: String,
      default: "",
    },

    // ─── Doctor-Only Fields ──────────────────────────────────
    specialization: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      min: 0,
      default: 0,
    },
    hospital: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    available: {
      type: Boolean,
      default: true,
    },

    // ─── Patient-Only Fields ─────────────────────────────────
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
      default: "",
    },
    address: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    allergies: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);