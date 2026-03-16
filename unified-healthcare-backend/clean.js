import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import MedicalRecord from "./src/models/MedicalRecord.js";

dotenv.config();

const cleanDatabase = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // delete doctors and patients
    await User.deleteMany({ role: { $in: ["doctor", "patient"] } });

    // delete all medical records
    await MedicalRecord.deleteMany({});

    console.log("Doctors deleted");
    console.log("Patients deleted");
    console.log("Medical records deleted");
    console.log("Admin kept safe");

    process.exit();

  } catch (error) {

    console.error("Error:", error.message);
    process.exit(1);

  }
};

cleanDatabase();