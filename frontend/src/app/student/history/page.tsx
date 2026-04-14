"use client";

import { useState, useEffect } from "react";
import { studentAPI } from "@/lib/api";

interface HistoryItem {
  id: string;
  tasksCompleted: string;
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
  } | null;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getHistory().then((res) => {
      setHistory(res.data.history || []);
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
        <h1 className="text-2xl font-bold text-gray-900">Sprint History</h1>
        <p className="text-gray-500 mt-1">Your reviewed sprint submissions</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 text-lg">No reviewed submissions yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Sprint</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Team</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Marks</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Rating</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Feedback</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Sprint {item.sprint.sprintNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.sprint.team.teamName}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    {item.review?.marks || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {"⭐".repeat(item.review?.rating || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {item.review?.feedback || "No feedback"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
