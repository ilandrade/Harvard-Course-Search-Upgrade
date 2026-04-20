import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bookmark, BookmarkCheck, CalendarDays,
  Tag, GraduationCap, BookOpen, Loader2,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const SEMESTERS = ["Fall 2025", "Spring 2026", "Fall 2026"];

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleSaved, isSaved, addToPlanner, removeFromPlanner, isInPlanner, getSemesterForCourse } = useApp();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSem, setSelectedSem] = useState(SEMESTERS[0]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/courses/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setCourse(data);
        setSelectedSem(data.term ?? SEMESTERS[0]);
      })
      .catch(() => setError("Course not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{error ?? "Something went wrong."}</p>
        <button onClick={() => navigate(-1)} className="btn-crimson mt-4">
          Go Back
        </button>
      </div>
    );
  }

  const saved = isSaved(course.id);
  const inPlanner = isInPlanner(course.id);
  const plannerSem = getSemesterForCourse(course.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-crimson-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Search
      </button>

      <div className="card p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge bg-gray-100 text-gray-600 text-xs">{course.department}</span>
              <span className="badge bg-gray-100 text-gray-600 text-xs">{course.term}</span>
              <span className="badge bg-gray-100 text-gray-600 text-xs">{course.level}</span>
            </div>
            <p className="font-mono text-sm text-gray-400 mb-1">{course.course_number}</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{course.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{course.instructors.join(", ")}</p>
          </div>

          <button
            onClick={() => toggleSaved(course)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              saved
                ? "bg-crimson-50 border-crimson-200 text-crimson-700 hover:bg-crimson-100"
                : "bg-white border-gray-200 text-gray-700 hover:border-crimson-400 hover:text-crimson-600"
            }`}
          >
            {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <InfoTile icon={<GraduationCap className="w-4 h-4" />} label="Level" value={course.level} />
          <InfoTile icon={<BookOpen className="w-4 h-4" />} label="Credits" value={`${course.credits} credits`} />
        </div>

        {course.aliases?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Also listed as</h3>
            <div className="flex flex-wrap gap-2">
              {course.aliases.map((a) => (
                <span key={a} className="badge bg-gray-100 text-gray-700 font-mono text-xs">{a}</span>
              ))}
            </div>
          </div>
        )}

        {course.semesters?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" /> Semester History
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Term</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Faculty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {course.semesters.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                        {s.term.charAt(0) + s.term.slice(1).toLowerCase()} {s.calendar_year}
                      </td>
                      <td className="px-4 py-2 text-gray-500">
                        {s.faculty?.length > 0 ? s.faculty.join(", ") : <span className="text-gray-300">TBD</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {course.prerequisites?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Prerequisites</h3>
            <div className="flex flex-wrap gap-2">
              {course.prerequisites.map((p) => (
                <span key={p} className="badge bg-gray-100 text-gray-700 font-mono text-xs">{p}</span>
              ))}
            </div>
          </div>
        )}

        {course.tags?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4" /> Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((t) => (
                <span key={t} className="badge bg-crimson-50 text-crimson-700">{t}</span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Add to Planner</h3>
          {inPlanner ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Added to <strong>{plannerSem}</strong>
              </span>
              <button
                onClick={() => removeFromPlanner(course.id, plannerSem)}
                className="btn-outline text-sm text-red-500 border-red-200 hover:border-red-400 hover:text-red-600"
              >
                Remove from Planner
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crimson-400 bg-white text-gray-700"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => addToPlanner(course, selectedSem)}
                className="btn-crimson flex items-center gap-1.5"
              >
                <CalendarDays className="w-4 h-4" />
                Add to Planner
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-sm text-gray-800 font-medium">{value}</div>
    </div>
  );
}
