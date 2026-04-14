"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { studentAPI } from "@/lib/api";
import StatCard from "@/components/StatCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardData {
  teams: { id: string; teamName: string; projectTitle: string }[];
  stats: {
    totalSubmissions: number;
    pendingReviews: number;
    reviewedSubmissions: number;
    averageMarks: number;
    currentSprint: { sprintNumber: number; endDate: string } | null;
  };
  recentFeedback: {
    id: string;
    marks: number;
    rating: number;
    feedback: string;
    facultyName: string;
    sprintNumber: number;
    createdAt: string;
  }[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard().then((res) => {
      setData(res.data);
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

  const chartData = data?.recentFeedback?.map((f) => ({
    sprint: `Sprint ${f.sprintNumber}`,
    marks: f.marks || 0,
  })).reverse() || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your project progress overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Sprint"
          value={data?.stats.currentSprint ? `Sprint ${data.stats.currentSprint.sprintNumber}` : "None"}
          icon="🏃"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Completed Tasks"
          value={data?.stats.reviewedSubmissions || 0}
          icon="✅"
          color="from-blue-500 to-indigo-500"
        />
        <StatCard
          title="Pending Reviews"
          value={data?.stats.pendingReviews || 0}
          icon="⏳"
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Average Marks"
          value={data?.stats.averageMarks || 0}
          icon="⭐"
          color="from-purple-500 to-pink-500"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Sprint Progress Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sprint Marks Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="sprint" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="marks" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              No data available yet
            </div>
          )}
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Feedback</h3>
          {data?.recentFeedback && data.recentFeedback.length > 0 ? (
            <div className="space-y-4">
              {data.recentFeedback.map((fb) => (
                <div key={fb.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Sprint {fb.sprintNumber}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      {fb.marks} marks
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{fb.feedback || "No feedback provided"}</p>
                  <p className="text-xs text-gray-400 mt-2">By {fb.facultyName}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              No feedback received yet
            </div>
          )}
        </div>
      </div>

      {/* Team Info */}
      {data?.teams && data.teams.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Teams</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.teams.map((team) => (
              <div key={team.id} className="p-4 bg-green-50 rounded-xl border border-green-100">
                <h4 className="font-semibold text-gray-900">{team.teamName}</h4>
                <p className="text-sm text-gray-600 mt-1">{team.projectTitle || "No project title"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
