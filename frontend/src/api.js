const BASE = "http://localhost:5001/api";

export const fetchPlans = () => fetch(`${BASE}/requirements/plans`).then(r => r.json());
export const fetchCSRequirements = (plan) => fetch(`${BASE}/requirements/cs?plan=${plan}`).then(r => r.json());
export const fetchGenEdRequirements = () => fetch(`${BASE}/requirements/gened`).then(r => r.json());
export const fetchCoursesByTag = (tag) => fetch(`${BASE}/tag/${tag}/courses`).then(r => r.json());
export const fetchCourses = (q = "", tag = "") =>
  fetch(`${BASE}/courses?q=${encodeURIComponent(q)}&tag=${encodeURIComponent(tag)}`).then(r => r.json());
export const fetchTags = () => fetch(`${BASE}/tags`).then(r => r.json());
