import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import SearchPage from "./pages/SearchPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import PlannerPage from "./pages/PlannerPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/planner" element={<PlannerPage />} />
        </Routes>
      </main>
    </div>
  );
}
