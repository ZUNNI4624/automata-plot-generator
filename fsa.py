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
            return {
                "Opening",
                "Introduction",
                "Character",
                "Location",
                "Backstory",
                "DescriptionSentence",
            }
        elif self.state == RISING_ACTION:
            return {
                "Development",
                "Scene",
                "EventSequence",
                "Event",
                "ActionPhrase",
                "Atmosphere",
                "Thought",
                "TransitionToNextScene",
                "Dialogue",
                "Emotion",
                "OptAtmosphere",
                "OptThought",
                "OptSceneDialogue",
                "OptTransition",
                "OptEventDialogue",
                "OptEventEmotion",
            }
        elif self.state == CLIMAX:
            return {
                "Climax",
                "Conflict",
                "OptClimaxTwist",
                "Twist",
                "TwistPhrase",
            }
        elif self.state == RESOLUTION:
            return {
                "Resolution",
                "ResolutionOutcome",
                "Epilogue",
            }
        return set()

    def allowed_expansions(self, nonterminal, expansions):
        if nonterminal == "Story":
            return expansions

        if nonterminal == "Development" and self.state == SETUP:
            self.state = RISING_ACTION
        if nonterminal == "Climax" and self.state == RISING_ACTION:
            self.state = CLIMAX
        if nonterminal == "Resolution" and self.state == CLIMAX:
            self.state = RESOLUTION

        if nonterminal in self._allowed_nonterminals():
            return expansions
        return []

    def transition(self, nonterminal, chosen_expansion):
        return self.state
