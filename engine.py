import json
import random

class PlotEngine:
    def __init__(self, grammar_file="grammar.json"):
        with open(grammar_file, 'r') as f:
            self.grammar = json.load(f)
        self.start_symbol = "Story"

    def generate_story(self, filter_func=None, initial_state=None):
        stack = [self.start_symbol]
        result = []
        state = initial_state
        max_depth = 100
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

            # Apply filter if provided
            if filter_func:
                expansions, state = filter_func(symbol, expansions, state)
                if not expansions:
                    continue

            # Choose expansion
            if isinstance(expansions[0], dict) and "weight" in expansions[0]:
                choices = [e["expansion"] for e in expansions]
                weights = [e["weight"] for e in expansions]
                chosen = random.choices(choices, weights=weights)[0]
            else:
                chosen = random.choice(expansions)

            # === NEW: Update state after choosing expansion ===
            if filter_func and state is not None:
                if hasattr(state, 'transition'):
                    state.transition(symbol, chosen)

            # Push chosen expansion onto stack (reverse order)
            for s in reversed(chosen):
                stack.append(s)

        if depth >= max_depth:
            print("Warning: max depth reached, story may be truncated.")
        return result