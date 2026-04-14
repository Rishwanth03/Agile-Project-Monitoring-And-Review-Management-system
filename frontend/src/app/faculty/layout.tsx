"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";

const facultyNav = [
  { label: "Dashboard", href: "/faculty/dashboard", icon: "📊" },
  { label: "Submissions", href: "/faculty/submissions", icon: "📄" },
  { label: "Teams", href: "/faculty/teams", icon: "👥" },
  { label: "Analytics", href: "/faculty/analytics", icon: "📈" },
];

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "faculty")) {
      router.push("/login?role=faculty");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar items={facultyNav} accentColor="purple" />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
