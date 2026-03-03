import express from "express";
import {
  getDashboardStats,
  createDoctor,
  getAllDoctors,
  getPendingDoctors,
  approveDoctor,
  getAllPatients,
  deleteUser,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));

router.get("/stats", getDashboardStats);           // ← Dashboard stats
router.post("/create-doctor", createDoctor);       // ← Admin creates doctor
router.get("/doctors", getAllDoctors);             // ← All doctors list
router.get("/pending-doctors", getPendingDoctors); // ← Pending approvals
router.put("/approve-doctor/:id", approveDoctor);  // ← Approve doctor
router.get("/patients", getAllPatients);           // ← All patients list
router.delete("/user/:id", deleteUser);            // ← Delete any user

export default router;