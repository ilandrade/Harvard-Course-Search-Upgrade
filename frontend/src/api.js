const get = (url) => fetch(url).then(r => r.json());

let _courses = null;
let _tags = null;

async function getCourses() {
  if (!_courses) _courses = await get("/data/courses.json");
  return _courses;
}

async function getTags() {
  if (!_tags) _tags = await get("/data/tags.json");
  return _tags;
}

export async function fetchPlans() {
  const reqs = await get("/data/cs_requirements.json");
  return [...new Set(reqs.map(r => r.plan))].filter(p => !p.includes(";"));
}

export async function fetchCSRequirements(plan) {
  const reqs = await get("/data/cs_requirements.json");
  const rows = reqs.filter(r => r.plan === plan && r.requirement_type !== "summary");
  const groups = {};
  for (const r of rows) {
    const g = r.requirement_group;
    (groups[g] = groups[g] || []).push(r);
  }
  return Object.entries(groups).map(([group, requirements]) => ({ group, requirements }));
}

export async function fetchGenEdRequirements() {
  const gened = await get("/data/gened.json");
  const groups = {};
  for (const r of gened) {
    const g = r.requirement_category;
    (groups[g] = groups[g] || []).push(r);
  }
  return Object.entries(groups).map(([group, requirements]) => ({ group, requirements }));
}

export async function fetchGenEdCourses() {
  return get("/data/gened_courses.json");
}

export async function fetchCoursesByTag(tag) {
  const courses = await getCourses();
  return courses.filter(c => c.tags_list.includes(tag));
}

export async function fetchCourses(q = "", tag = "") {
  const courses = await getCourses();
  return courses.filter(c => {
    const matchQ = !q || c.course_number.toLowerCase().includes(q.toLowerCase()) || c.title.toLowerCase().includes(q.toLowerCase());
    const matchTag = !tag || c.tags_list.includes(tag);
    return matchQ && matchTag;
  });
}

export async function fetchTags() {
  return getTags();
}
