# Automata-Based Plot Generator

A story generator using formal grammars, pushdown automaton (PDA), and finite state automaton (FSA) to produce plots with mathematically uniform distribution (for flat grammars) and weighted probabilities for richer narratives.

## Project Overview

This system generates stories by expanding a **context-free grammar** with a **pushdown automaton**. A **finite state automaton** enforces plot phases (Setup → Rising Action → Climax → Resolution) by filtering which non‑terminals can be expanded at each stage. The grammar is defined in `grammar.json` and supports weighted expansions (some elements are more likely than others).

The project was developed by two people:
- **Person A** – Engine (PDA, FSA, grammar) and core logic.
- **Person B** – User interface, formatting, and final presentation.

This repository contains the complete engine. Person B will now add the CLI and output formatting.

## File Structure
.
├── engine.py # PDA – expands grammar, supports weights & filter
├── fsa.py # FSA – plot phases & rule filtering
├── grammar.json # Rich context‑free grammar (characters, events, etc.)
├── test_engine.py # Simple test – prints a story from grammar
├── test_fsa_integrated.py # Test with FSA filter – prints story & final phase
├── cli_utils.py # Helper for generating stories with constraints
├── visualise_fsa.py # Optional – draws FSA diagram (requires Graphviz)
├── flat_grammar.json # Flat grammar used for uniformity test
├── test_uniformity.py # Empirical uniformity test (27 possible plots)
└── README.md # This file

## How to Run

1. Ensure you have Python 3.7+.
2. Clone the repository:
   ```bash
   git clone https://github.com/ZUNNI4624/automata-plot-generator.git
   cd automata-plot-generator
Run a test story:

bash
python test_engine.py
This will print a raw story (list of words joined by spaces).

Run with FSA filter:

bash
python test_fsa_integrated.py
This will also print the final plot phase (0–3). The story should follow a logical arc.

## What Person B Needs to Do
1. Build a Command‑Line Interface (CLI)
Create a script (e.g., story_cli.py) that:

Asks the user how many stories to generate.

Optionally accepts constraints (e.g., must contain “Victory”, must include a wizard).

Calls the engine with the FSA filter (or without, for raw generation).

Prints the stories in a readable format.

Example starter:

python
from engine import PlotEngine
from fsa import PlotStateMachine

engine = PlotEngine("grammar.json")
fsm = PlotStateMachine()

def filter_func(nonterm, expansions, state):
    return state.allowed_expansions(nonterm, expansions), state

def main():
    n = int(input("How many stories? "))
    for i in range(n):
        fsm.state = 0   # reset
        story_words = engine.generate_story(filter_func=filter_func, initial_state=fsm)
        story = " ".join(story_words)
        print(f"\n--- Story {i+1} ---\n{story}\n")
        print(f"Plot phase: {fsm.state}")

if __name__ == "__main__":
    main()


2. Format Output into Proper Stories
The raw story is a list of strings (some long phrases, some short). Your job is to convert it into a nicely formatted text:

Capitalise the first letter of each sentence.

Add periods at the end of sentences.

Insert line breaks for paragraphs (e.g., after the introduction, after a dialogue snippet, after an event block).

You may use the cli_utils.py helper or write your own formatting function.

Example formatting idea:

python
def format_story(words):
    # Join with spaces
    text = " ".join(words)
    # Simple split on ". " to detect sentences (but your grammar may not include periods)
    # You'll need to add periods where missing and capitalise.
    # You can also split into paragraphs by looking for key phrases like "Once upon a time,".
    return formatted_text


3. Add User Constraints (Optional)
Use cli_utils.generate_with_constraints (already present) to allow users to specify requirements:

Must contain a certain word (e.g., "wizard")

Must have a happy ending (e.g., "Victory")

Must be a certain genre (load different grammar files)


4. Visualisation (Optional)
The visualise_fsa.py script uses Graphviz to draw the automaton diagram. To use it, install Graphviz and the Python graphviz package. If you don't want to install, you can still include the diagram manually in your presentation.


5. Prepare the Final Presentation
Explain the theory: CFG, PDA, FSA, uniform probability.

Show architecture (engine, grammar, FSA).

Demonstrate with sample stories.

Highlight the uniformity test results.

Show the automaton diagram.

Notes
The grammar is already rich and can be extended by adding more entries to the arrays in grammar.json.

The FSA state transitions are defined in fsa.py (allowed non‑terminals per phase and transitions).

The engine uses a depth limit (100) to prevent infinite recursion – you can adjust it if needed.

All code is in Python 3.11+ and uses only standard libraries (json, random).