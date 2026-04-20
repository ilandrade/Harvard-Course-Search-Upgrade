import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const AppContext = createContext(null);

export const SEMESTERS = [
  "Fall Y1", "Spring Y1",
  "Fall Y2", "Spring Y2",
  "Fall Y3", "Spring Y3",
  "Fall Y4", "Spring Y4",
];

function initPlan() {
  return Object.fromEntries(SEMESTERS.map((s) => [s, []]));
}

export function AppProvider({ children }) {
  const [primaryConcs, setPrimaryConcs] = useState([]);
  const [secondary, setSecondary] = useState(null);
  const [concentrationDetails, setConcentrationDetails] = useState({});
  const [semesterPlan, setSemesterPlan] = useState(initPlan);

  const addConcentrationDetail = useCallback((name, detail) => {
    setConcentrationDetails((prev) => ({ ...prev, [name]: detail }));
  }, []);

  const addedCourseIds = useMemo(
    () => new Set(Object.values(semesterPlan).flat().map((c) => c.id)),
    [semesterPlan]
  );

  const addCourse = useCallback((course) => {
    setSemesterPlan((prev) => {
      const firstSem = SEMESTERS[0];
      if ((prev[firstSem] || []).find((c) => c.id === course.id)) return prev;
      return { ...prev, [firstSem]: [...(prev[firstSem] || []), course] };
    });
  }, []);

  const removeCourse = useCallback((courseId, semester) => {
    setSemesterPlan((prev) => ({
      ...prev,
      [semester]: (prev[semester] || []).filter((c) => c.id !== courseId),
    }));
  }, []);

  const moveCourse = useCallback((courseId, fromSem, toSem) => {
    setSemesterPlan((prev) => {
      const course = (prev[fromSem] || []).find((c) => c.id === courseId);
      if (!course || fromSem === toSem) return prev;
      return {
        ...prev,
        [fromSem]: prev[fromSem].filter((c) => c.id !== courseId),
        [toSem]: [...(prev[toSem] || []), course],
      };
    });
  }, []);

  const isAdded = useCallback(
    (courseId) => addedCourseIds.has(courseId),
    [addedCourseIds]
  );

  const resetAll = useCallback(() => {
    setPrimaryConcs([]);
    setSecondary(null);
    setConcentrationDetails({});
    setSemesterPlan(initPlan());
  }, []);

  return (
    <AppContext.Provider
      value={{
        primaryConcs, setPrimaryConcs,
        secondary, setSecondary,
        concentrationDetails, addConcentrationDetail,
        semesterPlan, addedCourseIds,
        addCourse, removeCourse, moveCourse, isAdded,
        resetAll,
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
