import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, CalendarDays, BookOpen, Bookmark, BookmarkCheck, GraduationCap } from "lucide-react";
import { useApp } from "../context/AppContext";

const SEMESTERS = ["Fall 2025", "Spring 2026", "Fall 2026"];

export default function PlannerPage() {
  const { planner, savedCourses, removeFromPlanner, addToPlanner, toggleSaved, isSaved } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("planner");

  const totalCredits = Object.values(planner)
    .flat()
    .reduce((sum, c) => sum + (c.credits ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Plan</h1>
        <p className="text-sm text-gray-500">
          Organize your courses by semester and manage your saved list.
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { id: "planner", label: "Semester Planner", icon: <CalendarDays className="w-4 h-4" /> },
          { id: "saved",   label: `Saved (${savedCourses.length})`, icon: <Bookmark className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-crimson-600 text-crimson-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "planner" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Total credits planned:{" "}
              <span className="font-semibold text-gray-800">{totalCredits}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SEMESTERS.map((sem) => {
              const courses = planner[sem] ?? [];
              const semCredits = courses.reduce((s, c) => s + (c.credits ?? 0), 0);
              return (
                <div key={sem} className="card p-4 flex flex-col min-h-64">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-800 text-sm">{sem}</h2>
                    <span className="text-xs text-gray-400">{semCredits} credits</span>
                  </div>

                  {courses.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-lg py-8 px-4">
                      <CalendarDays className="w-7 h-7 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400">No courses yet</p>
                      <button
                        onClick={() => navigate("/search")}
                        className="mt-2 text-xs text-crimson-600 hover:underline font-medium"
                      >
                        Browse courses →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 flex-1">
                      {courses.map((course) => (
                        <PlannerCourseRow
                          key={course.id}
                          course={course}
                          onRemove={() => removeFromPlanner(course.id, sem)}
                          onClick={() => navigate(`/courses/${course.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {savedCourses.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Add from Saved</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedCourses.map((course) => (
                  <QuickAddCard
                    key={course.id}
                    course={course}
                    planner={planner}
                    onAdd={addToPlanner}
                    onClick={() => navigate(`/courses/${course.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "saved" && (
        <div>
          {savedCourses.length === 0 ? (
            <div className="card p-16 text-center">
              <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No saved courses yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">
                Click the bookmark icon on any course to save it here.
              </p>
              <button onClick={() => navigate("/search")} className="btn-crimson">
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedCourses.map((course) => (
                <SavedCourseRow
                  key={course.id}
                  course={course}
                  planner={planner}
                  onAddToPlanner={addToPlanner}
                  onUnsave={() => toggleSaved(course)}
                  onClick={() => navigate(`/courses/${course.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlannerCourseRow({ course, onRemove, onClick }) {
  return (
    <div
      className="flex items-start justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2 group cursor-pointer hover:bg-crimson-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-gray-400">{course.course_number}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{course.title}</p>
        <p className="text-xs text-gray-400">{course.credits} credits</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="text-gray-300 hover:text-red-500 mt-0.5 transition-colors shrink-0"
        title="Remove"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function QuickAddCard({ course, planner, onAdd, onClick }) {
  const alreadyAdded = Object.values(planner).flat().some((c) => c.id === course.id);
  const [sem, setSem] = useState(course.term ?? "Fall 2025");

  if (alreadyAdded) return null;

  return (
    <div className="card p-3 flex items-start gap-3 cursor-pointer" onClick={onClick}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-gray-400">{course.course_number}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{course.title}</p>
      </div>
      <div className="flex flex-col gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <select
          value={sem}
          onChange={(e) => setSem(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
        >
          {["Fall 2025", "Spring 2026", "Fall 2026"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={() => onAdd(course, sem)}
          className="text-xs btn-crimson py-1 px-2 text-center"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

function SavedCourseRow({ course, planner, onAddToPlanner, onUnsave, onClick }) {
  const inPlanner = Object.values(planner).flat().some((c) => c.id === course.id);
  const [sem, setSem] = useState(course.term ?? "Fall 2025");

  return (
    <div
      className="card p-4 flex items-start justify-between gap-4 cursor-pointer hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 mb-1">
          <span className="badge bg-gray-100 text-gray-600 text-xs">{course.department}</span>
          <span className="badge bg-gray-100 text-gray-600 text-xs">{course.term}</span>
        </div>
        <p className="text-xs font-mono text-gray-400">{course.course_number}</p>
        <p className="font-semibold text-gray-900">{course.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{course.instructors?.join(", ")}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        {!inPlanner && (
          <>
            <select
              value={sem}
              onChange={(e) => setSem(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
            >
              {["Fall 2025", "Spring 2026", "Fall 2026"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => onAddToPlanner(course, sem)}
              className="btn-crimson text-xs py-1.5"
            >
              + Planner
            </button>
          </>
        )}
        {inPlanner && (
          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
            ✓ In Planner
          </span>
        )}
        <button
          onClick={onUnsave}
          className="text-gray-300 hover:text-red-500 transition-colors"
          title="Remove from saved"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
