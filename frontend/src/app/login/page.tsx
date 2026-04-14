"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "faculty" ? "faculty" : "student";
  const [role, setRole] = useState<"student" | "faculty">(initialRole);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegister && role === "student") {
      const deptValue = department.trim();
      const rollValue = rollNumber.trim();

      if (!/^[A-Z]+(?: [A-Z]+)*$/.test(deptValue)) {
        setError("Department must contain uppercase letters only for student registration");
        return;
      }

      if (!/^RA\d{13}$/.test(rollValue)) {
        setError("Roll number must be 15 characters: RA followed by 13 digits");
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          role,
          department,
          ...(role === "student" ? { rollNumber } : { designation }),
        });
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isStudent = role === "student";
  const gradientClass = isStudent
    ? "from-green-500 to-blue-500"
    : "from-purple-600 to-red-500";
  const bgAccent = isStudent ? "bg-green-50" : "bg-purple-50";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Agile Project Monitor</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Role Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isStudent ? "bg-white text-green-700 shadow-sm" : "text-gray-500"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setRole("faculty")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isStudent ? "bg-white text-purple-700 shadow-sm" : "text-gray-500"
              }`}
            >
              Faculty
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            {isRegister
              ? `Register as a ${role}`
              : `Sign in to your ${role} account`}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 ${bgAccent} focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  isStudent ? "focus:ring-green-500" : "focus:ring-purple-500"
                } text-sm`}
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-3 rounded-xl border border-gray-200 ${bgAccent} focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                isStudent ? "focus:ring-green-500" : "focus:ring-purple-500"
              } text-sm`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={`w-full px-4 py-3 rounded-xl border border-gray-200 ${bgAccent} focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                isStudent ? "focus:ring-green-500" : "focus:ring-purple-500"
              } text-sm`}
            />
            {isRegister && (
              <>
                <input
                  type="text"
                  placeholder="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value.toUpperCase())}
                  pattern="^[A-Z]+(?: [A-Z]+)*$"
                  title="Use uppercase letters only"
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 ${bgAccent} focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    isStudent ? "focus:ring-green-500" : "focus:ring-purple-500"
                  } text-sm`}
                />
                {isStudent ? (
                  <input
                    type="text"
                    placeholder="Roll Number"
                    value={rollNumber}
                    onChange={(e) =>
                      setRollNumber(e.target.value.toUpperCase().replace(/\s+/g, ""))
                    }
                    pattern="RA[0-9]{13}"
                    minLength={15}
                    maxLength={15}
                    title="Roll number must be RA followed by 13 digits"
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 ${bgAccent} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 text-sm`}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 ${bgAccent} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 text-sm`}
                  />
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${gradientClass} hover:opacity-90 transition-all duration-200 shadow-lg ${
                isStudent ? "shadow-green-500/25" : "shadow-purple-500/25"
              } disabled:opacity-50`}
            >
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className={`font-semibold ${isStudent ? "text-green-600" : "text-purple-600"}`}
            >
              {isRegister ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
