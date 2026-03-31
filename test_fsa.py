from engine import PlotEngine
from fsa import PlotStateMachine

engine = PlotEngine("grammar.json")

# The filter function
def plot_phase_filter(nonterminal, expansions, state):
    if state is None:
        # If no state given, initialise state machine
        state = PlotStateMachine()
    else:
        # state is a PlotStateMachine instance
        pass

    # 1. Filter expansions based on current state
    allowed = state.allowed_expansions(nonterminal, expansions)

    # 2. If we end up picking an expansion, we could update state based on that.
    # But we don't know which one will be chosen yet; we can't update here.
    # So we need to handle transition *after* expansion is chosen, inside the engine.
    # For simplicity, we'll let the engine call back to update state after choosing.
    # We'll extend the engine slightly for that.

    # For now, we just return filtered expansions and unchanged state.
    # We'll later modify engine to allow state update after choice.
    return allowed, state

# For demonstration, we'll run without proper transition for now.
# But we'll extend the engine first.