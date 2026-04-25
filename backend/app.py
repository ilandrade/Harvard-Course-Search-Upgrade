import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


@app.route("/api/concentrations", methods=["GET"])
def get_concentrations():
    return jsonify([])


@app.route("/api/courses", methods=["GET"])
def get_courses():
    return jsonify([])


@app.route("/api/requirements/<path:name>", methods=["GET"])
def get_requirements(name):
    return jsonify({"error": "No data loaded yet"}), 404


if __name__ == "__main__":
    app.run(debug=True, port=5001)
