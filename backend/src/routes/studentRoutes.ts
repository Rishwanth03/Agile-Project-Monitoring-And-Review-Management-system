import { Router } from "express";
import { authenticate, authorizeRole } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  getStudentDashboard,
  submitSprint,
  getSubmissions,
  getHistory,
} from "../controllers/studentController";

const router = Router();

router.use(authenticate, authorizeRole("student"));

router.get("/dashboard", getStudentDashboard);
router.post("/submit-sprint", upload.single("file"), submitSprint);
router.get("/submissions", getSubmissions);
router.get("/history", getHistory);

export default router;
