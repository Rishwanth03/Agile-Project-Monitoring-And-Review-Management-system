"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { analyticsAPI } from "@/lib/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface AnalyticsData {
  summary: {
    totalSubmissions: number;
    reviewedCount: number;
    pendingCount: number;
    averageMarks: number;
    averageRating: number;
    completionRate: number;
  };
  sprintProgress: {
    sprintNumber: number;
    teamName: string;
    status: string;
    marks: number;
    rating: number;
  }[];
}

const COLORS = ["#22C55E", "#3B82F6", "#EAB308", "#EF4444", "#8B5CF6"];

export default function StudentAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      analyticsAPI.getStudentAnalytics(user.id).then((res) => {
        setData(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-lg">No analytics data available</p>
      </div>
    );
  }

  const lineData = data.sprintProgress.map((s) => ({
    name: `Sprint ${s.sprintNumber}`,
    marks: s.marks,
    rating: s.rating,
  }));

  const pieData = [
    { name: "Reviewed", value: data.summary.reviewedCount },
    { name: "Pending", value: data.summary.pendingCount },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Analytics</h1>
        <p className="text-gray-500 mt-1">Performance insights across sprints</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Submissions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.summary.totalSubmissions}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Average Marks</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data.summary.averageMarks}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{data.summary.averageRating} / 5</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{data.summary.completionRate}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Line Chart - Sprint Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sprint Progress</h3>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="marks" stroke="#22C55E" strokeWidth={2} />
                <Line type="monotone" dataKey="rating" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No sprint data yet
            </div>
          )}
        </div>

        {/* Bar Chart - Marks Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Marks Trend</h3>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="marks" fill="#22C55E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No marks data yet
            </div>
          )}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Completion Rate</h3>
        {data.summary.totalSubmissions > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-400">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
