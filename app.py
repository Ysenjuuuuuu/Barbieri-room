from flask import Flask, jsonify, render_template
import json
import os

app = Flask(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), "static", "data", "cards.json")


def load_cards():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/cards")
def get_cards():
    return jsonify(load_cards())


@app.route("/api/cards/<category>")
def get_cards_by_category(category):
    cards = load_cards()
    if category.lower() == "todos":
        return jsonify(cards)
    filtered = [c for c in cards if c["category"].lower() == category.lower()]
    return jsonify(filtered)


if __name__ == "__main__":
    app.run(debug=True, port=5000)