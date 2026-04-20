import React from "react";
import { X } from "lucide-react";

const LEVELS = ["Introductory", "100-level", "200-level", "300+-level"];

export default function FilterPanel({ departments, terms, filters, onChange, onClear }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  const hasFilters = filters.dept || filters.term || filters.level;

  return (
    <aside className="w-64 shrink-0">
      <div className="card p-4 sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 text-sm">Filters</h2>
          {hasFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-xs text-crimson-600 hover:text-crimson-700 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Department
            </label>
            <select
              value={filters.dept}
              onChange={(e) => set("dept", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crimson-400 bg-white text-gray-700"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Term
            </label>
            <select
              value={filters.term}
              onChange={(e) => set("term", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crimson-400 bg-white text-gray-700"
            >
              <option value="">All Terms</option>
              {terms.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Level
            </label>
            <div className="space-y-1.5">
              {LEVELS.map((lvl) => (
                <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="level"
                    value={lvl}
                    checked={filters.level === lvl}
                    onChange={() => set("level", lvl)}
                    className="accent-crimson-600"
                  />
                  <span className="text-sm text-gray-700">{lvl}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="level"
                  value=""
                  checked={filters.level === ""}
                  onChange={() => set("level", "")}
                  className="accent-crimson-600"
                />
                <span className="text-sm text-gray-700">All</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
