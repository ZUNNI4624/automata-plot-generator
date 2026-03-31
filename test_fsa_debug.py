from engine import PlotEngine
from fsa import PlotStateMachine

engine = PlotEngine("grammar.json")

fsm = PlotStateMachine()

def plot_phase_filter(nonterminal, expansions, state):
    print(f"Filtering {nonterminal}, current state: {state.state if state else None}")
    filtered = state.allowed_expansions(nonterminal, expansions)
    print(f"Filtered: {filtered}")
    return filtered, state

story_words = engine.generate_story(filter_func=plot_phase_filter, initial_state=fsm)
story = " ".join(story_words)
print("Story:", story)
print("Final plot phase:", fsm.state)