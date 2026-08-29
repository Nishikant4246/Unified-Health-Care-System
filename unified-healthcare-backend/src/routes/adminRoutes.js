import express from "express";
import {
  getDashboardStats,
  createDoctor,
  getAllDoctors,
  getPendingDoctors,
  approveDoctor,
  approveDoctorViaNMC,  // NEW
  suspendDoctor,        // NEW
  reinstateDoctor,      // NEW
  verifyDoctorNMC,      // NEW
  updateDoctorProfile,  // NEW
  getAllPatients,
  deleteUser,
  getDoctorProfile,
  getPatientProfile,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));

// ── Dashboard ─────────────────────────────────
router.get("/stats",                     getDashboardStats);

// ── Doctors ───────────────────────────────────
router.post("/create-doctor",            upload.single("licenseImage"), createDoctor);
router.get("/doctors",                   getAllDoctors);
router.get("/pending-doctors",           getPendingDoctors);
router.put("/approve-doctor/:id",        approveDoctor);
router.put("/approve-doctor-nmc/:id",    approveDoctorViaNMC);  // NEW
router.put("/suspend-doctor/:id",        suspendDoctor);         // NEW
router.put("/reinstate-doctor/:id",      reinstateDoctor);       // NEW
router.get("/verify-nmc",               verifyDoctorNMC);        // NEW
router.put("/doctor/:id/profile",       upload.single("licenseImage"), updateDoctorProfile);  // NEW
router.get("/doctor/:id",               getDoctorProfile);

// ── Patients ──────────────────────────────────
router.get("/patients",                  getAllPatients);
router.get("/patient/:id",               getPatientProfile);

// ── Shared ────────────────────────────────────
router.delete("/user/:id",               deleteUser);

export default router;