import datasets
import json
import os
import sys

print("Downloading dataset (this may take a few minutes for 5GB)...")
ds = datasets.load_dataset("open-r1/codeforces", split="train")

solutions = {}
print("Extracting solutions...")
for row in ds:
    problem_id = row['id']
    editorial = row.get('editorial')
    if editorial:
        solutions[problem_id] = editorial

output_path = os.path.join(os.path.dirname(__file__), "solutions.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(solutions, f, ensure_ascii=False)

print(f"Successfully saved {len(solutions)} solutions to {output_path}")
