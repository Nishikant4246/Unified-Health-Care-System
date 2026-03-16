import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import MedicalRecord from "./src/models/MedicalRecord.js";

dotenv.config();

const seed = async () => {

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");

  // Doctor
  const doctorPassword = await bcrypt.hash("nishikant",10);

  const doctor = await User.create({
    name: "Nishikant V Kshirsagar",
    email: "nishikantkshirsagar22@gmail.com",
    password: doctorPassword,
    role: "doctor",
    uniqueId: "DOC001",
    phone: "9325934246",
    specialization: "General Physician",
    status: "approved"
  });

  console.log("Doctor created:", doctor.name);

  const diagnoses = [
    "Viral Fever",
    "Diabetes",
    "Asthma",
    "Hypertension",
    "Back Pain"
  ];

  for (let i = 1; i <= 20; i++) {

    const patientPassword = await bcrypt.hash(`patient${i}`,10);

    const patientId = `PAT${i.toString().padStart(4,"0")}`;

    const patient = await User.create({
      name: `Patient ${i}`,
      email: `patient${i}@uhcs.com`,
      password: patientPassword,
      role: "patient",
      uniqueId: patientId,
      phone: "9325934246"
    });

    await MedicalRecord.create({
      patient: patient._id,
      doctor: doctor._id,
      diagnosis: diagnoses[i % diagnoses.length],
      medicines: ["Paracetamol"],
      notes: "Initial consultation",
      paymentAmount: 500
    });

  }

  console.log("20 patients created with medical records");

  process.exit();
};

seed();