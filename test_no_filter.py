# test_no_filter.py
from engine import PlotEngine
engine = PlotEngine("grammar.json")
story = engine.generate_story()
print(" ".join(story))