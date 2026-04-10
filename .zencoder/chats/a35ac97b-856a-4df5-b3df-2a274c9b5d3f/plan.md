# Spec and build

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:

- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification

Assess the task's difficulty, as underestimating it leads to poor outcomes.

- easy: Straightforward implementation, trivial bug fix or feature
- medium: Moderate complexity, some edge cases or caveats to consider
- hard: Complex logic, many caveats, architectural considerations, or high-risk changes

Create a technical specification for the task that is appropriate for the complexity level:

- Review the existing codebase architecture and identify reusable components.
- Define the implementation approach based on established patterns in the project.
- Identify all source code files that will be created or modified.
- Define any necessary data model, API, or interface changes.
- Describe verification steps using the project's test and lint commands.

Save the output to `c:\Users\gs277\Downloads\automata-plot-generator\.zencoder\chats\a35ac97b-856a-4df5-b3df-2a274c9b5d3f/spec.md` with:

- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `c:\Users\gs277\Downloads\automata-plot-generator\.zencoder\chats\a35ac97b-856a-4df5-b3df-2a274c9b5d3f/spec.md`:

- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Save to `c:\Users\gs277\Downloads\automata-plot-generator\.zencoder\chats\a35ac97b-856a-4df5-b3df-2a274c9b5d3f/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

**Stop here.** Present the specification (and plan, if created) to the user and wait for their confirmation before proceeding.

---

### [ ] Step: JSON Expansion
Expand characters (50+), locations (30+), conflicts (30+), resolutions (30+), and epilogues (20+).
- Update characters.json
- Update locations.json
- Update conflicts.json
- Update resolutions.json
- Update epilogues.json

### [ ] Step: Grammar Structural Updates (story_cli.py)
Update the grammar definition in `build_full_grammar`.
- Add Backstory and MoodSetting to Opening.
- Update Development to expand into 2-4 Scenes.
- Define Scene structure (Atmosphere, EventSequence, Thought, Dialogue).
- Add new non-terminals: SceneBreak, Atmosphere, Thought, Twist.
- Expand Event, Transition, Dialogue, and Emotion pools.

### [ ] Step: FSA Update (fsa.py)
Update the finite state machine to support the new non-terminals.
- Add new non-terminals to `_allowed_nonterminals`.
- Map transitions if necessary.

### [ ] Step: CLI & logic refinement (story_cli.py)
- Refine `extract_display_phrases` if needed.
- Update `format_story` for multi-paragraph support (SceneBreak handling).
- Ensure random name injection works with expanded lists.

### [ ] Step: Verification and Report
- Generate multiple stories and verify 10+ sentence length.
- Check formatting and emotional arc consistency.
- Write report.md.
