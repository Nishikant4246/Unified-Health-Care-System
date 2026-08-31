import express from "express";
import {
  getMyRecords,
  uploadOldReport,
  updateProfile,
  getPaymentHistory,
  getPatientStats,
  getNearbyDoctors,
} from "../controllers/patientController.js";
import { getMyLabReports } from "../controllers/labReportController.js";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("patient"));

router.get("/stats",           getPatientStats);
router.get("/my-records",      getMyRecords);
router.get("/payment-history", getPaymentHistory);
router.get("/nearby-doctors",  getNearbyDoctors);   // NEW
router.put("/update-profile",  updateProfile);
router.post("/upload-report",  upload.array("reports", 5), uploadOldReport);
router.get("/lab-reports",     getMyLabReports);

export default router;