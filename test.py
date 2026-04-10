import json
with open("grammar.json", "r") as f:
    g = json.load(f)
print("wizard" in json.dumps(g))