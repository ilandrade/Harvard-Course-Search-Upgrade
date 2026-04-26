import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, GraduationCap } from "lucide-react";
import { fetchPlans, fetchCSRequirements, fetchGenEdRequirements, fetchCoursesByTag } from "../api";

const TAG_LABELS = {
  corecs: "Core CS", advancedcs: "Advanced CS", secondary: "Secondary Field",
  programming1: "Programming 1", programming2: "Programming 2",
  formalreasoning: "Formal Reasoning", complimitations: "Comp & Limitations",
  algorithms: "Algorithms", intermediatealgorithms: "Intermediate Algorithms",
  systems: "Systems", computationandtheworld: "Computation & the World",
  ai: "AI", probability: "Probability", linearalgebra: "Linear Algebra",
  discretemath: "Discrete Math",
};

function CoursePill({ course }) {
  const tags = course.tags_list?.filter(t => t && t !== "secondary") ?? [];
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-crimson hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-xs font-semibold text-crimson">{course.course_number}</span>
          <p className="text-sm text-gray-800 mt-0.5 leading-snug">{course.title}</p>
          {course.notes && <p className="text-xs text-gray-400 mt-1 italic">{course.notes}</p>}
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {TAG_LABELS[t] ?? t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RequirementRow({ req, isCS }) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState(null);
  const [loading, setLoading] = useState(false);

  const tagKey = req.tag_key;
  const canExpand = isCS && tagKey;

  async function toggle() {
    if (!canExpand) return;
    if (!open && courses === null) {
      setLoading(true);
      const data = await fetchCoursesByTag(tagKey);
      setCourses(data);
      setLoading(false);
    }
    setOpen(o => !o);
  }

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={toggle}
        className={`w-full text-left px-4 py-3 flex items-center gap-3 bg-white transition-colors ${canExpand ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}`}
      >
        {canExpand ? (
          open ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-800">{req.requirement_name}</span>
            {req.required === "yes" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-crimson/10 text-crimson font-medium">Required</span>
            )}
          </div>
          <div className="flex gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
            {req.count_min && <span>{req.count_min}{req.count_max && req.count_max !== req.count_min ? `–${req.count_max}` : ""} course{req.count_min !== "1" ? "s" : ""}</span>}
            {req.course_options && <span className="truncate max-w-xs">{req.course_options}</span>}
          </div>
          {req.notes && <p className="text-xs text-gray-400 mt-1 italic leading-snug">{req.notes}</p>}
        </div>
        {canExpand && (
          <span className="text-xs text-gray-400 shrink-0">
            {loading ? "Loading…" : open && courses ? `${courses.length} courses` : "See courses →"}
          </span>
        )}
      </button>

      {open && courses && (
        <div className="border-t border-gray-100 bg-gray-50 p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {courses.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-full">No courses found for this tag.</p>
          ) : (
            courses.map(c => <CoursePill key={c.course_number} course={c} />)
          )}
        </div>
      )}
    </div>
  );
}

function RequirementGroup({ group, isCS }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{group.group}</h3>
      <div className="space-y-1.5">
        {group.requirements.map((req, i) => (
          <RequirementRow key={i} req={req} isCS={isCS} />
        ))}
      </div>
    </div>
  );
}

export default function RequirementsView() {
  const [mode, setMode] = useState("cs"); // "cs" | "gened"
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("Basic");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans().then(p => setPlans(p));
  }, []);

  useEffect(() => {
    setLoading(true);
    setGroups([]);
    const load = mode === "cs"
      ? fetchCSRequirements(selectedPlan)
      : fetchGenEdRequirements();
    load.then(data => { setGroups(data); setLoading(false); });
  }, [mode, selectedPlan]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Requirements</h2>
        <p className="text-gray-500 text-sm mt-1">Choose a requirement to see which courses satisfy it.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("cs")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === "cs" ? "bg-crimson text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <GraduationCap size={14} /> CS Concentration
        </button>
        <button
          onClick={() => setMode("gened")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === "gened" ? "bg-crimson text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <BookOpen size={14} /> General Education
        </button>
      </div>

      {/* Plan selector (CS only) */}
      {mode === "cs" && plans.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {plans.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPlan(p)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${selectedPlan === p ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
      ) : (
        groups.map((g, i) => <RequirementGroup key={i} group={g} isCS={mode === "cs"} />)
      )}
    </div>
  );
}
