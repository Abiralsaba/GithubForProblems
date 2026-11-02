import requests
import json
from collections import Counter, defaultdict

# Fetch all problems from Codeforces API
url = "https://codeforces.com/api/problemset.problems"
response = requests.get(url)
data = response.json()

if data['status'] != 'OK':
    print("API call failed!")
    exit()

problems = data['result']['problems']
statistics = data['result']['problemStatistics']

# Create a mapping of problem key to solved count
solved_count = {}
for stat in statistics:
    key = f"{stat['contestId']}_{stat['index']}"
    solved_count[key] = stat.get('solvedCount', 0)

# Filter problems that have ratings
rated_problems = []
for p in problems:
    if 'rating' in p and p.get('type') == 'PROGRAMMING':
        key = f"{p['contestId']}_{p['index']}"
        p['solvedCount'] = solved_count.get(key, 0)
        # Skip special problems
        if '*special' in p.get('tags', []):
            continue
        rated_problems.append(p)

print(f"Total problems from API: {len(problems)}")
print(f"Rated programming problems (excluding *special): {len(rated_problems)}")
print()

# Rating distribution
rating_counts = Counter()
for p in rated_problems:
    rating_counts[p['rating']] += 1

print("=== RATING DISTRIBUTION ===")
for rating in sorted(rating_counts.keys()):
    print(f"Rating {rating}: {rating_counts[rating]} problems")

print()

# Define difficulty levels
# Easy: 800-1200 (roughly)
# Medium: 1300-1800 (roughly)
# Hard: 1900-3500+ (roughly)

easy = [p for p in rated_problems if 800 <= p['rating'] <= 1200]
medium = [p for p in rated_problems if 1300 <= p['rating'] <= 1800]
hard = [p for p in rated_problems if p['rating'] >= 1900]

print(f"=== DIFFICULTY CLASSIFICATION ===")
print(f"Easy (800-1200): {len(easy)} problems")
print(f"Medium (1300-1800): {len(medium)} problems")
print(f"Hard (1900-3500): {len(hard)} problems")
print()

# Tag analysis
all_tags = Counter()
for p in rated_problems:
    for tag in p.get('tags', []):
        all_tags[tag] += 1

print("=== ALL TAGS (sorted by frequency) ===")
for tag, count in all_tags.most_common():
    print(f"  {tag}: {count} problems")

print()

# Tag distribution by difficulty
easy_tags = Counter()
medium_tags = Counter()
hard_tags = Counter()

for p in easy:
    for tag in p.get('tags', []):
        easy_tags[tag] += 1
for p in medium:
    for tag in p.get('tags', []):
        medium_tags[tag] += 1
for p in hard:
    for tag in p.get('tags', []):
        hard_tags[tag] += 1

print("=== TAG DISTRIBUTION BY DIFFICULTY ===")
all_unique_tags = sorted(set(list(easy_tags.keys()) + list(medium_tags.keys()) + list(hard_tags.keys())))
print(f"{'Tag':<30} {'Easy':>6} {'Medium':>6} {'Hard':>6} {'Total':>6}")
print("-" * 60)
for tag in all_unique_tags:
    e = easy_tags.get(tag, 0)
    m = medium_tags.get(tag, 0)
    h = hard_tags.get(tag, 0)
    print(f"{tag:<30} {e:>6} {m:>6} {h:>6} {e+m+h:>6}")

print()

# Requirements check
# 3650 problems total, 10/day for 365 days
# 3 easy + 4 medium + 3 hard = 10 per day
# Total: 3*365=1095 easy, 4*365=1460 medium, 3*365=1095 hard
needed_easy = 1095
needed_medium = 1460
needed_hard = 1095

print(f"=== REQUIREMENTS CHECK ===")
print(f"Need {needed_easy} easy problems, have {len(easy)} -> {'✓ ENOUGH' if len(easy) >= needed_easy else '✗ NOT ENOUGH'}")
print(f"Need {needed_medium} medium problems, have {len(medium)} -> {'✓ ENOUGH' if len(medium) >= needed_medium else '✗ NOT ENOUGH'}")
print(f"Need {needed_hard} hard problems, have {len(hard)} -> {'✓ ENOUGH' if len(hard) >= needed_hard else '✗ NOT ENOUGH'}")

print()

# Most solved problems (popularity indicator)
sorted_by_solved = sorted(rated_problems, key=lambda x: x['solvedCount'], reverse=True)
print("=== TOP 20 MOST SOLVED PROBLEMS ===")
for i, p in enumerate(sorted_by_solved[:20]):
    print(f"{i+1}. [{p['contestId']}{p['index']}] {p['name']} (Rating: {p['rating']}, Solved: {p['solvedCount']}, Tags: {', '.join(p['tags'])})")

print()

# Group tags into DSA categories for the curriculum
print("=== PROPOSED DSA TOPIC CATEGORIES FOR CURRICULUM ===")
topic_categories = {
    "Implementation & Brute Force": ["implementation", "brute force"],
    "Math & Number Theory": ["math", "number theory", "chinese remainder theorem"],
    "Greedy": ["greedy"],
    "Sorting & Searching": ["sortings", "binary search"],
    "Dynamic Programming": ["dp"],
    "Constructive Algorithms": ["constructive algorithms"],
    "Strings": ["strings", "string suffix structures", "expression parsing", "hashing"],
    "Data Structures": ["data structures"],
    "Graphs": ["graphs", "dfs and similar", "shortest paths", "graph matchings", "2-sat"],
    "Trees": ["trees"],
    "DSU (Disjoint Set Union)": ["dsu"],
    "Segment Trees & BIT": ["data structures"],  # subset
    "Two Pointers & Sliding Window": ["two pointers"],
    "Bit Manipulation": ["bitmasks"],
    "Combinatorics": ["combinatorics"],
    "Divide and Conquer": ["divide and conquer"],
    "Game Theory": ["games", "game theory"],
    "Geometry": ["geometry"],
    "Probability": ["probabilities"],
    "Flows & Matching": ["flows", "graph matchings"],
    "FFT/NTT": ["fft"],
    "Interactive": ["interactive"],
    "Matrices": ["matrices"],
}

for category, tags in topic_categories.items():
    count = len([p for p in rated_problems if any(t in p.get('tags', []) for t in tags)])
    count_easy = len([p for p in easy if any(t in p.get('tags', []) for t in tags)])
    count_med = len([p for p in medium if any(t in p.get('tags', []) for t in tags)])
    count_hard = len([p for p in hard if any(t in p.get('tags', []) for t in tags)])
    print(f"  {category}: {count} total ({count_easy} easy, {count_med} med, {count_hard} hard)")

# Save detailed data for later use
output_data = {
    "total_rated": len(rated_problems),
    "easy_count": len(easy),
    "medium_count": len(medium),
    "hard_count": len(hard),
    "rating_distribution": {str(k): v for k, v in sorted(rating_counts.items())},
    "tag_distribution": dict(all_tags.most_common()),
}

with open("cf_analysis_summary.json", "w") as f:
    json.dump(output_data, f, indent=2)

print()
print("Analysis saved to cf_analysis_summary.json")
