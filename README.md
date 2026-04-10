# Automata-Based Plot Generator

A story generator using **formal grammars**, **pushdown automaton (PDA)** and **finite state automaton (FSA)** to produce long, varied stories with mathematical transparency and user‑selected constraints.

## Features

- **Pushdown Automaton** – expands a context‑free grammar with weighted productions, recursion, and depth limit.
- **Finite State Automaton** – enforces plot phases (Setup → Rising Action → Climax → Resolution) by filtering allowed non‑terminals per phase.
- **Rich grammar** – hundreds of unique events, characters, locations, conflicts, resolutions, dialogues, emotions, thoughts, atmospheres, transitions, and twists.
- **User‑friendly CLI** – step‑by‑step selection of character, location, conflict, and resolution; stories saved to file.
- **No repetition** – uses a `StoryUsedTracker` to prevent duplicate action phrases, dialogue, emotions, etc., within a story.
- **Long stories** – generates 2–3 pages of prose (50–100+ sentences) with multiple scenes and events.
- **Uniformity test** – empirical proof of equal probability for a flat grammar.

## Project Structure
.
├── engine.py # PDA with state tracking and repetition prevention
├── fsa.py # FSA plot phase automaton
├── story_cli.py # Main CLI interface
├── grammar.json # Generated grammar (built dynamically)
├── event_rules.json # Events with preconditions/effects (optional)
├── characters.json # Character descriptions
├── locations.json # Location descriptions
├── conflicts.json # Conflict phrases
├── resolutions.json # Resolution outcomes
├── epilogues.json # Epilogue lines
├── names.json # Character names
├── dialogues.json # Dialogue snippets
├── emotions.json # Emotional phrases
├── atmosphere.json # Atmospheric descriptions
├── thoughts.json # Internal thoughts
├── transitions.json # Scene transition phrases
├── twists.json # Twist phrases
├── descriptions.json # Backstory sentences
├── actions.json # Generic action phrases (fallback)
├── test_uniformity.py # Uniformity test (flat grammar)
├── visualise_fsa.py # FSA diagram generator
└── README.md # This file


## Requirements

- Python 3.7+ (no external libraries required; uses only `json`, `random`, `re`).

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ZUNNI4624/automata-plot-generator.git
   cd automata-plot-generator
2. (Optional) Create a virtual environment:
bash
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows

3. No additional packages needed.

## Usage
Run the CLI:
    bash
    python story_cli.py
    Follow the prompts:

1. Choose a character (from a numbered list).
2. Choose a location.
3. Choose a conflict.
4. Choose a resolution.
5. Enter how many stories to generate.
6. Optionally save the stories to a text file.

## How It Works
1. Grammar – The story is defined by a context‑free grammar:

Story → Opening Development Climax Resolution
Opening → Introduction Character Location Backstory
Development → Scene Scene ... (5–8 scenes)
Scene → Atmosphere? EventSequence Thought? Dialogue? Transition?
EventSequence → 8–12 events (each with action, optional dialogue, optional emotion)
Climax → "Then, suddenly, " Conflict ". " OptionalTwist
Resolution → "In the end, " ResolutionOutcome Epilogue

2. Pushdown Automaton – Expands the grammar using a stack, supporting recursion (e.g., subplots) and weighted choices. A StoryUsedTracker prevents repetition of the same phrase within a story.

3. Finite State Automaton – The PlotStateMachine tracks the plot phase (0–3) and filters which non‑terminals are allowed in each phase. This ensures logical story progression.

4. State Tracking – The engine also maintains a StoryState (inventory, goal, emotion) to support event preconditions/effects (optional, used in event_rules.json).

5. User Selection – The CLI extracts displayable phrases from the JSON files and presents numbered menus. It then calls the engine with the chosen constraints (substring matching) and the FSA filter.

6. Output Formatting – Raw word lists are converted into paragraphs with proper punctuation, capitalization, and line breaks.

