import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✔ doctor is optional now (for imported records)
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    diagnosis: {
      type: String,
      required: true,
    },

    medicines: [
      {
        type: String,
      },
    ],

    notes: {
      type: String,
    },

    reports: [
      {
        fileUrl: { type: String },
        fileType: { type: String },
        fileName: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    paymentAmount: {
      type: Number,
      default: 0,
    },

    visitDate: {
      type: Date,
      default: Date.now,
    },

    recordType: {
      type: String,
      enum: ["system-generated", "imported"],
      default: "system-generated",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MedicalRecord", medicalRecordSchema);