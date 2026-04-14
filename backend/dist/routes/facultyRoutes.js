"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const facultyController_1 = require("../controllers/facultyController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorizeRole)("faculty"));
router.get("/dashboard", facultyController_1.getFacultyDashboard);
router.get("/submissions", facultyController_1.getSubmissions);
router.post("/review", facultyController_1.reviewSubmission);
router.post("/create-team", facultyController_1.createTeam);
router.post("/assign-student", facultyController_1.assignStudent);
router.post("/create-sprint", facultyController_1.createSprint);
router.get("/teams", facultyController_1.getTeams);
router.get("/students", facultyController_1.getStudents);
exports.default = router;
//# sourceMappingURL=facultyRoutes.js.map