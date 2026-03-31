from engine import PlotEngine

def generate_with_constraints(engine, constraints, filter_func=None, max_attempts=100):
    """
    Generate a story that satisfies all given constraints.
    constraints: list of functions that take a story (list of words) and return True/False.
    """
    for _ in range(max_attempts):
        story = engine.generate_story(filter_func=filter_func)
        if all(constraint(story) for constraint in constraints):
            return story
    raise RuntimeError("Could not generate story satisfying constraints after {} attempts".format(max_attempts))