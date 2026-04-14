"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";

const studentNav = [
  { label: "Dashboard", href: "/student/dashboard", icon: "📊" },
  { label: "Submit Sprint", href: "/student/submit-sprint", icon: "📝" },
  { label: "View Feedback", href: "/student/submissions", icon: "💬" },
  { label: "Sprint History", href: "/student/history", icon: "📋" },
  { label: "Analytics", href: "/student/analytics", icon: "📈" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
      router.push("/login?role=student");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar items={studentNav} accentColor="green" />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
