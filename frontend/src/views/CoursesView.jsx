import React, { useEffect, useState, useCallback } from "react";
import { Search, X, ChevronDown, ChevronRight } from "lucide-react";
import { fetchCourses, fetchTags } from "../api";

const CATEGORY_COLORS = {
  corecs: "bg-blue-50 text-blue-700 border-blue-200",
  advancedcs: "bg-purple-50 text-purple-700 border-purple-200",
  programming1: "bg-green-50 text-green-700 border-green-200",
  programming2: "bg-emerald-50 text-emerald-700 border-emerald-200",
  formalreasoning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  complimitations: "bg-orange-50 text-orange-700 border-orange-200",
  algorithms: "bg-red-50 text-red-700 border-red-200",
  intermediatealgorithms: "bg-pink-50 text-pink-700 border-pink-200",
  systems: "bg-indigo-50 text-indigo-700 border-indigo-200",
  computationandtheworld: "bg-teal-50 text-teal-700 border-teal-200",
  ai: "bg-violet-50 text-violet-700 border-violet-200",
  probability: "bg-amber-50 text-amber-700 border-amber-200",
  linearalgebra: "bg-cyan-50 text-cyan-700 border-cyan-200",
  discretemath: "bg-lime-50 text-lime-700 border-lime-200",
  secondary: "bg-gray-50 text-gray-600 border-gray-200",
};

function TagBadge({ tag, label, onClick, active }) {
  const color = active
    ? "bg-crimson text-white border-crimson"
    : (CATEGORY_COLORS[tag] ?? "bg-gray-50 text-gray-600 border-gray-200");
  return (
    <button
      onClick={() => onClick(tag)}
      className={`text-xs px-2 py-1 rounded-full border font-medium transition-all hover:opacity-80 ${color}`}
    >
      {label}
    </button>
  );
}

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
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
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
          {course.notes && (
            <p className="text-xs text-gray-400 mt-3 italic border-t border-gray-100 pt-2">{course.notes}</p>
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Search</h2>
        <p className="text-gray-500 text-sm mt-1">Find a course, then see which requirements it satisfies.</p>
      </div>

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

      {/* Tag filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {tags.map(t => (
          <TagBadge
            key={t.tag}
            tag={t.tag}
            label={t.label}
            onClick={toggleTag}
            active={activeTag === t.tag}
          />
        ))}
        {activeTag && (
          <button
            onClick={() => setActiveTag("")}
            className="text-xs px-2 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center gap-1"
          >
            <X size={10} /> Clear filter
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
  );
}
