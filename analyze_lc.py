import requests
import json
import time
from collections import Counter

url = "https://leetcode.com/graphql"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com/problemset/all/"
}

query = """
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      acRate
      difficulty
      frontendQuestionId: questionFrontendId
      paidOnly: isPaidOnly
      title
      titleSlug
      topicTags {
        name
        slug
      }
      stats
    }
  }
}
"""

all_questions = []
batch_size = 100
skip = 0
total = None

print("Fetching all LeetCode problems via GraphQL...")
while True:
    resp = requests.post(
        url,
        json={"query": query, "variables": {"categorySlug": "algorithms", "skip": skip, "limit": batch_size, "filters": {}}},
        headers=headers,
        timeout=20
    )
    if resp.status_code != 200:
        print(f"Error {resp.status_code} at skip={skip}")
        break
    data = resp.json()["data"]["problemsetQuestionList"]
    if total is None:
        total = data["total"]
        print(f"Total algorithm problems reported by LeetCode: {total}")
    batch = data["questions"]
    if not batch:
        break
    all_questions.extend(batch)
    skip += len(batch)
    print(f"  Fetched {len(all_questions)}/{total}...")
    if skip >= total:
        break
    time.sleep(0.15)

print(f"\nTotal fetched: {len(all_questions)}")

# Parse stats JSON inside each question
for q in all_questions:
    try:
        st = json.loads(q.get("stats", "{}"))
        q["totalAcceptedRaw"] = st.get("totalAcceptedRaw", 0)
        q["totalSubmissionRaw"] = st.get("totalSubmissionRaw", 0)
    except Exception:
        q["totalAcceptedRaw"] = 0
        q["totalSubmissionRaw"] = 0

free_questions = [q for q in all_questions if not q.get("paidOnly")]
paid_questions = [q for q in all_questions if q.get("paidOnly")]

print(f"Free (non-premium) algorithm problems: {len(free_questions)}")
print(f"Paid (premium) algorithm problems:     {len(paid_questions)}")

# Difficulty breakdown for all vs free
for label, subset in [("ALL", all_questions), ("FREE ONLY", free_questions)]:
    easy = [q for q in subset if q["difficulty"] == "Easy"]
    med = [q for q in subset if q["difficulty"] == "Medium"]
    hard = [q for q in subset if q["difficulty"] == "Hard"]
    print(f"\n=== {label} DIFFICULTY BREAKDOWN ({len(subset)}) ===")
    print(f"  Easy:   {len(easy)}")
    print(f"  Medium: {len(med)}")
    print(f"  Hard:   {len(hard)}")

# Tag analysis on free problems
tag_counts = Counter()
easy_tags = Counter()
med_tags = Counter()
hard_tags = Counter()

for q in free_questions:
    diff = q["difficulty"]
    for t in q.get("topicTags", []):
        name = t["name"]
        tag_counts[name] += 1
        if diff == "Easy":
            easy_tags[name] += 1
        elif diff == "Medium":
            med_tags[name] += 1
        else:
            hard_tags[name] += 1

print("\n=== TOP 40 TAGS IN FREE PROBLEMS ===")
print(f"{'Tag':<32} {'Easy':>6} {'Medium':>6} {'Hard':>6} {'Total':>6}")
print("-" * 60)
for tag, count in tag_counts.most_common(40):
    e = easy_tags[tag]
    m = med_tags[tag]
    h = hard_tags[tag]
    print(f"{tag:<32} {e:>6} {m:>6} {h:>6} {count:>6}")

# Save full raw list for fast curriculum generation
with open("e:/CP/scratch/lc_problems_raw.json", "w", encoding="utf-8") as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

print("\nSaved raw problem list to e:/CP/scratch/lc_problems_raw.json")

