import express from "express";
import {
  getDashboardStats,
  createDoctor,
  getAllDoctors,
  getPendingDoctors,
  approveDoctor,
  approveDoctorViaNMC,
  suspendDoctor,
  verifyDoctorNMC,
  getAllPatients,
  deleteUser,
  getDoctorProfile,
  getPatientProfile,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));

// Dashboard
router.get("/stats", getDashboardStats);

// Doctor management
router.post("/create-doctor", createDoctor);
router.get("/doctors", getAllDoctors);
router.get("/pending-doctors", getPendingDoctors);
router.put("/approve-doctor/:id", approveDoctor);
router.put("/approve-doctor-nmc/:id", approveDoctorViaNMC);
router.put("/suspend-doctor/:id", suspendDoctor);
router.get("/verify-nmc", verifyDoctorNMC);

// Patient management
router.get("/patients", getAllPatients);

// Shared
router.delete("/user/:id", deleteUser);
router.get("/doctor/:id", getDoctorProfile);
router.get("/patient/:id", getPatientProfile);

export default router;