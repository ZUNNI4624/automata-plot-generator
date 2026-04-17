import sys
import json
import re
import random
from engine import PlotEngine, StoryUsedTracker
from fsa import PlotStateMachine

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stdin, 'reconfigure'):
    sys.stdin.reconfigure(encoding='utf-8')

# ------------------------------------------------------------
# Load external JSON files
# ------------------------------------------------------------
def load_category(filename):
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

characters = load_category("characters.json")
locations = load_category("locations.json")
conflicts = load_category("conflicts.json")
resolutions = load_category("resolutions.json")
epilogues = load_category("epilogues.json")
names = load_category("names.json")

# Load event rules (with preconditions, effects, act)
with open("event_rules.json", "r", encoding="utf-8") as f:
    event_rules = json.load(f)

# Build ActionPhrase expansions with metadata
action_phrases = []
for rule in event_rules:
    action_phrases.append({
        "expansion": [rule["phrase"]],
        "weight": 1,
        "act": rule["act"],
        "precondition": rule.get("precondition", {}),
        "effect": rule.get("effect", {})
    })

# ------------------------------------------------------------
# Helper functions
# ------------------------------------------------------------
def _event_sequence_variants():
    variants = []
    weights = []
    for n in range(8, 13):
        variants.append(["Event"] * n)
        weights.append(1)
    return [{"expansion": e, "weight": w} for e, w in zip(variants, weights)]

def _development_scene_variants():
    variants = []
    weights = []
    for n in range(5, 9):
        variants.append(["Scene"] * n)
        weights.append(1)
    return [{"expansion": e, "weight": w} for e, w in zip(variants, weights)]

def build_full_grammar():
    grammar = {
        "Story": [["Opening", "Development", "Climax", "Resolution"]],
        "Opening": [["Introduction", "Character", "Location", "Backstory"]],
        "Introduction": [
            {"expansion": ["Once upon a time,"], "weight": 3},
            {"expansion": ["In a distant kingdom,"], "weight": 2},
            {"expansion": ["Long ago, in a forgotten age,"], "weight": 1},
            {"expansion": ["In the year the stars misaligned,"], "weight": 2},
            {"expansion": ["When the old roads still remembered every footstep,"], "weight": 2},
        ],
        "Character": characters,
        "Location": locations,
        "Backstory": [
            {"expansion": ["Before this,", "DescriptionSentence"], "weight": 2},
            {"expansion": ["Before this,", "DescriptionSentence", "DescriptionSentence"], "weight": 1},
        ],
        "DescriptionSentence": load_category("descriptions.json"),
        "Development": _development_scene_variants(),
        "Scene": [{"expansion": ["OptAtmosphere", "EventSequence", "OptThought", "OptSceneDialogue", "OptTransition"], "weight": 1}],
        "EventSequence": _event_sequence_variants(),
        "Event": [{"expansion": ["ActionPhrase", "OptEventDialogue", "OptEventEmotion"], "weight": 1}],
        "ActionPhrase": action_phrases,
        "Dialogue": load_category("dialogues.json"),
        "Emotion": load_category("emotions.json"),
        "Atmosphere": load_category("atmosphere.json"),
        "Thought": load_category("thoughts.json"),
        "TransitionToNextScene": load_category("transitions.json"),
        "OptAtmosphere": [{"expansion": ["Atmosphere"], "weight": 5}, {"expansion": [], "weight": 3}],
        "OptThought": [{"expansion": ["Thought"], "weight": 4}, {"expansion": [], "weight": 4}],
        "OptSceneDialogue": [{"expansion": ["Dialogue"], "weight": 4}, {"expansion": [], "weight": 4}],
        "OptTransition": [{"expansion": ["TransitionToNextScene"], "weight": 6}, {"expansion": [], "weight": 2}],
        "OptEventDialogue": [{"expansion": ["Dialogue"], "weight": 5}, {"expansion": [], "weight": 3}],
        "OptEventEmotion": [{"expansion": ["Emotion"], "weight": 5}, {"expansion": [], "weight": 3}],
        "Climax": [["Then, suddenly, ", "Conflict", ". ", "OptClimaxTwist"]],
        "OptClimaxTwist": [{"expansion": ["Twist"], "weight": 2}, {"expansion": [], "weight": 3}],
        "Twist": [["But no one expected that ", "TwistPhrase", "."]],
        "TwistPhrase": load_category("twists.json"),
        "Conflict": conflicts,
        "Resolution": [["In the end,", "ResolutionOutcome", "Epilogue"]],
        "ResolutionOutcome": resolutions,
        "Epilogue": epilogues,
    }
    return grammar

base_grammar = build_full_grammar()

# ------------------------------------------------------------
# Display and filter helpers
# ------------------------------------------------------------
def extract_display_phrases():
    return {
        "Character": [item["expansion"][0] for item in characters if "expansion" in item],
        "Location": [item["expansion"][0] for item in locations if "expansion" in item],
        "Conflict": [item["expansion"][0] for item in conflicts if "expansion" in item],
        "ResolutionOutcome": [item["expansion"][0] for item in resolutions if "expansion" in item],
    }

def inject_random_name(character_phrase):
    random_name = random.choice(names)
    match = re.search(r"named\s+(\w+)", character_phrase)
    if match:
        return re.sub(r"named\s+\w+", f"named {random_name}", character_phrase)
    return f"{character_phrase} named {random_name}"

# ------------------------------------------------------------
# Filter function with act and precondition checks
# ------------------------------------------------------------
def filter_func(nonterm, expansions, fsa_state, story_state):
    expansions = fsa_state.allowed_expansions(nonterm, expansions)
    if nonterm == "ActionPhrase":
        # Only filter by preconditions, ignore act for now
        filtered = []
        for exp in expansions:
            precond = exp.get("precondition", {})
            ok = True
            for key, val in precond.items():
                if key == "has_item" and not story_state.has_item(val):
                    ok = False
                    break
            if ok:
                filtered.append(exp)
        # If no events satisfy preconditions, allow all (fallback)
        if not filtered:
            filtered = expansions
        return filtered, fsa_state, story_state
    return expansions, fsa_state, story_state

# ------------------------------------------------------------
# Story generation with constraints (unchanged)
# ------------------------------------------------------------
def generate_story_with_phrases(engine, phrases, filter_func, initial_state, max_attempts=50):
    print("🔍 Searching for story containing all selected elements...")
    for attempt in range(1, max_attempts + 1):
        initial_state.state = 0
        tracker = StoryUsedTracker()   # direct instantiation
        story_words = engine.generate_story(
            filter_func=filter_func,
            initial_state=initial_state,
            used_tracker=tracker,
        )
        story_text = " ".join(story_words).lower()
        if all(phrase.lower() in story_text for phrase in phrases):
            print(f"✅ Found after {attempt} attempts.")
            return story_words
        if attempt % 10 == 0:
            print(f"   Attempt {attempt}... still looking.")
    print("⚠️ Could not find exact match. Returning closest story.")
    return story_words

# ------------------------------------------------------------
# Formatting and main (same as before, but adjust import)
# ------------------------------------------------------------
def adjust_emotion_to_resolution(story_text, resolution_text):
    resolution_lower = resolution_text.lower()
    if any(word in resolution_lower for word in ["victory", "peace", "hope", "triumph"]):
        target_emotion = "feeling hopeful"
    elif any(word in resolution_lower for word in ["fell", "lost", "tragedy", "doom"]):
        target_emotion = "grief-stricken"
    elif "curse" in resolution_lower or "sacrifice" in resolution_lower:
        target_emotion = "bittersweet"
    else:
        target_emotion = "resolute"

    if target_emotion not in story_text.lower():
        emotion_pattern = r"\b(feeling|overwhelmed|filled|experiencing|trembling|smiling|wondering)\b[^.]*\."
        replacement = f" {target_emotion}."
        story_text = re.sub(emotion_pattern, replacement, story_text, flags=re.IGNORECASE, count=1)
    return story_text

def format_story(words):
    text = " ".join(words)
    text = re.sub(r"\s+([.,!?;:])", r"\1", text)
    text = re.sub(r"([.,!?;:])\s+", r"\1 ", text)
    text = text.replace("â€“", "—")
    text = re.sub(r"(\.\s+)(?=[A-Z])", r"\1\n\n", text)
    if text:
        text = text[0].upper() + text[1:]
    text = re.sub(r" +", " ", text)
    return text.strip()

def main():
    grammar = json.loads(json.dumps(base_grammar))
    for char_exp in grammar["Character"]:
        original_phrase = char_exp["expansion"][0]
        char_exp["expansion"][0] = inject_random_name(original_phrase)

    with open("grammar.json", "w", encoding="utf-8") as f:
        json.dump(grammar, f, indent=2, ensure_ascii=False)

    engine = PlotEngine("grammar.json")
    fsm = PlotStateMachine()

    phrases = extract_display_phrases()
    selected = []
    categories_order = ["Character", "Location", "Conflict", "ResolutionOutcome"]

    print("\n📚 **Build your story – choose one element from each category**\n")
    for cat in categories_order:
        if cat not in phrases or not phrases[cat]:
            continue
        print(f"\n--- {cat.upper()} ---")
        for idx, item in enumerate(phrases[cat], 1):
            print(f"  {idx}. {item}")
        while True:
            choice = input(f"Choose a {cat} (enter number): ").strip()
            if choice.isdigit():
                num = int(choice)
                if 1 <= num <= len(phrases[cat]):
                    chosen = phrases[cat][num - 1]
                    selected.append(chosen)
                    print(f"   ✅ Selected: {chosen}")
                    break
                print("   Invalid number. Try again.")
            else:
                print("   Please enter a number.")

    n_stories = int(input("\nHow many stories to generate? "))
    all_stories = []

    for i in range(n_stories):
        fsm.state = 0
        words = generate_story_with_phrases(engine, selected, filter_func, fsm)
        story_text = " ".join(words)

        resolution_phrase = selected[3] if len(selected) > 3 else None
        if resolution_phrase and resolution_phrase.lower() not in story_text.lower():
            random_res = random.choice(resolutions)["expansion"]
            random_res_text = " ".join(random_res) if isinstance(random_res, list) else random_res
            words.append(" In the end, " + random_res_text + ".")
            random_epi = random.choice(epilogues)["expansion"]
            random_epi_text = " ".join(random_epi) if isinstance(random_epi, list) else random_epi
            words.append(" " + random_epi_text)
            story_text = " ".join(words)
            story_text = adjust_emotion_to_resolution(story_text, random_res_text)
            words = story_text.split()

        fsm.state = 3
        story = format_story(words)
        phase = fsm.state
        all_stories.append({"index": i + 1, "text": story, "phase": phase})

        print(f"\n{'=' * 50}")
        print(f"📖 Story {i + 1}")
        print(f"{'=' * 50}\n")
        print(story)
        print(f"\n🎭 Final Plot Phase: {phase}\n")

    save = input("Save stories to file? (y/n): ").strip().lower()
    if save == "y":
        filename = input("Filename (default: stories.txt): ").strip() or "stories.txt"
        with open(filename, "w", encoding="utf-8") as f:
            for s in all_stories:
                f.write(f"Story {s['index']}\n{'=' * 50}\n{s['text']}\n\nFinal Plot Phase: {s['phase']}\n\n\n")
        print(f"✅ Stories saved to {filename}")

if __name__ == "__main__":
    main()