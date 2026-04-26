import React, { useState } from "react";
import { BookOpen, Search, GraduationCap } from "lucide-react";
import RequirementsView from "./views/RequirementsView";
import CoursesView from "./views/CoursesView";

function Landing({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <GraduationCap size={28} className="text-crimson" />
          <span className="text-xl font-bold text-gray-900">Harvard Course Search</span>
        </div>
        <p className="text-gray-500 text-sm">Choose how you'd like to explore courses.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        <button
          onClick={() => onSelect("requirements")}
          className="group bg-white border-2 border-gray-200 hover:border-crimson rounded-2xl p-6 text-left transition-all hover:shadow-md"
        >
          <BookOpen size={24} className="text-crimson mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Requirements First</h3>
          <p className="text-sm text-gray-500 leading-snug">
            Start from a requirement — see every course that satisfies it.
          </p>
          <span className="inline-block mt-4 text-xs font-medium text-crimson group-hover:underline">
            Browse requirements →
          </span>
        </button>

        <button
          onClick={() => onSelect("courses")}
          className="group bg-white border-2 border-gray-200 hover:border-crimson rounded-2xl p-6 text-left transition-all hover:shadow-md"
        >
          <Search size={24} className="text-crimson mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Course First</h3>
          <p className="text-sm text-gray-500 leading-snug">
            Search for a course — see every requirement it counts toward.
          </p>
          <span className="inline-block mt-4 text-xs font-medium text-crimson group-hover:underline">
            Search courses →
          </span>
        </button>
      </div>
    </div>
  );
}

function Nav({ view, onNavigate }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
      <button onClick={() => onNavigate("landing")} className="flex items-center gap-1.5 text-crimson font-bold text-sm hover:opacity-80">
        <GraduationCap size={18} />
        Harvard Course Search
      </button>
      <div className="flex gap-1 ml-auto">
        <button
          onClick={() => onNavigate("requirements")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "requirements" ? "bg-crimson text-white" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <BookOpen size={14} /> Requirements
        </button>
        <button
          onClick={() => onNavigate("courses")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "courses" ? "bg-crimson text-white" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <Search size={14} /> Courses
        </button>
      </div>
    </header>
  );
}

export default function App() {
  const [view, setView] = useState("landing");

  if (view === "landing") return <Landing onSelect={setView} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav view={view} onNavigate={setView} />
      <main>
        {view === "requirements" && <RequirementsView />}
        {view === "courses" && <CoursesView />}
      </main>
    </div>
  );
}
