import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
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
    },

    phone: {
      type: String,
    },

    specialization: {
      type: String,
    },

    // 🔥 NEW FIELD
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: function () {
        return this.role === "doctor" ? "pending" : "approved";
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);