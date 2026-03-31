from engine import PlotEngine
from cli_utils import generate_with_constraints

engine = PlotEngine("grammar.json")

# Example constraints – check the whole story string
def contains_victory(story):
    return "Victory" in ' '.join(story)

def contains_wizard(story):
    return "wizard" in ' '.join(story)

# Generate a story that has both Victory and wizard
story = generate_with_constraints(engine, [contains_victory, contains_wizard], max_attempts=500)
print(" ".join(story))