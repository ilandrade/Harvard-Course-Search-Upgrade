import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "courses.json")

with open(DATA_PATH, "r") as f:
    ALL_COURSES = json.load(f)


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
            or q in c["description"].lower()
            or q in c["course_number"].lower()
            or any(q in tag for tag in c["tags"])
            or any(q in inst.lower() for inst in c["instructors"])
        ]

    if dept:
        results = [c for c in results if c["department"] == dept]

    if term:
        results = [c for c in results if c["term"] == term]

    if level:
        results = [c for c in results if c["level"] == level]

    return jsonify(results)


@app.route("/api/courses/<course_id>", methods=["GET"])
def get_course(course_id):
    course = next((c for c in ALL_COURSES if c["id"] == course_id), None)
    if course is None:
        return jsonify({"error": "Course not found"}), 404
    return jsonify(course)


@app.route("/api/departments", methods=["GET"])
def get_departments():
    depts = sorted(set(c["department"] for c in ALL_COURSES))
    return jsonify(depts)


@app.route("/api/terms", methods=["GET"])
def get_terms():
    terms = sorted(set(c["term"] for c in ALL_COURSES))
    return jsonify(terms)


if __name__ == "__main__":
    app.run(debug=True, port=5001)
