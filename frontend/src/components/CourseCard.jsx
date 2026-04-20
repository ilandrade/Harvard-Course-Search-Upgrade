import React from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, CalendarDays } from "lucide-react";
import { useApp } from "../context/AppContext";

const DEPT_COLORS = {
  CS:     "bg-blue-100 text-blue-700",
  AM:     "bg-indigo-100 text-indigo-700",
  AC:     "bg-violet-100 text-violet-700",
  ES:     "bg-cyan-100 text-cyan-700",
  ENG:    "bg-teal-100 text-teal-700",
  APMTH:  "bg-indigo-100 text-indigo-700",
  STAT:   "bg-yellow-100 text-yellow-700",
  MATH:   "bg-purple-100 text-purple-700",
  PHYSCI: "bg-emerald-100 text-emerald-700",
  COMPSCI:"bg-blue-100 text-blue-700",
  BE:     "bg-rose-100 text-rose-700",
  CEE:    "bg-orange-100 text-orange-700",
  MSE:    "bg-amber-100 text-amber-700",
  AP:     "bg-pink-100 text-pink-700",
};

const PALETTE = [
  "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700", "bg-yellow-100 text-yellow-700",
  "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700", "bg-cyan-100 text-cyan-700",
];

function deptColor(dept) {
  if (DEPT_COLORS[dept]) return DEPT_COLORS[dept];
  let hash = 0;
  for (let i = 0; i < dept.length; i++) hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const { toggleSaved, isSaved } = useApp();
  const saved = isSaved(course.id);
  const color = deptColor(course.department);

  function handleSave(e) {
    e.stopPropagation();
    toggleSaved(course);
  }

  return (
    <div
      className="card p-5 cursor-pointer"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`badge ${color}`}>{course.department}</span>
            <span className="badge bg-gray-100 text-gray-600">{course.level}</span>
          </div>
          <p className="text-xs font-mono text-gray-400 mb-0.5">{course.course_number}</p>
          <h3 className="font-semibold text-gray-900 leading-snug mb-1 group-hover:text-crimson-600 transition-colors">
            {course.title}
          </h3>
          {course.terms?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-1">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
              {course.terms.map((t) => (
                <span key={t} className="text-xs text-gray-500">{t}</span>
              )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`sep-${i}`} className="text-gray-300">·</span>, el], [])}
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          className={`shrink-0 p-2 rounded-lg transition-colors duration-150 ${
            saved
              ? "text-crimson-600 bg-crimson-50 hover:bg-crimson-100"
              : "text-gray-400 hover:text-crimson-600 hover:bg-crimson-50"
          }`}
          title={saved ? "Remove from saved" : "Save course"}
        >
          {saved ? (
            <BookmarkCheck className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      {course.instructors?.length > 0 && (
        <p className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-3">
          {course.instructors.join(" · ")}
        </p>
      )}
    </div>
  );
}
