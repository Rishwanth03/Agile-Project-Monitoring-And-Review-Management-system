import { Router } from "express";
import { authenticate, authorizeRole } from "../middleware/auth";
import {
  getFacultyDashboard,
  getSubmissions,
  reviewSubmission,
  createTeam,
  assignStudent,
  createSprint,
  getTeams,
  getStudents,
} from "../controllers/facultyController";

const router = Router();

router.use(authenticate, authorizeRole("faculty"));

router.get("/dashboard", getFacultyDashboard);
router.get("/submissions", getSubmissions);
router.post("/review", reviewSubmission);
router.post("/create-team", createTeam);
router.post("/assign-student", assignStudent);
router.post("/create-sprint", createSprint);
router.get("/teams", getTeams);
router.get("/students", getStudents);

export default router;
