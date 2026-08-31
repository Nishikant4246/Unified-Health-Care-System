import express from "express";
import {
  searchPatient,
  addMedicalRecord,
  getDoctorRecords,
  getPatientRecords,
  getDoctorStats,
  getPatientProfile,
  getMyPatients,
  updateLocation,
} from "../controllers/doctorController.js";

import {
  addLabReport,
  getPatientLabReports,
  getMyUploadedLabReports,
} from "../controllers/labReportController.js";

import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("doctor"));

router.get("/search-patient",             searchPatient);
router.get("/stats",                      getDoctorStats);
router.get("/my-records",                 getDoctorRecords);
router.get("/my-patients",                getMyPatients);
router.get("/patient/:patientId",         getPatientProfile);
router.get("/patient-records/:patientId", getPatientRecords);

router.post("/add-record",      upload.array("reports", 5), addMedicalRecord);
router.post("/update-location", updateLocation);   // NEW — Nominatim geocoding

// ── Lab Reports (dedicated section — independent of medical records) ──
router.get("/lab-reports",             getMyUploadedLabReports);
router.get("/lab-reports/:patientId",  getPatientLabReports);
router.post("/lab-reports/:patientId", upload.single("file"), addLabReport);

export default router;