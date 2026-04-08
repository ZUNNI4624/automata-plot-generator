from engine import PlotEngine
from fsa import PlotStateMachine
from cli_utils import generate_with_constraints


def filter_func(nonterm, expansions, state):
    return state.allowed_expansions(nonterm, expansions), state


def format_story(words):
    text = " ".join(words)

    # Basic cleanup
    text = text.replace(" ,", ",").replace(" .", ".")
    
    # Split into sentences (naive but works)
    sentences = text.split(". ")
    
    formatted_sentences = []
    for s in sentences:
        s = s.strip()
        if not s:
            continue
        s = s[0].upper() + s[1:]  # Capitalize
        if not s.endswith("."):
            s += "."
        formatted_sentences.append(s)

    # Paragraph split (simple heuristic)
    paragraphs = []
    current = []
    
    for sentence in formatted_sentences:
        current.append(sentence)
        
        if any(keyword in sentence.lower() for keyword in ["suddenly", "then", "finally"]):
            paragraphs.append(" ".join(current))
            current = []
    
    if current:
        paragraphs.append(" ".join(current))

    return "\n\n".join(paragraphs)


def main():
    engine = PlotEngine("grammar.json")
    fsm = PlotStateMachine()

    n = int(input("How many stories? "))

    use_constraints = input("Add constraints? (y/n): ").lower() == "y"
    constraint = None

    if use_constraints:
        constraint = input("Enter a keyword (e.g., wizard, victory): ").strip()

    for i in range(n):
        fsm.state = 0

        if constraint:
            words = generate_with_constraints(
                engine,
                constraint,
                filter_func=filter_func,
                initial_state=fsm
            )
        else:
            words = engine.generate_story(
                filter_func=filter_func,
                initial_state=fsm
            )

        story = format_story(words)

        print(f"\n{'='*40}")
        print(f"📖 Story {i+1}")
        print(f"{'='*40}\n")
        print(story)
        print(f"\n🎭 Final Plot Phase: {fsm.state}")
        print("\n")


if __name__ == "__main__":
    main()