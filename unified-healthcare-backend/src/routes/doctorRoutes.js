import express from "express";
import {
  searchPatient,
  addMedicalRecord,
  getDoctorRecords,
  getPatientRecords,
  getDoctorStats,
  getPatientProfile,
  getMyPatients,
} from "../controllers/doctorController.js";

import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("doctor"));

router.get("/search-patient",           searchPatient);
router.get("/stats",                    getDoctorStats);
router.get("/my-records",               getDoctorRecords);
router.get("/my-patients",              getMyPatients);
router.get("/patient/:patientId",       getPatientProfile);
router.get("/patient-records/:patientId", getPatientRecords);  // keep old one too

router.post("/add-record", upload.array("reports", 5), addMedicalRecord);

export default router;