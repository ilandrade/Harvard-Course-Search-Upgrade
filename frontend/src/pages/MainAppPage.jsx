import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useApp, SEMESTERS } from "../context/AppContext";

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function MainAppPage() {
  const navigate = useNavigate();
  const { primaryConcs, secondary } = useApp();
  const [activeTab, setActiveTab] = useState("courses");

  const allConcs = useMemo(
    () => [...primaryConcs, ...(secondary ? [secondary] : [])],
    [primaryConcs, secondary]
  );

  const tabs = [
    { id: "courses", label: "Courses" },
    { id: "planner", label: "Semester Planner" },
    { id: "requirements", label: "Requirements" },
  ];

  return (
    <div className="min-h-screen bg-[#eeede9]">
      <div className="max-w-2xl mx-auto bg-white min-h-screen flex flex-col">

        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <button
            onClick={() => navigate("/concentration")}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">Your plan</p>
            <div className="flex gap-1.5 flex-wrap">
              {allConcs.map((c) => (
                <span
                  key={c.name}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-crimson-600 text-white"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-crimson-600 text-crimson-600 font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {activeTab === "courses" && <CoursesTab allConcs={allConcs} />}
          {activeTab === "planner" && <PlannerTab />}
          {activeTab === "requirements" && <RequirementsTab allConcs={allConcs} />}
        </div>
      </div>
    </div>
  );
}

// ─── Courses Tab ───────────────────────────────────────────────────────────────

function CoursesTab({ allConcs }) {
  const { concentrationDetails, addConcentrationDetail, addCourse, removeCourse, isAdded, semesterPlan } = useApp();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [allSeasCourses, setAllSeasCourses] = useState([]);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => setAllSeasCourses(data));
  }, []);

  useEffect(() => {
    allConcs.forEach((conc) => {
      if (!concentrationDetails[conc.name]) {
        fetch(`/api/concentrations/${encodeURIComponent(conc.name)}`)
          .then((r) => r.json())
          .then((data) => addConcentrationDetail(conc.name, data));
      }
    });
  }, [allConcs]);

  const { requiredIds, allCourses } = useMemo(() => {
    const reqIds = new Set();
    const reqCourses = [];
    const seenReq = new Set();

    allConcs.forEach((conc) => {
      const detail = concentrationDetails[conc.name];
      if (!detail) return;
      detail.seas_required_course_matches.forEach((match) => {
        match.matches.forEach((m) => {
          const id = slugify(m.catalog_number);
          reqIds.add(id);
          if (seenReq.has(id)) return;
          seenReq.add(id);
          reqCourses.push({
            id,
            code: m.catalog_number,
            name: m.title,
            type: "req",
            credits: 4,
            desc: m.instructors_seen.slice(0, 2).join(", ") || "SEAS",
            conc: conc.name,
          });
        });
      });
    });

    const elecCourses = allSeasCourses
      .filter((c) => !reqIds.has(c.id))
      .map((c) => ({
        id: c.id,
        code: c.course_number,
        name: c.title,
        type: "elec",
        credits: c.credits || 4,
        desc: (c.instructors || []).slice(0, 2).join(", ") || c.department || "SEAS",
        conc: c.department,
      }));

    return { requiredIds: reqIds, allCourses: [...reqCourses, ...elecCourses] };
  }, [concentrationDetails, allConcs, allSeasCourses]);

  const loading = allConcs.some((c) => !concentrationDetails[c.name]);

  const filtered = useMemo(() => {
    let result = allCourses;
    if (activeFilter === "Required") result = result.filter((c) => c.type === "req");
    else if (activeFilter === "Elective") result = result.filter((c) => c.type === "elec");
    else if (activeFilter !== "All") result = result.filter((c) => c.conc === activeFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allCourses, activeFilter, search]);

  const filterOptions = ["All", ...allConcs.map((c) => c.name), "Required", "Elective"];

  function handleToggle(course) {
    if (isAdded(course.id)) {
      const sem = Object.entries(semesterPlan).find(([, cs]) =>
        cs.some((c) => c.id === course.id)
      )?.[0];
      if (sem) removeCourse(course.id, sem);
    } else {
      addCourse(course);
    }
  }

  return (
    <div className="px-5 py-4">
      <div className="relative mb-2.5">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          viewBox="0 0 16 16" fill="none"
        >
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="9.9" y1="9.9" x2="13.5" y2="13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by course name, code, or instructor…"
          className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-crimson-600 focus:ring-2 focus:ring-crimson-100"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-2.5">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              activeFilter === f
                ? "bg-crimson-600 border-crimson-600 text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {(search || activeFilter !== "All") && !loading && (
        <p className="text-xs text-gray-400 mb-2">
          {filtered.length} of {allCourses.length} courses
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-14">
          <div className="w-6 h-6 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">No courses match &ldquo;{search || activeFilter}&rdquo;</p>
          <p className="text-xs mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              added={isAdded(course.id)}
              onToggle={() => handleToggle(course)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseRow({ course, added, onToggle }) {
  return (
    <div
      className={`border rounded-lg px-3.5 py-3 transition-colors ${
        added ? "border-crimson-600 bg-crimson-50" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 mb-0.5">
            {course.code} · {course.conc}
          </p>
          <p className="text-sm font-medium text-gray-900">{course.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              course.type === "req"
                ? "bg-crimson-50 text-crimson-700"
                : "bg-emerald-50 text-emerald-700"
            }`}>
              {course.type === "req" ? "Required" : "Elective"}
            </span>
            <span className="text-xs text-gray-400">
              {course.credits} credits · {course.desc}
            </span>
          </div>
        </div>
        <button
          onClick={onToggle}
          title={added ? "Remove from plan" : "Add to plan"}
          className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm shrink-0 transition-all mt-0.5 ${
            added
              ? "bg-crimson-600 border-crimson-600 text-white hover:bg-red-500 hover:border-red-500"
              : "border-gray-300 text-gray-400 hover:bg-crimson-600 hover:border-crimson-600 hover:text-white"
          }`}
        >
          {added ? "✓" : "+"}
        </button>
      </div>
    </div>
  );
}

// ─── Planner Tab ───────────────────────────────────────────────────────────────

function PlannerTab() {
  const { semesterPlan, removeCourse, moveCourse } = useApp();
  const [dragOverSem, setDragOverSem] = useState(null);

  const totalCredits = Object.values(semesterPlan).flat().reduce((s, c) => s + (c.credits || 0), 0);
  const totalCourses = Object.values(semesterPlan).flat().length;
  const activeSems = Object.values(semesterPlan).filter((s) => s.length > 0).length;

  function handleDragOver(e, sem) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSem(sem);
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverSem(null);
    }
  }

  function handleDrop(e, toSem) {
    e.preventDefault();
    setDragOverSem(null);
    const courseId = e.dataTransfer.getData("courseId");
    const fromSem = e.dataTransfer.getData("fromSem");
    if (courseId && fromSem && fromSem !== toSem) {
      moveCourse(courseId, fromSem, toSem);
    }
  }

  return (
    <div className="px-5 py-4">
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { val: totalCourses, lbl: "courses planned" },
          { val: totalCredits, lbl: "total credits" },
          { val: activeSems, lbl: "active semesters" },
        ].map(({ val, lbl }) => (
          <div key={lbl} className="bg-gray-50 rounded-lg p-3.5 text-center">
            <p className="text-2xl font-medium text-crimson-600">{val}</p>
            <p className="text-xs text-gray-400 mt-0.5">{lbl}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {SEMESTERS.map((sem) => {
          const courses = semesterPlan[sem] || [];
          const credits = courses.reduce((s, c) => s + (c.credits || 0), 0);
          const isOver = dragOverSem === sem;
          return (
            <div
              key={sem}
              onDragOver={(e) => handleDragOver(e, sem)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, sem)}
              className={`border rounded-xl overflow-hidden transition-colors ${
                isOver ? "border-crimson-400 bg-crimson-50" : "border-gray-200"
              }`}
            >
              <div className={`px-3.5 py-2.5 flex justify-between items-center transition-colors ${
                isOver ? "bg-crimson-50" : "bg-gray-50"
              }`}>
                <span className="text-sm font-medium text-gray-700">{sem}</span>
                <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                  {credits} cr
                </span>
              </div>
              <div className="px-3.5 py-2.5">
                {courses.length === 0 ? (
                  <div className={`min-h-9 border border-dashed rounded-lg flex items-center justify-center transition-colors ${
                    isOver ? "border-crimson-300" : "border-gray-200"
                  }`}>
                    <span className={`text-xs transition-colors ${isOver ? "text-crimson-400" : "text-gray-300"}`}>
                      {isOver ? "Drop here" : "No courses yet"}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 min-h-9">
                    {courses.map((c) => (
                      <CoursePill
                        key={c.id}
                        course={c}
                        semester={sem}
                        onRemove={() => removeCourse(c.id, sem)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoursePill({ course, semester, onRemove }) {
  function handleDragStart(e) {
    e.dataTransfer.setData("courseId", course.id);
    e.dataTransfer.setData("fromSem", semester);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2.5 py-1 text-xs cursor-grab active:cursor-grabbing active:opacity-50 active:scale-95 transition-all select-none"
    >
      <span className="text-gray-400 font-mono text-[11px]">{course.code}</span>
      <span className="text-gray-700 max-w-[110px] truncate">{course.name}</span>
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="text-gray-300 hover:text-red-500 transition-colors leading-none ml-0.5"
      >
        ×
      </button>
    </div>
  );
}

// ─── Requirements Tab ──────────────────────────────────────────────────────────

function RequirementsTab({ allConcs }) {
  const { concentrationDetails, addConcentrationDetail, semesterPlan } = useApp();

  const addedIds = useMemo(
    () => new Set(Object.values(semesterPlan).flat().map((c) => c.id)),
    [semesterPlan]
  );

  useEffect(() => {
    allConcs.forEach((conc) => {
      if (!concentrationDetails[conc.name]) {
        fetch(`/api/concentrations/${encodeURIComponent(conc.name)}`)
          .then((r) => r.json())
          .then((data) => addConcentrationDetail(conc.name, data));
      }
    });
  }, [allConcs]);

  const loading = allConcs.some((c) => !concentrationDetails[c.name]);

  const concData = useMemo(() => {
    return allConcs.map((conc) => {
      const detail = concentrationDetails[conc.name];
      if (!detail) return null;
      const seen = new Set();
      const uniq = detail.seas_required_course_matches
        .flatMap((m) => m.matches.map((c) => ({ id: slugify(c.catalog_number), name: c.title, code: c.catalog_number })))
        .filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
      const done = uniq.filter((c) => addedIds.has(c.id)).length;
      return { name: conc.name, uniq, done, total: uniq.length, pct: uniq.length ? Math.round(done / uniq.length * 100) : 0 };
    }).filter(Boolean);
  }, [concentrationDetails, allConcs, addedIds]);

  const totalReq = concData.reduce((s, c) => s + c.total, 0);
  const doneReq = concData.reduce((s, c) => s + c.done, 0);
  const overallPct = totalReq ? Math.round(doneReq / totalReq * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-14">
        <div className="w-6 h-6 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      {concData.map((data) => (
        <div key={data.name} className="mb-7">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-base font-medium text-gray-900">{data.name}</h3>
            <span className="text-xs text-gray-400">{data.done}/{data.total} required</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-crimson-600 rounded-full transition-all duration-500"
              style={{ width: `${data.pct}%` }}
            />
          </div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 pb-1.5 border-b border-gray-100">
            Required courses
          </p>
          <div className="flex flex-col gap-2">
            {data.uniq.map((c) => {
              const isDone = addedIds.has(c.id);
              return (
                <div key={c.id} className="flex items-center gap-2.5">
                  <div
                    className={`w-[18px] h-[18px] rounded-full shrink-0 border flex items-center justify-center text-[11px] ${
                      isDone ? "bg-crimson-600 border-crimson-600 text-white" : "border-gray-300"
                    }`}
                  >
                    {isDone && "✓"}
                  </div>
                  <span className="text-sm text-gray-800 flex-1">{c.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{c.code}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {concData.length > 1 && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-500">Overall progress</span>
            <span className="text-sm font-medium text-gray-700">{overallPct}%</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-crimson-600 rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
