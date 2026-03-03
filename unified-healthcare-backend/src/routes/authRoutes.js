import express from "express";
import {
  registerPatient,
  registerDoctor,
  loginUser,
  getMe,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerPatient);
router.post("/register-doctor", registerDoctor); // 🔥 NEW
router.post("/login", loginUser);
router.get("/me", protect, getMe);

export default router;