import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
};

// Student APIs
export const studentAPI = {
  getDashboard: () => api.get("/student/dashboard"),
  submitSprint: (data: FormData) =>
    api.post("/student/submit-sprint", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getSubmissions: () => api.get("/student/submissions"),
  getHistory: () => api.get("/student/history"),
};

// Faculty APIs
export const facultyAPI = {
  getDashboard: () => api.get("/faculty/dashboard"),
  getSubmissions: () => api.get("/faculty/submissions"),
  review: (data: any) => api.post("/faculty/review", data),
  createTeam: (data: any) => api.post("/faculty/create-team", data),
  assignStudent: (data: any) => api.post("/faculty/assign-student", data),
  createSprint: (data: any) => api.post("/faculty/create-sprint", data),
  getTeams: () => api.get("/faculty/teams"),
  getStudents: () => api.get("/faculty/students"),
};

// Analytics APIs
export const analyticsAPI = {
  getStudentAnalytics: (id: string) => api.get(`/analytics/student/${id}`),
  getOverview: () => api.get("/analytics/overview"),
};

export default api;
