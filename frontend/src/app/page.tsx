"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Agile Project Monitor</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login?role=student"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-all duration-150"
            >
              Student Login
            </Link>
            <Link
              href="/login?role=faculty"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all duration-150"
            >
              Faculty Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Agile Project Monitoring{" "}
          <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Simplified
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Monitor sprint progress, submit updates, and evaluate academic project
          performance in an Agile workflow.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login?role=student"
            className="px-8 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg shadow-green-500/25 transition-all duration-200 hover:-translate-y-0.5"
          >
            Student Login
          </Link>
          <Link
            href="/login?role=faculty"
            className="px-8 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-red-500 hover:from-purple-700 hover:to-red-600 shadow-lg shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5"
          >
            Faculty Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Sprint Tracking",
              desc: "Submit and track sprint progress with structured forms and file uploads.",
              icon: "📊",
              color: "from-green-500 to-emerald-500",
            },
            {
              title: "Faculty Reviews",
              desc: "Faculty members review submissions, assign marks, and provide detailed feedback.",
              icon: "📝",
              color: "from-blue-500 to-indigo-500",
            },
            {
              title: "Performance Analytics",
              desc: "Visualize trends with charts showing sprint progress and marks over time.",
              icon: "📈",
              color: "from-purple-500 to-pink-500",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}
              >
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; 2026 Agile Project Monitor. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <span className="hover:text-gray-900 cursor-pointer transition-colors">About</span>
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
