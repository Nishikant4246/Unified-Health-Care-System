import express from "express";
import {
  getDashboardStats,
  createDoctor,
  getAllDoctors,
  getPendingDoctors,
  approveDoctor,
  getAllPatients,
  deleteUser,
  getDoctorProfile,
  getPatientProfile,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));

router.get("/stats", getDashboardStats);
router.post("/create-doctor", createDoctor);
router.get("/doctors", getAllDoctors);
router.get("/pending-doctors", getPendingDoctors);
router.put("/approve-doctor/:id", approveDoctor);
router.get("/patients", getAllPatients);
router.delete("/user/:id", deleteUser);
router.get("/doctor/:id", getDoctorProfile);
router.get("/patient/:id", getPatientProfile);

export default router;