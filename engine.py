import json
import random
import re

# ------------------------------------------------------------
# Story state for preconditions/effects
# ------------------------------------------------------------
class StoryState:
    def __init__(self):
        self.goal = None
        self.inventory = set()
        self.emotion = "neutral"
        self.act = "setup"

    def has_item(self, item):
        return item in self.inventory

    def add_item(self, item):
        self.inventory.add(item)

    def remove_item(self, item):
        self.inventory.discard(item)

    def set_goal(self, goal):
        self.goal = goal

    def set_act(self, act):
        self.act = act

# ------------------------------------------------------------
# Normalization and tracker
# ------------------------------------------------------------
def _normalize_phrase(text):
    if text is None:
        return ""
    text = re.sub(r"\s+", " ", text.strip().lower())
    text = re.sub(r"[.!?]+$", "", text)
    return text

def _first_string_token(expansion_list):
    if not expansion_list:
        return None
    for part in expansion_list:
        if isinstance(part, str):
            return part
    return None

class StoryUsedTracker:
    DEDUP_NONTERMINALS = frozenset({
        "ActionPhrase", "Dialogue", "Emotion", "Atmosphere",
        "Thought", "TransitionToNextScene", "TwistPhrase", "DescriptionSentence"
    })
    def __init__(self):
        self.used = {k: set() for k in self.DEDUP_NONTERMINALS}
    def reset(self):
        self.used = {k: set() for k in self.DEDUP_NONTERMINALS}
    def mark_used(self, nonterminal, phrase_text):
        if nonterminal not in self.DEDUP_NONTERMINALS or not phrase_text:
            return
        self.used[nonterminal].add(_normalize_phrase(phrase_text))

FALLBACK_ACTION_PHRASES = [
    "They pressed onward, reading every sign the road refused to give.",
    "They chose the harder path because easier ones had lied before.",
    "They steadied their breathing and met the moment without flinching.",
    "They traded a comfort for a clue and did not regret the bargain.",
    "They listened longer than pride wanted, and heard the truth underneath.",
    "They closed their eyes and counted to ten, then to a hundred.",
    "They looked back the way they came and saw nothing but shadow.",
    "They rested on a fallen log and ate a piece of dry bread.",
    "They wiped sweat from their brow and kept walking.",
    "They checked their pockets for anything useful and found only lint.",
    "They watched a spider weave its web and felt a strange calm.",
    "They sharpened a stick with their knife, just to keep busy.",
    "They tore a strip from their cloak to bandage a scratch.",
    "They whispered a prayer to a god they no longer believed in.",
    "They counted the stars and named them after old friends.",
    "They drank the last of their water and felt the empty flask.",
    "They kicked a stone down the road and watched it roll away.",
    "They remembered a joke from childhood and smiled for no reason.",
    "They flexed their sore muscles and knew they could go further.",
    "They built a small fire and stared into the flames.",
    "They listened to the silence and found it loud.",
    "They touched a scar and felt the echo of the wound.",
    "They traced the horizon with their finger, drawing a line.",
    "They thought of home and wondered if anyone waited.",
    "They counted their regrets like coins, then put them away.",
    "They told themselves a lie until it felt like truth.",
    "They waited for a sign, but none came.",
    "They took a deep breath and held it for ten seconds.",
    "They hummed a tune they couldn't remember learning.",
    "They sat down and refused to move until their courage returned.",
    "They wrote a letter in the dirt, then erased it with their boot.",
    "They measured the length of their shadow and felt time pass.",
    "They picked up a rock and put it in their pocket as a charm.",
    "They untied their boots and retied them tighter.",
    "They watched the clouds and imagined shapes of things lost.",
    "They scratched their name into a tree trunk.",
    "They closed their eyes and listened to their own heartbeat.",
    "They thought about the last good meal they had and sighed.",
    "They stood up slowly, stretching each aching joint.",
    "They spat on the ground and made a quiet vow.",
    "They looked at their reflection in a puddle and almost laughed.",
    "They remembered a dream from last night and tried to hold it.",
    "They counted the days since they had last slept in a bed.",
    "They tasted the air and guessed the weather ahead.",
    "They tied a knot in a piece of string to remember something important.",
    "They felt the weight of their sword and found it lighter than fear.",
    "They whispered a name they had not spoken in years.",
    "They looked at the sky and saw a single bird flying alone.",
    "They picked a wildflower and tucked it into their belt.",
    "They thought of nothing for a moment, and that was peace.",
    "They smiled at a stranger who passed by, unseen.",
    "They thanked the road for carrying them this far.",
]

# ------------------------------------------------------------
# PlotEngine
# ------------------------------------------------------------
class PlotEngine:
    def __init__(self, grammar_file="grammar.json"):
        with open(grammar_file, "r", encoding="utf-8") as f:
            self.grammar = json.load(f)
        self.start_symbol = "Story"

    def _is_weighted(self, expansions):
        return bool(expansions) and isinstance(expansions[0], dict) and "weight" in expansions[0]

    def _filter_weighted_unused(self, symbol, expansions, used_tracker):
        if used_tracker is None or symbol not in StoryUsedTracker.DEDUP_NONTERMINALS:
            return list(expansions)
        used = used_tracker.used[symbol]
        fresh = []
        for entry in expansions:
            exp = entry.get("expansion", [])
            text = _first_string_token(exp)
            if text is None:
                fresh.append(entry)
                continue
            if _normalize_phrase(text) not in used:
                fresh.append(entry)
        return fresh

    def _pick_weighted(self, symbol, expansions, used_tracker):
        if not self._is_weighted(expansions):
            # expansions is list of strings or dicts? We'll treat uniformly
            return random.choice(expansions)
        pool = self._filter_weighted_unused(symbol, expansions, used_tracker)
        if not pool and symbol == "ActionPhrase":
            fb = [{"expansion": [s], "weight": 1} for s in FALLBACK_ACTION_PHRASES]
            pool = self._filter_weighted_unused(symbol, fb, used_tracker)
            if not pool:
                return {"expansion": [random.choice(FALLBACK_ACTION_PHRASES)]}
        if not pool:
            pool = list(expansions)
        # pick one entry (dict)
        weights = [e["weight"] for e in pool]
        return random.choices(pool, weights=weights)[0]

    def generate_story(self, filter_func=None, initial_state=None, used_tracker=None):
        stack = [self.start_symbol]
        result = []
        fsa_state = initial_state
        story_state = StoryState()
        max_depth = 5000
        depth = 0

        while stack and depth < max_depth:
            depth += 1
            symbol = stack.pop()

            if symbol not in self.grammar:
                result.append(symbol)
                continue

            expansions = self.grammar[symbol]
            if not expansions:
                continue

            # Apply filter (may modify expansions and state)
            if filter_func:
                expansions, fsa_state, story_state = filter_func(symbol, expansions, fsa_state, story_state)
                if not expansions:
                    continue

            # Choose expansion (weighted or uniform)
            if self._is_weighted(expansions):
                chosen = self._pick_weighted(symbol, expansions, used_tracker)
            else:
                # expansions is list of lists or dicts? For simplicity, we assume list of lists.
                chosen = random.choice(expansions)

            # For ActionPhrase, chosen may be a dict with 'expansion' and metadata
            if isinstance(chosen, dict):
                expansion_list = chosen.get("expansion", [])
                # Apply effects if present
                if symbol == "ActionPhrase" and "effect" in chosen:
                    for key, val in chosen["effect"].items():
                        if key == "add_item":
                            story_state.add_item(val)
                        elif key == "remove_item":
                            story_state.remove_item(val)
                        elif key == "set_goal":
                            story_state.set_goal(val)
            else:
                expansion_list = chosen

            # Update FSA transition if needed
            if filter_func and fsa_state is not None and hasattr(fsa_state, "transition"):
                fsa_state.transition(symbol, expansion_list)

            # Update used tracker
            if used_tracker is not None and symbol in StoryUsedTracker.DEDUP_NONTERMINALS:
                text = _first_string_token(expansion_list)
                if text:
                    used_tracker.mark_used(symbol, text)

            # Push onto stack in reverse order
            for s in reversed(expansion_list):
                stack.append(s)

        if depth >= max_depth:
            print("Warning: max depth reached, story may be truncated.")
        return result
