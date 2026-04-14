"use client";

import { useState, useEffect } from "react";
import { studentAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Team {
  id: string;
  teamName: string;
  projectTitle: string;
}

interface Sprint {
  id: string;
  sprintNumber: number;
  teamId: string;
}

export default function SubmitSprint() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState("");
  const [tasksCompleted, setTasksCompleted] = useState("");
  const [challenges, setChallenges] = useState("");
  const [improvements, setImprovements] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    studentAPI.getDashboard().then((res) => {
      setTeams(res.data.teams || []);
      // Extract sprints from dashboard (simplified - get from submissions view)
    }).catch(console.error);

    // Get available sprints from submissions endpoint
    studentAPI.getSubmissions().then((res) => {
      const subs = res.data.submissions || [];
      const sprintMap = new Map<string, Sprint>();
      subs.forEach((s: any) => {
        if (!sprintMap.has(s.sprint.id)) {
          sprintMap.set(s.sprint.id, {
            id: s.sprint.id,
            sprintNumber: s.sprint.sprintNumber,
            teamId: s.sprint.teamId,
          });
        }
      });
      setSprints(Array.from(sprintMap.values()));
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint) {
      setError("Please select a sprint");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("sprintId", selectedSprint);
    formData.append("tasksCompleted", tasksCompleted);
    formData.append("challenges", challenges);
    formData.append("improvements", improvements);
    if (file) formData.append("file", file);

    try {
      await studentAPI.submitSprint(formData);
      setSuccess("Sprint submitted successfully!");
      setTasksCompleted("");
      setChallenges("");
      setImprovements("");
      setFile(null);
      setSelectedSprint("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submit Sprint Update</h1>
        <p className="text-gray-500 mt-1">Record your progress for the current sprint</p>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sprint</label>
          <select
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 text-sm"
            required
          >
            <option value="">Select Sprint</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                Sprint {s.sprintNumber}
              </option>
            ))}
          </select>
          {sprints.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">No sprints available. Your faculty needs to create sprints first.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tasks Completed</label>
          <textarea
            value={tasksCompleted}
            onChange={(e) => setTasksCompleted(e.target.value)}
            rows={4}
            placeholder="Describe the tasks you completed in this sprint..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Challenges Faced</label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            rows={3}
            placeholder="What challenges did you encounter?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Improvements Planned</label>
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            rows={3}
            placeholder="What improvements do you plan for the next sprint?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">File Upload</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx,.zip,.png,.jpg,.txt"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-green-50 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg shadow-green-500/25 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Sprint Update"}
        </button>
      </form>
    </div>
  );
}
