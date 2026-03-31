from engine import PlotEngine
from fsa import PlotStateMachine, SETUP, RISING_ACTION, CLIMAX, RESOLUTION

engine = PlotEngine("grammar.json")

# Create state machine
fsm = PlotStateMachine()
fsm.state = SETUP

def plot_phase_filter(nonterminal, expansions, state):
    # state is actually the state machine instance, but we ignore for now
    # Use the global fsm
    allowed = fsm.allowed_expansions(nonterminal, expansions)
    return allowed, fsm  # return state as second element (but we ignore it)

# Generate story
story_words = engine.generate_story(filter_func=plot_phase_filter)
story = " ".join(story_words)

# Manually determine final state based on words
if "Victory" in story or "Tragedy" in story or "Twist" in story:
    final_state = "RESOLUTION"
elif "faced" in story or "solved" in story or "discovered" in story:
    final_state = "CLIMAX"
else:
    final_state = "SETUP"

print("Story:", story)
print("Final plot phase:", final_state)