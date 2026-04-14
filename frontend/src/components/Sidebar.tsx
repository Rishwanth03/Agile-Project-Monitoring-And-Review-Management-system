"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  items: SidebarItem[];
  accentColor: "green" | "purple";
}

export default function Sidebar({ items, accentColor }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const activeClass =
    accentColor === "green"
      ? "bg-green-50 text-green-700 border-green-500"
      : "bg-purple-50 text-purple-700 border-purple-500";

  const hoverClass =
    accentColor === "green" ? "hover:bg-green-50/50" : "hover:bg-purple-50/50";

  const gradientClass =
    accentColor === "green"
      ? "from-green-500 to-blue-500"
      : "from-purple-600 to-red-500";

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
          >
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-base font-bold text-gray-900">Agile Monitor</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border-l-3 ${
                isActive
                  ? `${activeClass} border-l-[3px]`
                  : `text-gray-600 border-transparent ${hoverClass}`
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
          >
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full mt-2 px-4 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150 text-left"
        >
          ← Sign Out
        </button>
      </div>
    </aside>
  );
}
