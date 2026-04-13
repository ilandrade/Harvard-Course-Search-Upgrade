import React, { useState, useEffect, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import CourseCard from "../components/CourseCard";
import { Loader2, BookOpen } from "lucide-react";

const EMPTY_FILTERS = { dept: "", term: "", level: "" };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/departments").then((r) => r.json()),
      fetch("/api/terms").then((r) => r.json()),
    ]).then(([depts, trms]) => {
      setDepartments(depts);
      setTerms(trms);
    });
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query)       params.set("q",     query);
    if (filters.dept) params.set("dept", filters.dept);
    if (filters.term) params.set("term", filters.term);
    if (filters.level) params.set("level", filters.level);

    try {
      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      setCourses(data);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [query, filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchCourses, 250);
    return () => clearTimeout(timeout);
  }, [fetchCourses]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Course Search</h1>
        <p className="text-sm text-gray-500">
          Browse and search Harvard courses across all departments and terms.
        </p>
      </div>

      <div className="mb-6">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="flex gap-6 items-start">
        <FilterPanel
          departments={departments}
          terms={terms}
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching…
                </span>
              ) : (
                !initialLoad && `${courses.length} course${courses.length !== 1 ? "s" : ""} found`
              )}
            </p>
          </div>

          {!loading && courses.length === 0 && !initialLoad ? (
            <div className="card p-12 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No courses found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or clearing the filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
