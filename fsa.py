# fsa.py

SETUP = 0
RISING_ACTION = 1
CLIMAX = 2
RESOLUTION = 3

class PlotStateMachine:
    def __init__(self):
        self.state = SETUP

    def _allowed_nonterminals(self):
        if self.state == SETUP:
            return {"Opening", "Introduction", "Character", "Location"}
        elif self.state == RISING_ACTION:
            return {"Body", "Paragraph", "Scene", "Event", "Events", "Conflict", "Dialogue", "Emotions", "Subplot", "Subplots"}
        elif self.state == CLIMAX:
            return {"Scene", "Event", "Events", "Conflict", "Dialogue", "Emotions", "Subplot", "Subplots", "Resolution", "Ending"}
        elif self.state == RESOLUTION:
            return {"Ending", "Resolution", "Epilogue"}
        return set()

    def allowed_expansions(self, nonterminal, expansions):
        # Always allow the start symbol
        if nonterminal == "Story":
            return expansions

        # If this nonterminal is allowed in the current state, keep all its expansions
        if nonterminal in self._allowed_nonterminals():
            return expansions
        else:
            # Otherwise block by returning an empty list
            return []

    def transition(self, nonterminal, chosen_expansion):
        if nonterminal == "Location":
            self.state = RISING_ACTION
        elif nonterminal == "Event":
            self.state = CLIMAX
        elif nonterminal == "Resolution":
            self.state = RESOLUTION
        return self.state