import mongoose from "mongoose";

/**
 * Lab Reports — a dedicated section, fully independent of MedicalRecord.
 * A doctor uploads one file per report and it is linked to the patient
 * and to the uploading doctor. Nothing here touches prescriptions,
 * appointments or the existing medical-records workflow.
 */
const labReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    testDate: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    file: {
      fileUrl: { type: String, required: true },
      fileType: { type: String },
      fileName: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("LabReport", labReportSchema);
