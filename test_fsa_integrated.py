from engine import PlotEngine
from fsa import PlotStateMachine

engine = PlotEngine("grammar.json")

# Create state machine
fsm = PlotStateMachine()

# This filter will be called before expansion.
def plot_phase_filter(nonterminal, expansions, state):
    # state is the current state machine (we pass it as state)
    # Filter expansions
    filtered = state.allowed_expansions(nonterminal, expansions)
    # Return filtered expansions and the state machine itself
    return filtered, state

# Generate a story, passing the filter and initial state
story_words = engine.generate_story(filter_func=plot_phase_filter, initial_state=fsm)
story = " ".join(story_words)

print("Story:", story)
print("Final plot phase:", fsm.state)