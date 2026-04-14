import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getStudentAnalytics,
  getOverviewAnalytics,
} from "../controllers/analyticsController";

const router = Router();

router.use(authenticate);

router.get("/student/:id", getStudentAnalytics);
router.get("/overview", getOverviewAnalytics);

export default router;
