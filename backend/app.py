import json
import os
import re
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

with open(os.path.join(DATA_DIR, "SEAS_courses_clean.json")) as f:
    _RAW_COURSES = json.load(f)

with open(os.path.join(DATA_DIR, "harvard_concentrations_matched_seas_only.json")) as f:
    ALL_CONCENTRATIONS = json.load(f)


def _slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def _derive_level(catalog_number):
    m = re.search(r"\d+", catalog_number)
    if not m:
        return "Other"
    n = int(m.group())
    if n < 100:
        return "Introductory"
    elif n < 200:
        return "100-level"
    elif n < 300:
        return "200-level"
    else:
        return "300+-level"


def _normalize_term(sem):
    term_cap = sem["term"].capitalize()
    return f"{term_cap} {sem['calendar_year']}"


_TERM_SORT_KEY = {"Fall": 0, "Spring": 1, "Summer": 2}


def _term_sort(t):
    parts = t.split()
    return (int(parts[1]), _TERM_SORT_KEY.get(parts[0], 9))


def _build_course(raw):
    semesters = raw.get("semesters", [])
    terms = sorted({_normalize_term(s) for s in semesters}, key=_term_sort)
    term = terms[-1] if terms else ""
    return {
        "id": _slugify(raw["catalog_number"]),
        "course_number": raw["catalog_number"],
        "title": raw["title"],
        "department": raw["catalog_prefix"],
        "instructors": raw.get("instructors_seen", []),
        "term": term,
        "terms": terms,
        "level": _derive_level(raw["catalog_number"]),
        "description": "",
        "tags": [],
        "schedule": "",
        "location": "",
        "enrollment": None,
        "max_enrollment": None,
        "credits": 4,
        "prerequisites": [],
        "semesters": semesters,
        "aliases": raw.get("aliases", []),
    }


ALL_COURSES = [_build_course(c) for c in _RAW_COURSES]
_COURSE_BY_ID = {c["id"]: c for c in ALL_COURSES}

_ALL_TERMS = sorted(
    {t for c in ALL_COURSES for t in c["terms"]},
    key=_term_sort
)


@app.route("/api/courses", methods=["GET"])
def get_courses():
    q = request.args.get("q", "").lower().strip()
    dept = request.args.get("dept", "").strip()
    term = request.args.get("term", "").strip()
    level = request.args.get("level", "").strip()

    results = ALL_COURSES

    if q:
        results = [
            c for c in results
            if q in c["title"].lower()
            or q in c["course_number"].lower()
            or any(q in inst.lower() for inst in c["instructors"])
            or any(q in alias.lower() for alias in c["aliases"])
        ]

    if dept:
        results = [c for c in results if c["department"] == dept]

    if term:
        results = [c for c in results if term in c["terms"]]

    if level:
        results = [c for c in results if c["level"] == level]

    return jsonify(results)


@app.route("/api/courses/<course_id>", methods=["GET"])
def get_course(course_id):
    course = _COURSE_BY_ID.get(course_id)
    if course is None:
        return jsonify({"error": "Course not found"}), 404
    return jsonify(course)


@app.route("/api/departments", methods=["GET"])
def get_departments():
    depts = sorted({c["department"] for c in ALL_COURSES})
    return jsonify(depts)


@app.route("/api/terms", methods=["GET"])
def get_terms():
    return jsonify(_ALL_TERMS)


@app.route("/api/concentrations", methods=["GET"])
def get_concentrations():
    return jsonify([
        {
            "name": c["name"],
            "type": c["type"],
            "seas_required_code_match_total": c["seas_required_code_match_total"],
        }
        for c in ALL_CONCENTRATIONS
    ])


@app.route("/api/concentrations/<path:name>", methods=["GET"])
def get_concentration(name):
    conc = next(
        (c for c in ALL_CONCENTRATIONS if c["name"].lower() == name.lower()), None
    )
    if conc is None:
        return jsonify({"error": "Concentration not found"}), 404
    return jsonify(conc)


if __name__ == "__main__":
    app.run(debug=True, port=5001)
