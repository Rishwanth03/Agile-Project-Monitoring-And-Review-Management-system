"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { facultyAPI } from "@/lib/api";

interface Submission {
  id: string;
  tasksCompleted: string;
  challenges: string;
  improvements: string;
  fileUrl: string | null;
  status: string;
  createdAt: string;
  student: { id: string; name: string; email: string };
  sprint: {
    sprintNumber: number;
    team: { id: string; teamName: string };
  };
  review: {
    marks: number;
    rating: number;
    feedback: string;
    faculty: { name: string };
  } | null;
}

function SubmissionsContent() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("review");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [marks, setMarks] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const res = await facultyAPI.getSubmissions();
      const subs = res.data.submissions || [];
      setSubmissions(subs);
      if (reviewId) {
        const found = subs.find((s: Submission) => s.id === reviewId);
        if (found) setSelectedSubmission(found);
      }
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedSubmission) return;
    setReviewLoading(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      await facultyAPI.review({
        submissionId: selectedSubmission.id,
        marks: marks ? parseFloat(marks) : null,
        rating: rating || null,
        feedback,
      });
      setReviewSuccess("Review submitted successfully!");
      setMarks("");
      setRating(0);
      setFeedback("");
      setSelectedSubmission(null);
      loadSubmissions();
    } catch (err: any) {
      setReviewError(err.response?.data?.error || "Review failed");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Submissions</h1>
        <p className="text-gray-500 mt-1">Review and evaluate student sprint submissions</p>
      </div>

      {reviewSuccess && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          {reviewSuccess}
        </div>
      )}

      {/* Review Panel */}
      {selectedSubmission && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Review Submission</h3>
            <button
              onClick={() => setSelectedSubmission(null)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid lg:grid-cols-2 divide-x divide-gray-100">
            {/* Left: Submission Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {selectedSubmission.student.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedSubmission.student.name}</h4>
                  <p className="text-xs text-gray-500">
                    Sprint {selectedSubmission.sprint.sprintNumber} • {selectedSubmission.sprint.team.teamName}
                  </p>
                </div>
              </div>

              {selectedSubmission.tasksCompleted && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">Tasks Completed</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                    {selectedSubmission.tasksCompleted}
                  </p>
                </div>
              )}
              {selectedSubmission.challenges && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">Challenges Faced</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                    {selectedSubmission.challenges}
                  </p>
                </div>
              )}
              {selectedSubmission.improvements && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">Improvements Planned</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                    {selectedSubmission.improvements}
                  </p>
                </div>
              )}
              {selectedSubmission.fileUrl && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">Uploaded File</h5>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${selectedSubmission.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Download File ↓
                  </a>
                </div>
              )}
            </div>

            {/* Right: Review Form */}
            <div className="p-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Evaluation</h4>

              {reviewError && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm">
                  {reviewError}
                </div>
              )}

              {selectedSubmission.review ? (
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-sm font-semibold text-green-700 mb-2">Already Reviewed</p>
                  <p className="text-sm text-green-600">Marks: {selectedSubmission.review.marks}</p>
                  <p className="text-sm text-green-600">
                    Rating: {"⭐".repeat(selectedSubmission.review.rating || 0)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">{selectedSubmission.review.feedback}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Marks</label>
                    <input
                      type="number"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      placeholder="Enter marks"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            star <= rating ? "grayscale-0" : "grayscale opacity-30"
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      placeholder="Provide detailed feedback..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 text-sm resize-none"
                    />
                  </div>

                  <button
                    onClick={handleReview}
                    disabled={reviewLoading}
                    className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-red-500 hover:from-purple-700 hover:to-red-600 shadow-lg shadow-purple-500/25 transition-all duration-200 disabled:opacity-50"
                  >
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {submissions.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Team</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Sprint</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{sub.student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sub.sprint.team.teamName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Sprint {sub.sprint.sprintNumber}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        sub.status === "reviewed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {sub.status === "reviewed" ? "Reviewed" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedSubmission(sub)}
                      className="text-sm text-purple-600 font-medium hover:underline"
                    >
                      {sub.status === "reviewed" ? "View" : "Review"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">No submissions yet</div>
        )}
      </div>
    </div>
  );
}

export default function FacultySubmissions() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>}>
      <SubmissionsContent />
    </Suspense>
  );
}
