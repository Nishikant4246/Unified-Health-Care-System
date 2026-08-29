import express from "express";
import {
  registerPatient,
  registerDoctor,
  loginUser,
  getMe,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerPatient);
// license certificate (image/PDF) sent as multipart field "licenseImage";
// JSON requests still pass through untouched (multer ignores non-multipart)
router.post("/register-doctor", upload.single("licenseImage"), registerDoctor);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

export default router;