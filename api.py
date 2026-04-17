import sys
import json
import random
import re
from flask import Flask, jsonify, request
from flask_cors import CORS

sys.stdout.reconfigure(encoding='utf-8')

from engine import PlotEngine, StoryUsedTracker
from fsa import PlotStateMachine
from story_cli import (
    build_full_grammar,
    extract_display_phrases,
    filter_func,
    inject_random_name,
    format_story,
    adjust_emotion_to_resolution,
    base_grammar,
    resolutions,
    epilogues,
    names,
)

app = Flask(__name__)
CORS(app)

# ── Story segmentation by FSA phase ──────────────────────────
def segment_story(story):
    """
    Split a formatted story into FSA-phase segments.
    Grammar guarantees:
      - Climax always starts with 'Then, suddenly,'
      - Resolution always starts with 'In the end,'
    Everything before Climax is split: first paragraph = SETUP, rest = RISING_ACTION.
    """
    climax_match    = re.search(r'Then,\s+suddenly,', story)
    resolution_match = re.search(r'In the end,', story)

    climax_pos     = climax_match.start()     if climax_match     else len(story)
    resolution_pos = resolution_match.start() if resolution_match else len(story)

    pre_climax = story[:climax_pos].strip()
    climax_part = story[climax_pos:resolution_pos].strip() if climax_match else ''
    resolution_part = story[resolution_pos:].strip()       if resolution_match else ''

    # Split SETUP from RISING_ACTION at first double newline
    first_break = pre_climax.find('\n\n')
    if first_break != -1:
        setup_part  = pre_climax[:first_break].strip()
        rising_part = pre_climax[first_break:].strip()
    else:
        setup_part  = pre_climax
        rising_part = ''

    def to_paras(text):
        return [p.strip() for p in text.split('\n\n') if p.strip()]

    segments = []
    if setup_part:
        segments.append({"phase": "SETUP",        "state": 0, "paragraphs": to_paras(setup_part)})
    if rising_part:
        segments.append({"phase": "RISING_ACTION", "state": 1, "paragraphs": to_paras(rising_part)})
    if climax_part:
        segments.append({"phase": "CLIMAX",        "state": 2, "paragraphs": to_paras(climax_part)})
    if resolution_part:
        segments.append({"phase": "RESOLUTION",    "state": 3, "paragraphs": to_paras(resolution_part)})

    return segments

# ── /api/phrases ──────────────────────────────────────────────
@app.get('/api/phrases')
def get_phrases():
    phrases = extract_display_phrases()
    return jsonify({
        "Character":         [{"index": i+1, "text": v} for i, v in enumerate(phrases["Character"])],
        "Location":          [{"index": i+1, "text": v} for i, v in enumerate(phrases["Location"])],
        "Conflict":          [{"index": i+1, "text": v} for i, v in enumerate(phrases["Conflict"])],
        "ResolutionOutcome": [{"index": i+1, "text": v} for i, v in enumerate(phrases["ResolutionOutcome"])],
    })

# ── /api/generate ─────────────────────────────────────────────
@app.post('/api/generate')
def generate():
    data = request.json or {}
    char_idx       = int(data.get("character",   1)) - 1
    loc_idx        = int(data.get("location",    1)) - 1
    conflict_idx   = int(data.get("conflict",    1)) - 1
    resolution_idx = int(data.get("resolution",  1)) - 1

    phrases = extract_display_phrases()
    cats = ["Character", "Location", "Conflict", "ResolutionOutcome"]
    idxs = [char_idx, loc_idx, conflict_idx, resolution_idx]
    selected = [phrases[c][max(0, min(i, len(phrases[c])-1))] for c, i in zip(cats, idxs)]

    grammar = json.loads(json.dumps(base_grammar))
    for char_exp in grammar["Character"]:
        char_exp["expansion"][0] = inject_random_name(char_exp["expansion"][0])

    with open("grammar.json", "w", encoding="utf-8") as f:
        json.dump(grammar, f, indent=2, ensure_ascii=False)

    engine = PlotEngine("grammar.json")
    fsm = PlotStateMachine()

    MAX_ATTEMPTS = 50
    story_words = None
    attempts = 0
    for attempt in range(1, MAX_ATTEMPTS + 1):
        fsm.state = 0
        tracker = StoryUsedTracker()
        words = engine.generate_story(filter_func=filter_func, initial_state=fsm, used_tracker=tracker)
        if all(p.lower() in " ".join(words).lower() for p in selected):
            story_words = words
            attempts = attempt
            break
    if story_words is None:
        story_words = words
        attempts = MAX_ATTEMPTS

    story_text = " ".join(story_words)
    if selected[3].lower() not in story_text.lower():
        rand_res = random.choice(resolutions)["expansion"]
        rand_res_text = " ".join(rand_res) if isinstance(rand_res, list) else rand_res
        story_words.append(" In the end, " + rand_res_text + ".")
        rand_epi = random.choice(epilogues)["expansion"]
        rand_epi_text = " ".join(rand_epi) if isinstance(rand_epi, list) else rand_epi
        story_words.append(" " + rand_epi_text)
        story_text = adjust_emotion_to_resolution(" ".join(story_words), rand_res_text)
        story_words = story_text.split()

    fsm.state = 3
    story = format_story(story_words)
    segments = segment_story(story)

    return jsonify({
        "story": story,
        "segments": segments,
        "selected": {
            "character":  selected[0],
            "location":   selected[1],
            "conflict":   selected[2],
            "resolution": selected[3],
        },
        "attempts": attempts,
        "phase": fsm.state,
    })

if __name__ == '__main__':
    app.run(port=5050, debug=False)
