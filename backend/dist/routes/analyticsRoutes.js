"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const analyticsController_1 = require("../controllers/analyticsController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/student/:id", analyticsController_1.getStudentAnalytics);
router.get("/overview", analyticsController_1.getOverviewAnalytics);
exports.default = router;
//# sourceMappingURL=analyticsRoutes.js.map