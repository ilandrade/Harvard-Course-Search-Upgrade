import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [savedCourses, setSavedCourses] = useState([]);
  const [planner, setPlanner] = useState({
    "Fall 2025": [],
    "Spring 2026": [],
    "Fall 2026": [],
  });

  const toggleSaved = useCallback((course) => {
    setSavedCourses((prev) =>
      prev.find((c) => c.id === course.id)
        ? prev.filter((c) => c.id !== course.id)
        : [...prev, course]
    );
  }, []);

  const isSaved = useCallback(
    (courseId) => savedCourses.some((c) => c.id === courseId),
    [savedCourses]
  );

  const addToPlanner = useCallback((course, semester) => {
    setPlanner((prev) => {
      const existing = prev[semester] || [];
      if (existing.find((c) => c.id === course.id)) return prev;
      return { ...prev, [semester]: [...existing, course] };
    });
  }, []);

  const removeFromPlanner = useCallback((courseId, semester) => {
    setPlanner((prev) => ({
      ...prev,
      [semester]: (prev[semester] || []).filter((c) => c.id !== courseId),
    }));
  }, []);

  const isInPlanner = useCallback(
    (courseId) =>
      Object.values(planner).some((sem) => sem.some((c) => c.id === courseId)),
    [planner]
  );

  const getSemesterForCourse = useCallback(
    (courseId) =>
      Object.entries(planner).find(([, courses]) =>
        courses.some((c) => c.id === courseId)
      )?.[0] ?? null,
    [planner]
  );

  return (
    <AppContext.Provider
      value={{
        savedCourses,
        planner,
        toggleSaved,
        isSaved,
        addToPlanner,
        removeFromPlanner,
        isInPlanner,
        getSemesterForCourse,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
