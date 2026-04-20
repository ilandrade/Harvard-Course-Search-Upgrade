import csv
import json
import os
import re
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

with open(os.path.join(DATA_DIR, "courses.json")) as f:
    _RAW_COURSES = json.load(f)

def _parse_req_codes(text):
    """Extract course codes like COMPSCI 50, ENG-SCI 51, MATH 21A from free text."""
    return list(dict.fromkeys(re.findall(r'[A-Z][A-Z\-]+\s+\d+[A-Z]?', text)))


# Harvard catalog prefix → SEAS catalog prefix
_PREFIX_MAP = {
    "compsci": "cs",
    "apmth": "am",
    "engsci": "es",   # ENG-SCI after hyphen removal
    "bme": "be",
    "biophys": "be",
}


def _norm_num(s):
    """Normalize a course number for matching across catalog systems."""
    s = s.lower().replace(" ", "").replace("-", "")
    for old, new in _PREFIX_MAP.items():
        if s.startswith(old):
            return new + s[len(old):]
    return s


_ALL_REQ_ROWS = []
_TRACKS_BY_CONC = {}   # name -> list of track dicts (no Joint tracks)
_REQUIREMENTS_BY_CONC = {}  # name -> first Basic/Standard/A.B. entry (fallback)

_csv_path = os.path.join(DATA_DIR, "harvard_concentration_requirements.csv")
if os.path.exists(_csv_path):
    with open(_csv_path, newline="") as _f:
        for _row in csv.DictReader(_f):
            _name = _row["concentration"]
            _track = _row["track"]
            _ALL_REQ_ROWS.append(_row)
            if "Joint" not in _track:
                _TRACKS_BY_CONC.setdefault(_name, []).append({
                    "track": _track,
                    "total_courses": _row["total_courses"],
                    "thesis": _row["thesis"],
                })
            if any(kw in _track for kw in ("Basic", "Standard", "A.B.")):
                if _name not in _REQUIREMENTS_BY_CONC:
                    _REQUIREMENTS_BY_CONC[_name] = {
                        "total_courses": _row["total_courses"],
                        "required_courses_text": _row["required_courses"],
                        "tutorials": _row["tutorials"],
                        "thesis": _row["thesis"],
                        "required_codes": _parse_req_codes(_row["required_courses"]),
                    }


with open(os.path.join(DATA_DIR, "harvard_concentrations_matched_seas_only.json")) as f:
    _RAW_CONCENTRATIONS = json.load(f)

_seen_conc_names = set()
ALL_CONCENTRATIONS = []
for _c in sorted(_RAW_CONCENTRATIONS, key=lambda c: c["name"]):
    if _c["name"] not in _seen_conc_names:
        _seen_conc_names.add(_c["name"])
        ALL_CONCENTRATIONS.append({"name": _c["name"], "type": _c["type"]})


def _slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def _build_course(raw):
    term = raw.get("term", "")
    return {
        **raw,
        "id": raw.get("id") or _slugify(raw["course_number"]),
        "terms": [term] if term else [],
    }


ALL_COURSES = [_build_course(c) for c in _RAW_COURSES]
_COURSE_BY_ID = {c["id"]: c for c in ALL_COURSES}
_COURSE_BY_NORM = {_norm_num(c["course_number"]): c for c in ALL_COURSES}

_ALL_TERMS = sorted({t for c in ALL_COURSES for t in c["terms"]})


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
    return jsonify(ALL_CONCENTRATIONS)


@app.route("/api/tracks/<path:name>", methods=["GET"])
def get_tracks(name):
    tracks = _TRACKS_BY_CONC.get(name) or next(
        (v for k, v in _TRACKS_BY_CONC.items() if k.lower() == name.lower()), None
    )
    if tracks is None:
        return jsonify({"error": "No tracks found"}), 404
    return jsonify(tracks)


@app.route("/api/requirements/<path:name>", methods=["GET"])
def get_requirements(name):
    track_filter = request.args.get("track", "").strip()

    req = None
    if track_filter:
        row = next(
            (r for r in _ALL_REQ_ROWS
             if r["concentration"].lower() == name.lower() and r["track"] == track_filter),
            None,
        )
        if row:
            req = {
                "total_courses": row["total_courses"],
                "required_courses_text": row["required_courses"],
                "tutorials": row["tutorials"],
                "thesis": row["thesis"],
                "required_codes": _parse_req_codes(row["required_courses"]),
            }

    if req is None:
        req = next(
            (v for k, v in _REQUIREMENTS_BY_CONC.items() if k.lower() == name.lower()), None
        )
    if req is None:
        return jsonify({"error": "Requirements not found"}), 404

    matched = []
    for code in req["required_codes"]:
        norm = _norm_num(code)
        course = _COURSE_BY_NORM.get(norm)
        matched.append({"code": code, "course": course})

    return jsonify({
        "total_courses": req["total_courses"],
        "required_courses_text": req["required_courses_text"],
        "tutorials": req["tutorials"],
        "thesis": req["thesis"],
        "required_codes": req["required_codes"],
        "matched": matched,
    })



if __name__ == "__main__":
    app.run(debug=True, port=5001)
