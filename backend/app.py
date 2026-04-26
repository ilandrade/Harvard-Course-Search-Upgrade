import csv
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def read_csv(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def load_data():
    courses_raw = read_csv("cs_requirements_courses.csv")
    courses = []
    bool_cols = [
        "is_corecs", "is_advancedcs", "is_secondary", "is_programming1",
        "is_programming2", "is_formalreasoning", "is_complimitations",
        "is_algorithms", "is_intermediatealgorithms", "is_systems",
        "is_computationandtheworld", "is_ai", "is_probability",
        "is_linearalgebra", "is_discretemath",
    ]
    for row in courses_raw:
        for col in bool_cols:
            row[col] = row.get(col, "").upper() == "TRUE"
        tags = [t.strip() for t in row.get("tags", "").split(",") if t.strip()]
        row["tags_list"] = tags
        courses.append(row)

    requirements = read_csv("cs_degree_requirements.csv")
    tag_defs = {r["tag"]: r["definition"] for r in read_csv("cs_requirement_tag_definitions.csv")}
    gened = read_csv("college_general_requirements.csv")

    return courses, requirements, tag_defs, gened


COURSES, REQUIREMENTS, TAG_DEFS, GENED = load_data()

# tag -> readable label mapping
TAG_LABELS = {
    "corecs": "Core CS",
    "advancedcs": "Advanced CS",
    "secondary": "Secondary Field",
    "programming1": "Programming 1",
    "programming2": "Programming 2",
    "formalreasoning": "Formal Reasoning",
    "complimitations": "Comp & Limitations",
    "algorithms": "Algorithms",
    "intermediatealgorithms": "Intermediate Algorithms",
    "systems": "Systems",
    "computationandtheworld": "Computation & the World",
    "ai": "AI",
    "probability": "Probability",
    "linearalgebra": "Linear Algebra",
    "discretemath": "Discrete Math",
}


@app.route("/api/courses", methods=["GET"])
def get_courses():
    query = request.args.get("q", "").lower()
    tag = request.args.get("tag", "")
    results = COURSES
    if query:
        results = [
            c for c in results
            if query in c["course_number"].lower() or query in c["title"].lower()
        ]
    if tag:
        results = [c for c in results if tag in c["tags_list"]]
    return jsonify(results)


@app.route("/api/courses/<path:course_number>", methods=["GET"])
def get_course(course_number):
    for c in COURSES:
        if c["course_number"].lower() == course_number.lower():
            return jsonify(c)
    return jsonify({"error": "Not found"}), 404


@app.route("/api/requirements/cs", methods=["GET"])
def get_cs_requirements():
    plan = request.args.get("plan", "Basic")
    rows = [r for r in REQUIREMENTS if r["plan"] == plan and r["requirement_type"] != "summary"]
    # Group by requirement_group
    groups = {}
    for r in rows:
        g = r["requirement_group"]
        groups.setdefault(g, []).append(r)
    result = [{"group": g, "requirements": reqs} for g, reqs in groups.items()]
    return jsonify(result)


@app.route("/api/requirements/gened", methods=["GET"])
def get_gened_requirements():
    groups = {}
    for r in GENED:
        g = r["requirement_category"]
        groups.setdefault(g, []).append(r)
    result = [{"group": g, "requirements": reqs} for g, reqs in groups.items()]
    return jsonify(result)


@app.route("/api/requirements/plans", methods=["GET"])
def get_plans():
    plans = sorted(set(r["plan"] for r in REQUIREMENTS))
    return jsonify(plans)


@app.route("/api/tag/<tag>/courses", methods=["GET"])
def get_courses_by_tag(tag):
    results = [c for c in COURSES if tag in c["tags_list"]]
    return jsonify(results)


@app.route("/api/tags", methods=["GET"])
def get_tags():
    result = [{"tag": tag, "label": TAG_LABELS.get(tag, tag), "definition": defn}
              for tag, defn in TAG_DEFS.items()]
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5001)
