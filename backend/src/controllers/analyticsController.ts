import { Request, Response } from "express";
import prisma from "../config/database";

export const getStudentAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.params.id as string;

    const submissions = await prisma.submission.findMany({
      where: { studentId },
      include: {
        sprint: { include: { team: true } },
        review: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const sprintProgress = submissions.map((s) => ({
      sprintNumber: s.sprint.sprintNumber,
      teamName: s.sprint.team.teamName,
      status: s.status,
      marks: s.review?.marks || 0,
      rating: s.review?.rating || 0,
      submittedAt: s.createdAt,
    }));

    const totalSubmissions = submissions.length;
    const reviewedCount = submissions.filter((s) => s.status === "reviewed").length;
    const pendingCount = submissions.filter((s) => s.status === "pending").length;

    const reviews = submissions.filter((s) => s.review).map((s) => s.review!);
    const avgMarks = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.marks || 0), 0) / reviews.length
      : 0;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

    res.json({
      studentId,
      summary: {
        totalSubmissions,
        reviewedCount,
        pendingCount,
        averageMarks: Math.round(avgMarks * 100) / 100,
        averageRating: Math.round(avgRating * 100) / 100,
        completionRate: totalSubmissions > 0
          ? Math.round((reviewedCount / totalSubmissions) * 100)
          : 0,
      },
      sprintProgress,
    });
  } catch (error) {
    console.error("Student analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOverviewAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    let teamFilter: any = {};
    if (userRole === "faculty") {
      teamFilter = { createdBy: userId };
    }

    const teams = await prisma.team.findMany({
      where: teamFilter,
      include: {
        members: true,
        sprints: {
          include: {
            submissions: {
              include: { review: true },
            },
          },
        },
      },
    });

    const allSubmissions = teams.flatMap((t) =>
      t.sprints.flatMap((s) => s.submissions)
    );

    const totalSubmissions = allSubmissions.length;
    const reviewedCount = allSubmissions.filter((s) => s.status === "reviewed").length;
    const pendingCount = allSubmissions.filter((s) => s.status === "pending").length;

    const allReviews = allSubmissions.filter((s) => s.review).map((s) => s.review!);
    const avgMarks = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + (r.marks || 0), 0) / allReviews.length
      : 0;

    // Team performance
    const teamPerformance = teams.map((t) => {
      const teamSubmissions = t.sprints.flatMap((s) => s.submissions);
      const teamReviews = teamSubmissions.filter((s) => s.review).map((s) => s.review!);
      const teamAvgMarks = teamReviews.length > 0
        ? teamReviews.reduce((sum, r) => sum + (r.marks || 0), 0) / teamReviews.length
        : 0;

      return {
        teamId: t.id,
        teamName: t.teamName,
        projectTitle: t.projectTitle,
        memberCount: t.members.length,
        totalSubmissions: teamSubmissions.length,
        reviewedCount: teamSubmissions.filter((s) => s.status === "reviewed").length,
        averageMarks: Math.round(teamAvgMarks * 100) / 100,
      };
    });

    // Sprint-wise data
    const sprintData = teams.flatMap((t) =>
      t.sprints.map((s) => {
        const sprintReviews = s.submissions.filter((sub) => sub.review).map((sub) => sub.review!);
        const sprintAvg = sprintReviews.length > 0
          ? sprintReviews.reduce((sum, r) => sum + (r.marks || 0), 0) / sprintReviews.length
          : 0;
        return {
          teamName: t.teamName,
          sprintNumber: s.sprintNumber,
          submissionCount: s.submissions.length,
          reviewedCount: s.submissions.filter((sub) => sub.status === "reviewed").length,
          averageMarks: Math.round(sprintAvg * 100) / 100,
        };
      })
    );

    res.json({
      overview: {
        totalTeams: teams.length,
        totalStudents: teams.reduce((sum, t) => sum + t.members.length, 0),
        totalSubmissions,
        reviewedCount,
        pendingCount,
        averageMarks: Math.round(avgMarks * 100) / 100,
        completionRate: totalSubmissions > 0
          ? Math.round((reviewedCount / totalSubmissions) * 100)
          : 0,
      },
      teamPerformance,
      sprintData,
    });
  } catch (error) {
    console.error("Overview analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
