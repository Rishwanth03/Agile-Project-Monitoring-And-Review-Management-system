"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudents = exports.getTeams = exports.createSprint = exports.assignStudent = exports.createTeam = exports.reviewSubmission = exports.getSubmissions = exports.getFacultyDashboard = void 0;
const database_1 = __importDefault(require("../config/database"));
const getFacultyDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;
        const teams = await database_1.default.team.findMany({
            where: { createdBy: userId },
            include: { members: true, sprints: true },
        });
        const totalTeams = teams.length;
        const totalStudents = teams.reduce((sum, t) => sum + t.members.length, 0);
        // Get all submissions for faculty's teams
        const teamIds = teams.map((t) => t.id);
        const sprintIds = teams.flatMap((t) => t.sprints.map((s) => s.id));
        const submissions = await database_1.default.submission.findMany({
            where: { sprintId: { in: sprintIds } },
            include: { review: true },
        });
        const pendingReviews = submissions.filter((s) => s.status === "pending").length;
        const completedReviews = submissions.filter((s) => s.status === "reviewed").length;
        // Recent submissions
        const recentSubmissions = await database_1.default.submission.findMany({
            where: { sprintId: { in: sprintIds } },
            include: {
                student: { select: { id: true, name: true, email: true } },
                sprint: { include: { team: { select: { teamName: true } } } },
                review: true,
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
        res.json({
            stats: { totalTeams, totalStudents, pendingReviews, completedReviews },
            teams: teams.map((t) => ({
                id: t.id,
                teamName: t.teamName,
                projectTitle: t.projectTitle,
                memberCount: t.members.length,
                sprintCount: t.sprints.length,
            })),
            recentSubmissions: recentSubmissions.map((s) => ({
                id: s.id,
                studentName: s.student.name,
                studentId: s.student.id,
                teamName: s.sprint.team.teamName,
                sprintNumber: s.sprint.sprintNumber,
                status: s.status,
                createdAt: s.createdAt,
            })),
        });
    }
    catch (error) {
        console.error("Faculty dashboard error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getFacultyDashboard = getFacultyDashboard;
const getSubmissions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const teams = await database_1.default.team.findMany({
            where: { createdBy: userId },
            include: { sprints: true },
        });
        const sprintIds = teams.flatMap((t) => t.sprints.map((s) => s.id));
        const submissions = await database_1.default.submission.findMany({
            where: { sprintId: { in: sprintIds } },
            include: {
                student: { select: { id: true, name: true, email: true } },
                sprint: { include: { team: { select: { id: true, teamName: true } } } },
                review: {
                    include: { faculty: { select: { name: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ submissions });
    }
    catch (error) {
        console.error("Get faculty submissions error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getSubmissions = getSubmissions;
const reviewSubmission = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { submissionId, marks, rating, feedback } = req.body;
        if (!submissionId) {
            res.status(400).json({ error: "Submission ID is required" });
            return;
        }
        if (rating !== undefined && (rating < 1 || rating > 5)) {
            res.status(400).json({ error: "Rating must be between 1 and 5" });
            return;
        }
        // Verify submission exists and belongs to faculty's teams
        const submission = await database_1.default.submission.findUnique({
            where: { id: submissionId },
            include: { sprint: { include: { team: true } } },
        });
        if (!submission) {
            res.status(404).json({ error: "Submission not found" });
            return;
        }
        if (submission.sprint.team.createdBy !== userId) {
            res.status(403).json({ error: "You can only review submissions from your teams" });
            return;
        }
        // Check if already reviewed
        const existingReview = await database_1.default.review.findUnique({
            where: { submissionId },
        });
        if (existingReview) {
            res.status(409).json({ error: "This submission has already been reviewed" });
            return;
        }
        const review = await database_1.default.$transaction(async (tx) => {
            const rev = await tx.review.create({
                data: {
                    submissionId,
                    facultyId: userId,
                    marks: marks ? parseFloat(marks) : null,
                    rating: rating ? parseInt(rating) : null,
                    feedback,
                },
            });
            await tx.submission.update({
                where: { id: submissionId },
                data: { status: "reviewed" },
            });
            return rev;
        });
        res.status(201).json({ message: "Review submitted successfully", review });
    }
    catch (error) {
        console.error("Review submission error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.reviewSubmission = reviewSubmission;
const createTeam = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { teamName, projectTitle, projectDescription } = req.body;
        if (!teamName) {
            res.status(400).json({ error: "Team name is required" });
            return;
        }
        const team = await database_1.default.team.create({
            data: {
                teamName,
                projectTitle,
                projectDescription,
                createdBy: userId,
            },
        });
        res.status(201).json({ message: "Team created successfully", team });
    }
    catch (error) {
        console.error("Create team error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createTeam = createTeam;
const assignStudent = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { teamId, studentId } = req.body;
        if (!teamId || !studentId) {
            res.status(400).json({ error: "Team ID and Student ID are required" });
            return;
        }
        // Verify team belongs to faculty
        const team = await database_1.default.team.findUnique({ where: { id: teamId } });
        if (!team || team.createdBy !== userId) {
            res.status(403).json({ error: "Team not found or access denied" });
            return;
        }
        // Verify student exists
        const student = await database_1.default.user.findUnique({ where: { id: studentId } });
        if (!student || student.role !== "student") {
            res.status(404).json({ error: "Student not found" });
            return;
        }
        // Check if already a member
        const existing = await database_1.default.teamMember.findFirst({
            where: { teamId, studentId },
        });
        if (existing) {
            res.status(409).json({ error: "Student is already a member of this team" });
            return;
        }
        const member = await database_1.default.teamMember.create({
            data: { teamId, studentId },
        });
        res.status(201).json({ message: "Student assigned to team", member });
    }
    catch (error) {
        console.error("Assign student error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.assignStudent = assignStudent;
const createSprint = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { teamId, sprintNumber, startDate, endDate } = req.body;
        if (!teamId || !sprintNumber || !startDate || !endDate) {
            res.status(400).json({ error: "Team ID, sprint number, start date, and end date are required" });
            return;
        }
        const team = await database_1.default.team.findUnique({ where: { id: teamId } });
        if (!team || team.createdBy !== userId) {
            res.status(403).json({ error: "Team not found or access denied" });
            return;
        }
        const sprint = await database_1.default.sprint.create({
            data: {
                teamId,
                sprintNumber: parseInt(sprintNumber),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });
        res.status(201).json({ message: "Sprint created successfully", sprint });
    }
    catch (error) {
        console.error("Create sprint error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createSprint = createSprint;
const getTeams = async (req, res) => {
    try {
        const userId = req.user.userId;
        const teams = await database_1.default.team.findMany({
            where: { createdBy: userId },
            include: {
                members: {
                    include: {
                        student: { select: { id: true, name: true, email: true } },
                    },
                },
                sprints: { orderBy: { sprintNumber: "asc" } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ teams });
    }
    catch (error) {
        console.error("Get teams error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getTeams = getTeams;
const getStudents = async (_req, res) => {
    try {
        const students = await database_1.default.user.findMany({
            where: { role: "student" },
            select: { id: true, name: true, email: true, department: true },
            orderBy: { name: "asc" },
        });
        res.json({ students });
    }
    catch (error) {
        console.error("Get students error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getStudents = getStudents;
//# sourceMappingURL=facultyController.js.map