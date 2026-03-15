import express from "express";
import {
  searchPatient,
  addMedicalRecord,
  getDoctorRecords,
  getPatientRecords,
} from "../controllers/doctorController.js";

import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("doctor"));

router.get("/search-patient", searchPatient);

router.post("/add-record", upload.array("reports", 5), addMedicalRecord);

router.get("/my-records", getDoctorRecords);

router.get("/patient-records/:patientId", getPatientRecords);

export default router;