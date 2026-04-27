import React, { useEffect, useState, useCallback } from "react";
import { Search, X, ChevronDown, ChevronRight, User, Clock } from "lucide-react";
import { fetchCourses, fetchTags } from "../api";

const TAG_DOT_COLORS = {
  corecs: "#3b82f6", advancedcs: "#a855f7", programming1: "#22c55e",
  programming2: "#10b981", formalreasoning: "#eab308", complimitations: "#f97316",
  algorithms: "#ef4444", intermediatealgorithms: "#ec4899", systems: "#6366f1",
  computationandtheworld: "#14b8a6", ai: "#8b5cf6", probability: "#f59e0b",
  linearalgebra: "#06b6d4", discretemath: "#84cc16", secondary: "#9ca3af",
};

const CATEGORY_COLORS = {
  corecs: "bg-blue-100 text-blue-800 border-blue-300",
  advancedcs: "bg-purple-100 text-purple-800 border-purple-300",
  programming1: "bg-green-100 text-green-800 border-green-300",
  programming2: "bg-emerald-100 text-emerald-800 border-emerald-300",
  formalreasoning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  complimitations: "bg-orange-100 text-orange-800 border-orange-300",
  algorithms: "bg-red-100 text-red-800 border-red-300",
  intermediatealgorithms: "bg-pink-100 text-pink-800 border-pink-300",
  systems: "bg-indigo-100 text-indigo-800 border-indigo-300",
  computationandtheworld: "bg-teal-100 text-teal-800 border-teal-300",
  ai: "bg-violet-100 text-violet-800 border-violet-300",
  probability: "bg-amber-100 text-amber-800 border-amber-300",
  linearalgebra: "bg-cyan-100 text-cyan-800 border-cyan-300",
  discretemath: "bg-lime-100 text-lime-800 border-lime-300",
  secondary: "bg-gray-100 text-gray-700 border-gray-300",
};

function RequirementBadge({ tag, label }) {
  const color = CATEGORY_COLORS[tag] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${color}`}>
      {label}
    </span>
  );
}

function CourseCard({ course, tags, expanded, onToggle }) {
  const satisfies = course.tags_list?.filter(t => t && t !== "") ?? [];
  const tagMap = Object.fromEntries(tags.map(t => [t.tag, t.label]));

  return (
    <div
      className={`bg-white border rounded-xl transition-all cursor-pointer ${expanded ? "border-crimson shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}
      onClick={onToggle}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-crimson">{course.course_number}</span>
            {course.is_advancedcs && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">Advanced</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800 mt-0.5 leading-snug">{course.title}</p>
          {!expanded && satisfies.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">Satisfies {satisfies.length} requirement{satisfies.length !== 1 ? "s" : ""}</p>
          )}
        </div>
        {expanded
          ? <ChevronDown size={16} className="text-gray-400 shrink-0 mt-0.5" />
          : <ChevronRight size={16} className="text-gray-400 shrink-0 mt-0.5" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {(course.instructor || course.meeting_time) && (
            <div className="flex flex-wrap gap-3">
              {course.instructor && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <User size={11} /> {course.instructor}
                </div>
              )}
              {course.meeting_time && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={11} /> {course.meeting_time}
                </div>
              )}
            </div>
          )}
          {course.description && (
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">{course.description}</p>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Satisfies requirements</p>
            {satisfies.length === 0 ? (
              <p className="text-xs text-gray-400">No tagged requirements found.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {satisfies.map(t => (
                  <RequirementBadge key={t} tag={t} label={tagMap[t] ?? t} />
                ))}
              </div>
            )}
          </div>
          {course.notes && (
            <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2">{course.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CoursesView() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [courses, setCourses] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchTags().then(setTags);
  }, []);

  const runSearch = useCallback(async (q, tag) => {
    setLoading(true);
    const data = await fetchCourses(q, tag);
    setCourses(data);
    setExpandedId(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    runSearch(query, activeTag);
  }, [query, activeTag, runSearch]);

  function toggleTag(tag) {
    setActiveTag(prev => (prev === tag ? "" : tag));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Search</h2>
        <p className="text-gray-500 text-sm mt-1">Find a course, then see which requirements it satisfies.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className="w-52 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Filter by requirement</p>
          <div className="space-y-0.5">
            {tags.map(t => (
              <button
                key={t.tag}
                onClick={() => toggleTag(t.tag)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5 ${
                  activeTag === t.tag
                    ? "bg-crimson text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: activeTag === t.tag ? "white" : (TAG_DOT_COLORS[t.tag] ?? "#9ca3af") }}
                />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag("")}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1"
              >
                <X size={10} /> Clear filter
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by course number or title…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
          ) : courses.length === 0 ? (
            <div className="text-sm text-gray-400 py-12 text-center">No courses match your search.</div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-3">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.map(c => (
                  <CourseCard
                    key={c.course_number}
                    course={c}
                    tags={tags}
                    expanded={expandedId === c.course_number}
                    onToggle={() => setExpandedId(prev => prev === c.course_number ? null : c.course_number)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
