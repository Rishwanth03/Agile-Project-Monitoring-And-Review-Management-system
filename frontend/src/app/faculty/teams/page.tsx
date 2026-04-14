"use client";

import { useState, useEffect } from "react";
import { facultyAPI } from "@/lib/api";

interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface Team {
  id: string;
  teamName: string;
  projectTitle: string;
  projectDescription: string;
  members: { id: string; student: { id: string; name: string; email: string } }[];
  sprints: { id: string; sprintNumber: number; startDate: string; endDate: string }[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSprint, setShowSprint] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState<string | null>(null);

  // Create team form
  const [teamName, setTeamName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Sprint form
  const [sprintNumber, setSprintNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Assign form
  const [selectedStudent, setSelectedStudent] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamsRes, studentsRes] = await Promise.all([
        facultyAPI.getTeams(),
        facultyAPI.getStudents(),
      ]);
      setTeams(teamsRes.data.teams || []);
      setStudents(studentsRes.data.students || []);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await facultyAPI.createTeam({ teamName, projectTitle, projectDescription });
      setMessage({ type: "success", text: "Team created successfully!" });
      setTeamName("");
      setProjectTitle("");
      setProjectDescription("");
      setShowCreate(false);
      loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to create team" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSprint) return;
    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await facultyAPI.createSprint({
        teamId: showSprint,
        sprintNumber,
        startDate,
        endDate,
      });
      setMessage({ type: "success", text: "Sprint created successfully!" });
      setSprintNumber("");
      setStartDate("");
      setEndDate("");
      setShowSprint(null);
      loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to create sprint" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssign || !selectedStudent) return;
    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await facultyAPI.assignStudent({ teamId: showAssign, studentId: selectedStudent });
      setMessage({ type: "success", text: "Student assigned successfully!" });
      setSelectedStudent("");
      setShowAssign(null);
      loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to assign student" });
    } finally {
      setActionLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-500 mt-1">Manage your project teams and sprints</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-red-500 hover:from-purple-700 hover:to-red-600 shadow-lg shadow-purple-500/25 transition-all duration-200 text-sm"
        >
          + Create Team
        </button>
      </div>

      {message.text && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create Team Form */}
      {showCreate && (
        <form
          onSubmit={handleCreateTeam}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900">Create New Team</h3>
          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <input
            type="text"
            placeholder="Project Title"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <textarea
            placeholder="Project Description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-red-500 text-sm disabled:opacity-50"
            >
              {actionLoading ? "Creating..." : "Create Team"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-6 py-2.5 rounded-xl text-gray-600 bg-gray-100 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Sprint Form */}
      {showSprint && (
        <form
          onSubmit={handleCreateSprint}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900">Create Sprint</h3>
          <input
            type="number"
            placeholder="Sprint Number"
            value={sprintNumber}
            onChange={(e) => setSprintNumber(e.target.value)}
            required
            min="1"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-red-500 text-sm disabled:opacity-50"
            >
              {actionLoading ? "Creating..." : "Create Sprint"}
            </button>
            <button
              type="button"
              onClick={() => setShowSprint(null)}
              className="px-6 py-2.5 rounded-xl text-gray-600 bg-gray-100 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Assign Student Form */}
      {showAssign && (
        <form
          onSubmit={handleAssignStudent}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900">Assign Student</h3>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-red-500 text-sm disabled:opacity-50"
            >
              {actionLoading ? "Assigning..." : "Assign Student"}
            </button>
            <button
              type="button"
              onClick={() => setShowAssign(null)}
              className="px-6 py-2.5 rounded-xl text-gray-600 bg-gray-100 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Teams List */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 text-lg">No teams created yet</p>
          <p className="text-gray-400 text-sm mt-2">Create your first team to get started</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{team.teamName}</h3>
                    {team.projectTitle && (
                      <p className="text-sm text-purple-600 font-medium">{team.projectTitle}</p>
                    )}
                    {team.projectDescription && (
                      <p className="text-sm text-gray-500 mt-1">{team.projectDescription}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAssign(showAssign === team.id ? null : team.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                      + Add Student
                    </button>
                    <button
                      onClick={() => setShowSprint(showSprint === team.id ? null : team.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      + Add Sprint
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Members */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Members ({team.members.length})
                    </h4>
                    {team.members.length > 0 ? (
                      <div className="space-y-2">
                        {team.members.map((m) => (
                          <div key={m.id} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-xs text-purple-700 font-bold">
                                {m.student.name.charAt(0)}
                              </span>
                            </div>
                            {m.student.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No members yet</p>
                    )}
                  </div>

                  {/* Sprints */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Sprints ({team.sprints.length})
                    </h4>
                    {team.sprints.length > 0 ? (
                      <div className="space-y-2">
                        {team.sprints.map((s) => (
                          <div key={s.id} className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                            Sprint {s.sprintNumber} •{" "}
                            {new Date(s.startDate).toLocaleDateString()} -{" "}
                            {new Date(s.endDate).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No sprints yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
