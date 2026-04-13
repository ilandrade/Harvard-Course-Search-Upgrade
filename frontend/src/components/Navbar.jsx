import React from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, CalendarDays, Search, Bookmark } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { savedCourses } = useApp();

  return (
    <nav className="bg-crimson-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <span className="font-semibold text-lg tracking-tight">
              Harvard Course Planner
            </span>
          </div>

          <div className="flex items-center gap-1">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Search className="w-4 h-4" />
              Search
            </NavLink>

            <NavLink
              to="/planner"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <CalendarDays className="w-4 h-4" />
              Planner
            </NavLink>

            <NavLink
              to="/planner"
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Bookmark className="w-4 h-4" />
              Saved
              {savedCourses.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-crimson-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {savedCourses.length}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
