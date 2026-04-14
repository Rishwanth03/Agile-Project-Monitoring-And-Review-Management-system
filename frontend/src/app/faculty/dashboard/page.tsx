"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { facultyAPI } from "@/lib/api";
import StatCard from "@/components/StatCard";
import Link from "next/link";

interface DashboardData {
  stats: {
    totalTeams: number;
    totalStudents: number;
    pendingReviews: number;
    completedReviews: number;
  };
  teams: {
    id: string;
    teamName: string;
    projectTitle: string;
    memberCount: number;
    sprintCount: number;
  }[];
  recentSubmissions: {
    id: string;
    studentName: string;
    studentId: string;
    teamName: string;
    sprintNumber: number;
    status: string;
    createdAt: string;
  }[];
}

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facultyAPI.getDashboard().then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">Faculty dashboard overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Teams"
          value={data?.stats.totalTeams || 0}
          icon="👥"
          color="from-purple-500 to-indigo-500"
        />
        <StatCard
          title="Total Students"
          value={data?.stats.totalStudents || 0}
          icon="🎓"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Pending Reviews"
          value={data?.stats.pendingReviews || 0}
          icon="⏳"
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Completed Reviews"
          value={data?.stats.completedReviews || 0}
          icon="✅"
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Submissions</h3>
          <Link
            href="/faculty/submissions"
            className="text-sm text-purple-600 font-medium hover:underline"
          >
            View all →
          </Link>
        </div>
        {data?.recentSubmissions && data.recentSubmissions.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Team</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Sprint</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSubmissions.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{sub.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sub.teamName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Sprint {sub.sprintNumber}</td>
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
                  <td className="px-6 py-4">
                    <Link
                      href={`/faculty/submissions?review=${sub.id}`}
                      className="text-sm text-purple-600 font-medium hover:underline"
                    >
                      View
                    </Link>
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
