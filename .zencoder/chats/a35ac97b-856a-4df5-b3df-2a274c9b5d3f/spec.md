# Technical Specification - Story Grammar Extension

## Task Difficulty: Medium
The task involves significant data expansion across multiple JSON files and structural changes to the story grammar and finite state machine (FSA). While the logic is established, ensuring consistency and variety across a larger dataset requires care.

## Existing Architecture Review
- **PlotEngine (`engine.py`)**: Core recursive expansion engine. Supports weights and custom filtering/state transitions.
- **PlotStateMachine (`fsa.py`)**: Manages story phases (`SETUP`, `RISING_ACTION`, `CLIMAX`, `RESOLUTION`). Controls allowed non-terminals per state.
- **Story CLI (`story_cli.py`)**: Orchestrates data loading, grammar building, user interaction, and post-processing (formatting, emotional arc).

## Implementation Approach

### 1. Data Expansion (JSON)
Expand the following files to meet the requirements:
- `characters.json`: 50+ entries.
- `locations.json`: 30+ entries.
- `conflicts.json`: 30+ entries.
- `resolutions.json`: 30+ entries.
- `epilogues.json`: 20+ entries.
- `names.json`: Ensure it supports the expanded character list.

### 2. Grammar Structural Changes (`story_cli.py`)
- **Opening**: Extend with `Backstory` and `MoodSetting`.
- **Development**: Update to expand into 2-4 `Scenes`.
- **Scene**: Define as `[Atmosphere (optional), EventSequence, Thought (optional), Dialogue (optional)]`.
- **EventSequence**: Update to 3-6 `Events`.
- **New Non-terminals**: `SceneBreak`, `Atmosphere`, `Thought`, `Twist`.
- **Content Expansion**:
  - `Event`: 30+ new strings.
  - `Transition`: 10+ new strings.
  - `Dialogue`: 15+ new snippets.
  - `Emotion`: 15+ new phrases.
- **Twist**: Add as an optional element before `Resolution`.

### 3. Finite State Machine Update (`fsa.py`)
- Update `_allowed_nonterminals` to include:
  - `SETUP`: `Backstory`, `MoodSetting`.
  - `RISING_ACTION`: `Scene`, `SceneBreak`, `Atmosphere`, `Thought`, `Twist`.
- Update `transition` logic to handle new non-terminals if they signal state changes.

### 4. Logic & CLI Updates (`story_cli.py`)
- Ensure `extract_display_phrases` still works with expanded JSON.
- Update `generate_story_with_phrases` if the increased length causes too many timeouts (may need to adjust `max_attempts`).
- Update `format_story` to handle `SceneBreak` (e.g., "---" or extra newlines).

## Source Code Structure Changes
No new files, all changes to existing:
- `characters.json`
- `locations.json`
- `conflicts.json`
- `resolutions.json`
- `epilogues.json`
- `fsa.py`
- `story_cli.py`

## Verification Approach
- **Linting**: Run project-standard linters (if available).
- **Functionality**:
  - Run `story_cli.py` and generate 10+ stories.
  - Verify story length (10+ sentences).
  - Verify presence of new elements (Atmosphere, Thought, Twist, etc.).
  - Verify emotional arc consistency.
  - Check `stories.txt` output for proper formatting.
