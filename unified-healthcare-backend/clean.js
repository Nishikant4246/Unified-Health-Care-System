import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import MedicalRecord from "./src/models/MedicalRecord.js";

dotenv.config();

const cleanDB = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // remove doctors and patients
    await User.deleteMany({ role: { $in: ["doctor", "patient"] } });

    // remove records
    await MedicalRecord.deleteMany({});

    console.log("Database cleaned (Admin kept)");

    process.exit();

  } catch (error) {

    console.error(error);
    process.exit(1);

  }
};

cleanDB();