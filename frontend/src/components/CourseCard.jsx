import React from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, Clock, Users, MapPin } from "lucide-react";
import { useApp } from "../context/AppContext";

const DEPT_COLORS = {
  "Computer Science":     "bg-blue-100 text-blue-700",
  "Mathematics":          "bg-purple-100 text-purple-700",
  "Economics":            "bg-green-100 text-green-700",
  "Statistics":           "bg-yellow-100 text-yellow-700",
  "History":              "bg-orange-100 text-orange-700",
  "Psychology":           "bg-pink-100 text-pink-700",
  "Biology":              "bg-emerald-100 text-emerald-700",
  "Chemistry":            "bg-teal-100 text-teal-700",
  "Philosophy":           "bg-violet-100 text-violet-700",
  "Government":           "bg-red-100 text-red-700",
  "Neuroscience":         "bg-rose-100 text-rose-700",
  "Engineering Sciences": "bg-cyan-100 text-cyan-700",
  "Applied Mathematics":  "bg-indigo-100 text-indigo-700",
  "Expository Writing":   "bg-amber-100 text-amber-700",
  "Anthropology":         "bg-lime-100 text-lime-700",
};

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const { toggleSaved, isSaved } = useApp();
  const saved = isSaved(course.id);
  const deptColor = DEPT_COLORS[course.department] ?? "bg-gray-100 text-gray-700";
  const fillPct = Math.round((course.enrollment / course.max_enrollment) * 100);

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
            <span className={`badge ${deptColor}`}>{course.department}</span>
            <span className="badge bg-gray-100 text-gray-600">{course.term}</span>
            {course.level === "Graduate" && (
              <span className="badge bg-crimson-100 text-crimson-700">Grad</span>
            )}
          </div>
          <p className="text-xs font-mono text-gray-400 mb-0.5">{course.course_number}</p>
          <h3 className="font-semibold text-gray-900 leading-snug mb-1 group-hover:text-crimson-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.schedule}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {course.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {course.enrollment}/{course.max_enrollment}
            </span>
          </div>

          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden w-48">
            <div
              className={`h-full rounded-full transition-all ${
                fillPct > 85 ? "bg-red-400" : fillPct > 60 ? "bg-yellow-400" : "bg-emerald-400"
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
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
