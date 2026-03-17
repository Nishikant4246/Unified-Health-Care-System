import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";



const app = express();

// Connect Database
connectDB();

// ✅ These TWO lines MUST be before routes
app.use(cors());
app.use(express.json());          // ← parses JSON body
app.use(express.urlencoded({ extended: true }));  // ← add this line also

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patient", patientRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Unified Healthcare API Running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Hey! Server running on port N's ${PORT}`);
});