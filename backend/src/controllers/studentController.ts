import { Request, Response } from "express";
import prisma from "../config/database";

export const getStudentDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get teams the student belongs to
    const teamMemberships = await prisma.teamMember.findMany({
      where: { studentId: userId },
      include: {
        team: {
          include: {
            sprints: {
              orderBy: { sprintNumber: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    // Get submission stats
    const submissions = await prisma.submission.findMany({
      where: { studentId: userId },
      include: { review: true, sprint: true },
    });

    const totalSubmissions = submissions.length;
    const pendingReviews = submissions.filter((s) => s.status === "pending").length;
    const reviewedSubmissions = submissions.filter((s) => s.status === "reviewed").length;

    // Calculate average marks
    const reviews = submissions.filter((s) => s.review).map((s) => s.review!);
    const avgMarks = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.marks || 0), 0) / reviews.length
      : 0;

    // Current sprint info
    const currentSprint = teamMemberships.length > 0
      ? teamMemberships[0]?.team.sprints[0] || null
      : null;

    // Recent feedback
    const recentFeedback = await prisma.review.findMany({
      where: {
        submission: { studentId: userId },
      },
      include: {
        submission: { include: { sprint: true } },
        faculty: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json({
      teams: teamMemberships.map((tm) => ({
        id: tm.team.id,
        teamName: tm.team.teamName,
        projectTitle: tm.team.projectTitle,
      })),
      stats: {
        totalSubmissions,
        pendingReviews,
        reviewedSubmissions,
        averageMarks: Math.round(avgMarks * 100) / 100,
        currentSprint: currentSprint
          ? { sprintNumber: currentSprint.sprintNumber, endDate: currentSprint.endDate }
          : null,
      },
      recentFeedback: recentFeedback.map((rf) => ({
        id: rf.id,
        marks: rf.marks,
        rating: rf.rating,
        feedback: rf.feedback,
        facultyName: rf.faculty.name,
        sprintNumber: rf.submission.sprint.sprintNumber,
        createdAt: rf.createdAt,
      })),
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const submitSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { sprintId, tasksCompleted, challenges, improvements } = req.body;

    if (!sprintId) {
      res.status(400).json({ error: "Sprint ID is required" });
      return;
    }

    // Verify the sprint exists and the student is a member of that team
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: { team: { include: { members: true } } },
    });

    if (!sprint) {
      res.status(404).json({ error: "Sprint not found" });
      return;
    }

    const isMember = sprint.team.members.some((m) => m.studentId === userId);
    if (!isMember) {
      res.status(403).json({ error: "You are not a member of this team" });
      return;
    }

    // Check for existing submission
    const existingSubmission = await prisma.submission.findFirst({
      where: { sprintId, studentId: userId },
    });

    if (existingSubmission) {
      res.status(409).json({ error: "You have already submitted for this sprint" });
      return;
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const submission = await prisma.submission.create({
      data: {
        sprintId,
        studentId: userId,
        tasksCompleted,
        challenges,
        improvements,
        fileUrl,
        status: "pending",
      },
      include: { sprint: true },
    });

    res.status(201).json({ message: "Sprint submitted successfully", submission });
  } catch (error) {
    console.error("Submit sprint error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const submissions = await prisma.submission.findMany({
      where: { studentId: userId },
      include: {
        sprint: { include: { team: true } },
        review: {
          include: { faculty: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ submissions });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const submissions = await prisma.submission.findMany({
      where: { studentId: userId, status: "reviewed" },
      include: {
        sprint: { include: { team: true } },
        review: {
          include: { faculty: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ history: submissions });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
