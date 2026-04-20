import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useApp, SEMESTERS } from "../context/AppContext";

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function MainAppPage() {
  const navigate = useNavigate();
  const { primaryConcs, secondary, selectedTracks } = useApp();
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
          {activeTab === "courses" && <CoursesTab allConcs={allConcs} selectedTracks={selectedTracks} />}
          {activeTab === "planner" && <PlannerTab />}
          {activeTab === "requirements" && <RequirementsTab allConcs={allConcs} selectedTracks={selectedTracks} />}
        </div>
      </div>
    </div>
  );
}

// ─── Courses Tab ───────────────────────────────────────────────────────────────

function CoursesTab({ allConcs, selectedTracks }) {
  const { addCourse, removeCourse, isAdded, semesterPlan } = useApp();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [allSeasCourses, setAllSeasCourses] = useState([]);
  const [reqsData, setReqsData] = useState({});

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then(setAllSeasCourses);
  }, []);

  useEffect(() => {
    allConcs.forEach((conc) => {
      if (!reqsData[conc.name]) {
        const track = selectedTracks?.[conc.name];
        const url = `/api/requirements/${encodeURIComponent(conc.name)}${track ? `?track=${encodeURIComponent(track)}` : ""}`;
        fetch(url)
          .then((r) => r.json())
          .then((data) => setReqsData((prev) => ({ ...prev, [conc.name]: data })));
      }
    });
  }, [allConcs, selectedTracks]);

  const { requiredIds, allCourses } = useMemo(() => {
    const reqIds = new Set();
    const seen = new Set();
    const reqCourses = [];

    allConcs.forEach((conc) => {
      const data = reqsData[conc.name];
      if (!data || data.error) return;
      data.matched.forEach((m) => {
        if (!m.course) return;
        reqIds.add(m.course.id);
        if (seen.has(m.course.id)) return;
        seen.add(m.course.id);
        reqCourses.push({
          id: m.course.id,
          code: m.code,
          name: m.course.title,
          type: "req",
          credits: m.course.credits || 4,
          desc: (m.course.instructors || []).slice(0, 2).join(", ") || m.course.department || "SEAS",
          conc: conc.name,
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
  }, [reqsData, allConcs, allSeasCourses]);

  const loading = allConcs.some((c) => !reqsData[c.name]);

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

function RequirementsTab({ allConcs, selectedTracks }) {
  const { semesterPlan } = useApp();
  const [reqData, setReqData] = useState({});
  const [loading, setLoading] = useState(true);

  const addedIds = useMemo(
    () => new Set(Object.values(semesterPlan).flat().map((c) => c.id)),
    [semesterPlan]
  );

  useEffect(() => {
    let pending = allConcs.length;
    if (pending === 0) { setLoading(false); return; }
    allConcs.forEach((conc) => {
      const track = selectedTracks?.[conc.name];
      const url = `/api/requirements/${encodeURIComponent(conc.name)}${track ? `?track=${encodeURIComponent(track)}` : ""}`;
      fetch(url)
        .then((r) => r.json())
        .then((data) => setReqData((prev) => ({ ...prev, [conc.name]: data })))
        .finally(() => { pending--; if (pending === 0) setLoading(false); });
    });
  }, [allConcs]);

  if (loading) {
    return (
      <div className="flex justify-center py-14">
        <div className="w-6 h-6 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const concSummaries = allConcs.map((conc) => {
    const data = reqData[conc.name];
    if (!data || data.error) return null;
    const seasItems = data.matched.filter((m) => m.course);
    const done = seasItems.filter((m) => addedIds.has(m.course.id)).length;
    const pct = seasItems.length ? Math.round((done / seasItems.length) * 100) : 0;
    return { name: conc.name, data, seasItems, done, pct };
  }).filter(Boolean);

  const totalSeas = concSummaries.reduce((s, c) => s + c.seasItems.length, 0);
  const totalDone = concSummaries.reduce((s, c) => s + c.done, 0);
  const overallPct = totalSeas ? Math.round((totalDone / totalSeas) * 100) : 0;

  return (
    <div className="px-5 py-4">
      {concSummaries.map(({ name, data, seasItems, done, pct }) => (
        <div key={name} className="mb-8">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-base font-medium text-gray-900">{name}</h3>
              {selectedTracks?.[name] && (
                <p className="text-xs text-crimson-600 mt-0.5">{selectedTracks[name]}</p>
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0 mt-0.5">{data.total_courses}</span>
          </div>

          <div className="h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-crimson-600 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {done} of {seasItems.length} SEAS-listed requirements planned
          </p>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 pb-1.5 border-b border-gray-100">
            Required courses
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {data.matched.map((m, i) => {
              const isDone = m.course && addedIds.has(m.course.id);
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className={`w-[18px] h-[18px] rounded-full shrink-0 border flex items-center justify-center text-[11px] transition-colors ${
                      isDone
                        ? "bg-crimson-600 border-crimson-600 text-white"
                        : m.course
                        ? "border-gray-300"
                        : "border-dashed border-gray-200"
                    }`}
                  >
                    {isDone && "✓"}
                  </div>
                  <span className={`text-sm flex-1 ${m.course ? "text-gray-800" : "text-gray-400"}`}>
                    {m.course ? m.course.title : m.code}
                  </span>
                  <span className="text-xs text-gray-400 font-mono shrink-0">{m.code}</span>
                  {!m.course && (
                    <span className="text-[10px] text-gray-300 shrink-0">not in SEAS</span>
                  )}
                </div>
              );
            })}
          </div>

          {data.tutorials && data.tutorials !== "None required." && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
              <span className="font-medium text-gray-700">Tutorials: </span>{data.tutorials}
            </div>
          )}
        </div>
      ))}

      {concSummaries.length > 1 && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-500">Overall SEAS progress</span>
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
