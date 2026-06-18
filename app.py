from flask import Flask, jsonify, render_template, abort
import json
import os

app = Flask(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), "static", "data", "cards.json")


def load_cards():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Páginas ───────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/card/<int:card_id>")
def card_detail(card_id):
    cards = load_cards()
    card  = next((c for c in cards if c["id"] == card_id), None)
    if card is None:
        abort(404)
    if card["status"] == "locked":
        abort(403)
    color_map = {
        "cybersec":  "blue",
        "concursos": "purple",
        "projetos":  "green",
        "especial":  "pink",
    }
    color = color_map.get(card["category"], "blue")
    return render_template("card_detail.html", card=card, color=color)


@app.route("/especial")
def especial():
    return render_template("especial.html")


# ── API ───────────────────────────────────────────────────

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


# ── Erros ─────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404


@app.errorhandler(403)
def forbidden(e):
    return render_template("403.html"), 403


if __name__ == "__main__":
    app.run(debug=True, port=5000)