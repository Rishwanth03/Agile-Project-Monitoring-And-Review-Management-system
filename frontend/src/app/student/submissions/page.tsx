"use client";

import { useState, useEffect } from "react";
import { studentAPI } from "@/lib/api";

interface Submission {
  id: string;
  tasksCompleted: string;
  challenges: string;
  improvements: string;
  fileUrl: string | null;
  status: string;
  createdAt: string;
  sprint: {
    sprintNumber: number;
    team: { teamName: string };
  };
  review: {
    marks: number;
    rating: number;
    feedback: string;
    faculty: { name: string };
    createdAt: string;
  } | null;
}

export default function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    studentAPI.getSubmissions().then((res) => {
      setSubmissions(res.data.submissions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <p className="text-gray-500 mt-1">View your sprint submissions and feedback</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 text-lg">No submissions yet</p>
          <p className="text-gray-400 text-sm mt-2">Submit your first sprint to see it here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        S{sub.sprint.sprintNumber}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Sprint {sub.sprint.sprintNumber} - {sub.sprint.team.teamName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Submitted {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sub.review && (
                      <span className="text-sm font-semibold text-green-600">
                        {sub.review.marks} marks
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        sub.status === "reviewed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {sub.status === "reviewed" ? "Reviewed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {expandedId === sub.id && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                  {sub.tasksCompleted && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Tasks Completed</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{sub.tasksCompleted}</p>
                    </div>
                  )}
                  {sub.challenges && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Challenges</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{sub.challenges}</p>
                    </div>
                  )}
                  {sub.improvements && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Improvements</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{sub.improvements}</p>
                    </div>
                  )}
                  {sub.review && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <h4 className="text-sm font-semibold text-green-800 mb-2">Faculty Review</h4>
                      <div className="flex gap-4 mb-2">
                        <span className="text-sm text-green-700">
                          Marks: <strong>{sub.review.marks}</strong>
                        </span>
                        <span className="text-sm text-green-700">
                          Rating: {"⭐".repeat(sub.review.rating || 0)}
                        </span>
                      </div>
                      {sub.review.feedback && (
                        <p className="text-sm text-green-700">{sub.review.feedback}</p>
                      )}
                      <p className="text-xs text-green-500 mt-2">
                        Reviewed by {sub.review.faculty.name} on{" "}
                        {new Date(sub.review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
