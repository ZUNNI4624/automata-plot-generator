from engine import PlotEngine

# Dummy filter that allows only "Quest" in Conflict and only "Victory" in Resolution
def dummy_filter(nonterminal, expansions, state):
    if nonterminal == "Conflict":
        # Keep only expansions that contain "Quest"
        filtered = [e for e in expansions if "Quest" in (e["expansion"] if isinstance(e, dict) else e)]
    elif nonterminal == "Resolution":
        # Keep only expansions that contain "Victory"
        filtered = [e for e in expansions if "Victory" in (e["expansion"] if isinstance(e, dict) else e)]
    else:
        filtered = expansions
    # Return filtered expansions and unchanged state
    return filtered, state

engine = PlotEngine("grammar.json")
story = engine.generate_story(filter_func=dummy_filter)
print(" ".join(story))