"use client";

import { useState, useEffect } from "react";
import { analyticsAPI } from "@/lib/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface OverviewData {
  overview: {
    totalTeams: number;
    totalStudents: number;
    totalSubmissions: number;
    reviewedCount: number;
    pendingCount: number;
    averageMarks: number;
    completionRate: number;
  };
  teamPerformance: {
    teamId: string;
    teamName: string;
    projectTitle: string;
    memberCount: number;
    totalSubmissions: number;
    reviewedCount: number;
    averageMarks: number;
  }[];
  sprintData: {
    teamName: string;
    sprintNumber: number;
    submissionCount: number;
    reviewedCount: number;
    averageMarks: number;
  }[];
}

const COLORS = ["#7C3AED", "#3B82F6", "#22C55E", "#EAB308", "#EF4444", "#EC4899"];

export default function FacultyAnalytics() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getOverview().then((res) => {
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

  if (!data) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-lg">No analytics data available</p>
      </div>
    );
  }

  const pieData = [
    { name: "Reviewed", value: data.overview.reviewedCount },
    { name: "Pending", value: data.overview.pendingCount },
  ];

  const sprintLineData = data.sprintData.map((s) => ({
    name: `S${s.sprintNumber} (${s.teamName.substring(0, 8)})`,
    marks: s.averageMarks,
    submissions: s.submissionCount,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <p className="text-gray-500 mt-1">Performance insights across all teams</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Teams</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{data.overview.totalTeams}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{data.overview.totalStudents}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Average Marks</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data.overview.averageMarks}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{data.overview.completionRate}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Line Chart - Sprint Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sprint Progress Over Time</h3>
          {sprintLineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sprintLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="marks" stroke="#7C3AED" strokeWidth={2} name="Avg Marks" />
                <Line type="monotone" dataKey="submissions" stroke="#3B82F6" strokeWidth={2} name="Submissions" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No sprint data yet
            </div>
          )}
        </div>

        {/* Bar Chart - Team Marks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Marks Trend by Team</h3>
          {data.teamPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="teamName" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="averageMarks" fill="#7C3AED" radius={[8, 8, 0, 0]} name="Avg Marks" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No team data yet
            </div>
          )}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Sprint Completion Rate</h3>
        {data.overview.totalSubmissions > 0 ? (
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

      {/* Team Performance Table */}
      {data.teamPerformance.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Team Performance</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Team</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Project</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Members</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Submissions</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reviewed</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Avg Marks</th>
              </tr>
            </thead>
            <tbody>
              {data.teamPerformance.map((team) => (
                <tr key={team.teamId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{team.teamName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{team.projectTitle || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{team.memberCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{team.totalSubmissions}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{team.reviewedCount}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-purple-600">{team.averageMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
