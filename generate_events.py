import json
import random

# Base templates for events (will be expanded combinatorially)
templates = [
    "they found a {object} hidden in a {place}.",
    "they followed a {creature} through the {terrain}.",
    "they deciphered a {cipher} carved into a {surface}.",
    "they traded a {item1} for a {item2} with a {stranger}.",
    "they climbed a {structure} overlooking the {landscape}.",
    "they swam across a {body_of_water} under the {light}.",
    "they lit a {light_source} that burned with {color} flame.",
    "they heard a {sound} echoing from the {location}.",
    "they opened a {container} and found a {surprise}.",
    "they confronted a {enemy} in a {setting}.",
    "they escaped from a {trap} using their {skill}.",
    "they helped a {person} who was in {trouble}.",
    "they discovered a secret {passage} behind a {feature}.",
    "they repaired a {broken_object} with {material}.",
    "they recited a {poem} that made the {audience} weep.",
]

# Word lists
objects = ["map", "key", "scroll", "amulet", "dagger", "crystal", "feather", "coin", "ring", "gem"]
places = ["attic", "cellar", "tomb", "shrine", "hollow tree", "well", "cave", "ruin", "library", "tower"]
creatures = ["fox", "raven", "wolf", "deer", "snake", "sparrow", "owl", "cat", "rat", "butterfly"]
terrain = ["forest", "desert", "mountain", "swamp", "meadow", "valley", "coast", "plateau", "jungle", "tundra"]
ciphers = ["code", "riddle", "puzzle", "glyph", "runes", "cipher", "language", "symbol", "sigil", "script"]
surfaces = ["stone", "wood", "metal", "clay", "parchment", "wall", "floor", "ceiling", "door", "table"]
item1 = ["bread", "water", "coin", "secret", "promise", "song", "memory", "dagger", "cloak", "boot"]
item2 = ["safe passage", "information", "shelter", "food", "weapon", "ally", "horse", "boat", "lamp", "rope"]
stranger = ["merchant", "pilgrim", "guard", "hermit", "thief", "child", "elder", "soldier", "scholar", "priest"]
structures = ["staircase", "ladder", "rope", "cliff", "tower", "scaffold", "ridge", "rampart", "pyramid", "statue"]
landscape = ["valley", "city", "sea", "plain", "mountain", "forest", "desert", "lake", "river", "cliff"]
body_of_water = ["river", "lake", "sea", "pond", "canal", "moat", "waterfall", "swamp", "bay", "ocean"]
light = ["moonlight", "starlight", "torchlight", "sunset", "dawn", "twilight", "candlelight", "lantern", "firelight", "glow"]
light_source = ["candle", "lantern", "torch", "bonfire", "lamp", "match", "firefly", "crystal", "star", "sun"]
color = ["blue", "green", "red", "gold", "silver", "black", "white", "purple", "orange", "violet"]
sounds = ["whisper", "cry", "song", "drum", "bell", "shout", "laugh", "sigh", "howl", "crack"]
locations = ["forest", "cave", "ruin", "tower", "bridge", "market", "temple", "graveyard", "castle", "village"]
containers = ["chest", "box", "urn", "barrel", "sack", "drawer", "cupboard", "vase", "basket", "pouch"]
surprise = ["treasure", "trap", "message", "key", "weapon", "food", "clue", "letter", "skull", "flower"]
enemies = ["dragon", "bandit", "skeleton", "ghost", "golem", "warlock", "beast", "giant", "assassin", "guard"]
settings = ["hall", "chamber", "arena", "courtyard", "throne room", "dungeon", "cavern", "street", "plaza", "bridge"]
traps = ["net", "pit", "poison dart", "falling rocks", "snare", "flood", "fire", "ice", "illusion", "curse"]
skill = ["wits", "strength", "agility", "magic", "stealth", "cunning", "luck", "speed", "knowledge", "will"]
person = ["beggar", "orphan", "widow", "farmer", "sailor", "soldier", "child", "priest", "merchant", "minstrel"]
trouble = ["danger", "sickness", "debt", "grief", "fear", "hunger", "cold", "loneliness", "injury", "curse"]
passage = ["doorway", "tunnel", "staircase", "hallway", "shaft", "corridor", "archway", "gate", "portal", "vent"]
feature = ["tapestry", "bookcase", "statue", "fireplace", "fountain", "altar", "pillar", "window", "mirror", "throne"]
broken_object = ["clock", "bridge", "sword", "shield", "armor", "cart", "ship", "wagon", "door", "lock"]
material = ["wood", "iron", "leather", "rope", "cloth", "bone", "stone", "glass", "gold", "silver"]
poem = ["verse", "hymn", "sonnet", "ballad", "epic", "lament", "ode", "riddle", "proverb", "spell"]
audience = ["crowd", "guard", "court", "village", "soldiers", "animals", "spirits", "children", "elders", "enemies"]

# Generate many events
events = set()
for _ in range(300):
    template = random.choice(templates)
    # Replace placeholders with random words
    filled = template.format(
        object=random.choice(objects),
        place=random.choice(places),
        creature=random.choice(creatures),
        terrain=random.choice(terrain),
        cipher=random.choice(ciphers),
        surface=random.choice(surfaces),
        item1=random.choice(item1),
        item2=random.choice(item2),
        stranger=random.choice(stranger),
        structure=random.choice(structures),
        landscape=random.choice(landscape),
        body_of_water=random.choice(body_of_water),
        light=random.choice(light),
        light_source=random.choice(light_source),
        color=random.choice(color),
        sound=random.choice(sounds),
        location=random.choice(locations),
        container=random.choice(containers),
        surprise=random.choice(surprise),
        enemy=random.choice(enemies),
        setting=random.choice(settings),
        trap=random.choice(traps),
        skill=random.choice(skill),
        person=random.choice(person),
        trouble=random.choice(trouble),
        passage=random.choice(passage),
        feature=random.choice(feature),
        broken_object=random.choice(broken_object),
        material=random.choice(material),
        poem=random.choice(poem),
        audience=random.choice(audience),
    )
    events.add(filled)

# Convert to list of dicts
event_list = []
for phrase in events:
    event_list.append({
        "phrase": phrase,
        "act": random.choice(["setup", "rising", "climax", "resolution"]),
        "precondition": {},
        "effect": {}
    })

# Optionally add simple chains (e.g., find key -> open chest) by manually editing later.
# For now, just random acts.

with open("event_rules.json", "w", encoding="utf-8") as f:
    json.dump(event_list, f, indent=2)

print(f"Generated {len(event_list)} unique events.")