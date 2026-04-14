"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const studentController_1 = require("../controllers/studentController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorizeRole)("student"));
router.get("/dashboard", studentController_1.getStudentDashboard);
router.post("/submit-sprint", upload_1.upload.single("file"), studentController_1.submitSprint);
router.get("/submissions", studentController_1.getSubmissions);
router.get("/history", studentController_1.getHistory);
exports.default = router;
//# sourceMappingURL=studentRoutes.js.map