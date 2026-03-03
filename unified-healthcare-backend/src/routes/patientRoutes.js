import express from "express";
import {
  getMyRecords,
  uploadOldReport,
  updateProfile,
  getPaymentHistory,
} from "../controllers/patientController.js";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("patient"));

router.get("/my-records", getMyRecords);
router.post("/upload-report", upload.array("reports", 5), uploadOldReport);  // ← fixed
router.put("/update-profile", updateProfile);
router.get("/payment-history", getPaymentHistory);

export default router;