from engine import PlotEngine

def generate_story_with_keyword(engine, keyword, filter_func, initial_state, max_attempts=200):
    print(f"Searching for stories containing '{keyword}'...")
    for attempt in range(1, max_attempts+1):
        initial_state.state = 0
        story_words = engine.generate_story(filter_func=filter_func, initial_state=initial_state)
        story_text = " ".join(story_words)
        if keyword.lower() in story_text.lower():
            print(f"Found after {attempt} attempts.")
            return story_words
        if attempt % 20 == 0:
            print(f"Attempt {attempt}... still looking for '{keyword}'")
    raise RuntimeError(f"Could not generate story with keyword '{keyword}' after {max_attempts} attempts")