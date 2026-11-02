"""
Build the curated 3,000-problem LeetCode Daily Grind schedule (lc_schedule.json).
Selects the best 3,000 FREE (non-premium) algorithm problems from LeetCode,
organizes them into 7 progressive phases and 30 DSA topics across 300 days (10 problems/day).
Each day has 10 problems ordered by difficulty (Easy -> Medium -> Hard) and popularity.
"""

import json

with open("e:/CP/scratch/lc_problems_raw.json", "r", encoding="utf-8") as f:
    all_problems = json.load(f)

# Filter strictly to FREE (non-premium) problems
free_problems = [p for p in all_problems if not p.get("paidOnly", False)]

processed = []
for p in free_problems:
    diff_raw = p.get("difficulty", "Medium")
    diff = diff_raw.lower()  # 'easy', 'medium', 'hard'
    tags = [t["name"] for t in p.get("topicTags", [])]
    slug = p["titleSlug"]
    qid = str(p["frontendQuestionId"])
    ac_rate = round(float(p.get("acRate", 0.0)), 1)
    solved_count = int(p.get("totalAcceptedRaw", 0))
    
    processed.append({
        "id": qid,
        "contestId": int(qid) if qid.isdigit() else qid,
        "index": slug,
        "titleSlug": slug,
        "name": p["title"],
        "rating": f"{ac_rate}%",
        "acRate": ac_rate,
        "difficulty": diff,
        "tags": tags,
        "solvedCount": solved_count,
        "url": f"https://leetcode.com/problems/{slug}/",
    })

easy_all = sorted([p for p in processed if p["difficulty"] == "easy"], key=lambda x: x["solvedCount"], reverse=True)
med_all = sorted([p for p in processed if p["difficulty"] == "medium"], key=lambda x: x["solvedCount"], reverse=True)
hard_all = sorted([p for p in processed if p["difficulty"] == "hard"], key=lambda x: x["solvedCount"], reverse=True)

# Select the top 3,000 problems: 750 Easy + 1,500 Medium + 750 Hard
selected_easy = easy_all[:750]
selected_med = med_all[:1500]
selected_hard = hard_all[:750]

# Define the 7 Progressive Phases & 30 Topics (total 300 days = 3,000 problems)
CURRICULUM = [
    # Phase 1: Foundations & Arrays (40 Days = 400 Problems)
    {"phaseNum": 1, "phase": "Foundations & Arrays", "topic": "Arrays & Matrix Fundamentals", "days": 14, "tags": ["Array", "Matrix"], "prefer_pure": True},
    {"phaseNum": 1, "phase": "Foundations & Arrays", "topic": "Simulation & Implementation", "days": 10, "tags": ["Simulation"]},
    {"phaseNum": 1, "phase": "Foundations & Arrays", "topic": "Counting & Frequency Analysis", "days": 8, "tags": ["Counting"]},
    {"phaseNum": 1, "phase": "Foundations & Arrays", "topic": "Prefix Sums & Difference Arrays", "days": 8, "tags": ["Prefix Sum"]},

    # Phase 2: Strings, Hashing & Pointers (45 Days = 450 Problems)
    {"phaseNum": 2, "phase": "Strings, Hashing & Pointers", "topic": "String Manipulation & Parsing", "days": 14, "tags": ["String"], "prefer_pure": True},
    {"phaseNum": 2, "phase": "Strings, Hashing & Pointers", "topic": "Hash Tables & Unordered Maps", "days": 12, "tags": ["Hash Table"]},
    {"phaseNum": 2, "phase": "Strings, Hashing & Pointers", "topic": "Two Pointers Technique", "days": 10, "tags": ["Two Pointers"]},
    {"phaseNum": 2, "phase": "Strings, Hashing & Pointers", "topic": "Sliding Window Mastery", "days": 9, "tags": ["Sliding Window"]},

    # Phase 3: Sorting, Searching & Greedy (45 Days = 450 Problems)
    {"phaseNum": 3, "phase": "Sorting, Searching & Greedy", "topic": "Sorting & Custom Comparators", "days": 12, "tags": ["Sorting"]},
    {"phaseNum": 3, "phase": "Sorting, Searching & Greedy", "topic": "Binary Search & Search on Answer", "days": 15, "tags": ["Binary Search"]},
    {"phaseNum": 3, "phase": "Sorting, Searching & Greedy", "topic": "Greedy Algorithms", "days": 18, "tags": ["Greedy"]},

    # Phase 4: Linear Data Structures & Design (35 Days = 350 Problems)
    {"phaseNum": 4, "phase": "Linear Data Structures & Design", "topic": "Linked Lists & Fast/Slow Pointers", "days": 6, "tags": ["Linked List"]},
    {"phaseNum": 4, "phase": "Linear Data Structures & Design", "topic": "Stacks & Queues", "days": 8, "tags": ["Stack", "Queue"]},
    {"phaseNum": 4, "phase": "Linear Data Structures & Design", "topic": "Monotonic Stack & Queue", "days": 6, "tags": ["Monotonic Stack", "Monotonic Queue"]},
    {"phaseNum": 4, "phase": "Linear Data Structures & Design", "topic": "Heaps & Priority Queues", "days": 9, "tags": ["Heap (Priority Queue)"]},
    {"phaseNum": 4, "phase": "Linear Data Structures & Design", "topic": "System & Data Structure Design", "days": 6, "tags": ["Design", "Ordered Set", "Doubly-Linked List", "Iterator", "Data Stream"]},

    # Phase 5: Trees, Tries & Backtracking (40 Days = 400 Problems)
    {"phaseNum": 5, "phase": "Trees, Tries & Backtracking", "topic": "Binary Trees & BST Traversal", "days": 12, "tags": ["Binary Tree", "Binary Search Tree", "Tree"]},
    {"phaseNum": 5, "phase": "Trees, Tries & Backtracking", "topic": "Tree DFS & Path Problems", "days": 10, "tags": ["Tree", "Depth-First Search"]},
    {"phaseNum": 5, "phase": "Trees, Tries & Backtracking", "topic": "Backtracking, Recursion & Enumeration", "days": 13, "tags": ["Backtracking", "Recursion", "Enumeration"]},
    {"phaseNum": 5, "phase": "Trees, Tries & Backtracking", "topic": "Tries & String Matching", "days": 5, "tags": ["Trie", "String Matching", "Rolling Hash", "Hash Function"]},

    # Phase 6: Graphs & Advanced Data Structures (40 Days = 400 Problems)
    {"phaseNum": 6, "phase": "Graphs & Advanced DS", "topic": "Graph DFS & Connected Components", "days": 10, "tags": ["Depth-First Search", "Graph Theory"]},
    {"phaseNum": 6, "phase": "Graphs & Advanced DS", "topic": "Graph BFS & Topological Sort", "days": 11, "tags": ["Breadth-First Search", "Topological Sort"]},
    {"phaseNum": 6, "phase": "Graphs & Advanced DS", "topic": "Shortest Paths, MST & Flows", "days": 5, "tags": ["Shortest Path", "Minimum Spanning Tree", "Graph Theory", "Biconnected Component", "Eulerian Circuit"]},
    {"phaseNum": 6, "phase": "Graphs & Advanced DS", "topic": "Union-Find (Disjoint Set)", "days": 6, "tags": ["Union-Find"]},
    {"phaseNum": 6, "phase": "Graphs & Advanced DS", "topic": "Segment Trees & Fenwick Trees (BIT)", "days": 8, "tags": ["Segment Tree", "Binary Indexed Tree", "Divide and Conquer"]},

    # Phase 7: Dynamic Programming, Math & Bitmasks (55 Days = 550 Problems)
    {"phaseNum": 7, "phase": "DP, Math & Bit Manipulation", "topic": "Dynamic Programming - 1D & Linear", "days": 15, "tags": ["Dynamic Programming", "Memoization"]},
    {"phaseNum": 7, "phase": "DP, Math & Bit Manipulation", "topic": "Dynamic Programming - 2D & Grid", "days": 15, "tags": ["Dynamic Programming"]},
    {"phaseNum": 7, "phase": "DP, Math & Bit Manipulation", "topic": "DP on Trees, Intervals & Bitmasks", "days": 8, "tags": ["Bitmask", "Dynamic Programming", "Game Theory"]},
    {"phaseNum": 7, "phase": "DP, Math & Bit Manipulation", "topic": "Bit Manipulation", "days": 7, "tags": ["Bit Manipulation"]},
    {"phaseNum": 7, "phase": "DP, Math & Bit Manipulation", "topic": "Math, Number Theory & Combinatorics", "days": 10, "tags": ["Math", "Number Theory", "Combinatorics", "Geometry", "Probability and Statistics"]},
]

# Compute exact Easy/Medium/Hard quotas for each topic
topic_quotas = {}
day_parity = 0
for idx, c in enumerate(CURRICULUM):
    e_need, m_need, h_need = 0, 0, 0
    for _ in range(c["days"]):
        if day_parity % 2 == 0:
            e_need += 3; m_need += 5; h_need += 2
        else:
            e_need += 2; m_need += 5; h_need += 3
        day_parity += 1
    topic_quotas[idx] = (e_need, m_need, h_need)

ADVANCED_STRUCTURAL_TAGS = {
    "Linked List", "Binary Tree", "Tree", "Binary Search Tree",
    "Trie", "Segment Tree", "Binary Indexed Tree", "Union-Find",
    "Graph Theory", "Topological Sort", "Shortest Path", "Minimum Spanning Tree",
    "Monotonic Stack", "Monotonic Queue", "Heap (Priority Queue)",
    "Backtracking", "Sliding Window"
}

used_ids = set()

def score_problem_for_topic(p, c):
    """Score how well problem p fits curriculum topic c (higher is better, -1 if no tag overlap)."""
    ptags = set(p["tags"])
    ctags = set(c["tags"])
    overlap = len(ptags & ctags)
    if overlap == 0:
        return -1
    score = overlap * 100
    # If topic is foundational (Array/Matrix or String), strongly prefer problems that don't belong to Tree/Graph/LinkedList/SegTree
    if c.get("prefer_pure"):
        if not (ptags & ADVANCED_STRUCTURAL_TAGS):
            score += 300
        if len(ptags) <= 3:
            score += 100
        if "Matrix" in ptags and "Matrix" in ctags:
            score += 150
    return score

def allocate_pool(pool, quota_index):
    """
    Allocate problems from `pool` (sorted by solvedCount desc) across the 30 topics
    using round-robin waves so that EVERY topic gets its most iconic, highest-solved
    problems first!
    """
    allocations = {idx: [] for idx in range(len(CURRICULUM))}
    needs = {idx: topic_quotas[idx][quota_index] for idx in range(len(CURRICULUM))}
    
    # Pre-sort candidate lists for each topic by (pure/specificity match tier, solvedCount desc)
    candidates = {}
    for idx, c in enumerate(CURRICULUM):
        scored = []
        for p in pool:
            sc = score_problem_for_topic(p, c)
            if sc > 0:
                # Tier 1: pure/high-fit match (sc >= 300), Tier 0: normal tag match
                tier = 1 if sc >= 300 else 0
                scored.append((tier, p["solvedCount"], p))
        scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
        candidates[idx] = [x[2] for x in scored]
    
    ptrs = {idx: 0 for idx in range(len(CURRICULUM))}
    
    # Round-robin in batches of 1 day's worth of problems per topic!
    # This ensures Topic 0 (Arrays) gets Two Sum / Best Time to Buy & Sell Stock / Spiral Matrix / Rotate Image,
    # while Topic 5 (Hash Table), Topic 6 (Two Pointers), Topic 11 (Linked Lists), Topic 25 (DP) ALSO get their #1 classics!
    made_progress = True
    while made_progress:
        made_progress = False
        for idx in range(len(CURRICULUM)):
            if len(allocations[idx]) >= needs[idx]:
                continue
            cand_list = candidates[idx]
            while ptrs[idx] < len(cand_list) and cand_list[ptrs[idx]]["id"] in used_ids:
                ptrs[idx] += 1
            if ptrs[idx] < len(cand_list):
                chosen = cand_list[ptrs[idx]]
                used_ids.add(chosen["id"])
                allocations[idx].append(chosen)
                made_progress = True
    
    # Fallback pass for any topic that still needs problems (when a narrow tag like Easy Segment Tree has < quota)
    unused = [p for p in pool if p["id"] not in used_ids]
    u_ptr = 0
    for idx in range(len(CURRICULUM)):
        while len(allocations[idx]) < needs[idx] and u_ptr < len(unused):
            p = unused[u_ptr]
            u_ptr += 1
            used_ids.add(p["id"])
            allocations[idx].append(p)
            
    return allocations

easy_alloc = allocate_pool(selected_easy, 0)
med_alloc = allocate_pool(selected_med, 1)
hard_alloc = allocate_pool(selected_hard, 2)

# Build the 300-day schedule
schedule = []
current_day = 1
day_parity = 0

for idx, c in enumerate(CURRICULUM):
    e_list = sorted(easy_alloc[idx], key=lambda x: x["solvedCount"], reverse=True)
    m_list = sorted(med_alloc[idx], key=lambda x: x["solvedCount"], reverse=True)
    h_list = sorted(hard_alloc[idx], key=lambda x: x["solvedCount"], reverse=True)
    
    e_ptr, m_ptr, h_ptr = 0, 0, 0
    for _ in range(c["days"]):
        if day_parity % 2 == 0:
            ec, mc, hc = 3, 5, 2
        else:
            ec, mc, hc = 2, 5, 3
        day_parity += 1
        
        day_probs = (
            e_list[e_ptr:e_ptr + ec] +
            m_list[m_ptr:m_ptr + mc] +
            h_list[h_ptr:h_ptr + hc]
        )
        e_ptr += ec
        m_ptr += mc
        h_ptr += hc
        
        schedule.append({
            "day": current_day,
            "topic": c["topic"],
            "phase": c["phase"],
            "phaseNum": c["phaseNum"],
            "problems": day_probs
        })
        current_day += 1

phases_meta = []
for pnum in range(1, 8):
    p_items = [c for c in CURRICULUM if c["phaseNum"] == pnum]
    p_days = sum(c["days"] for c in p_items)
    phases_meta.append({
        "name": p_items[0]["phase"],
        "days": p_days,
        "problems": p_days * 10,
        "topics": [c["topic"] for c in p_items]
    })

all_tags_used = sorted({t for day in schedule for p in day["problems"] for t in p["tags"]})

output = {
    "metadata": {
        "platform": "leetcode",
        "title": "LC Daily Grind",
        "subtitle": "300 Days • 3,000 Problems • 30 Topics",
        "totalDays": 300,
        "totalProblems": 3000,
        "uniqueProblems": len(used_ids),
        "difficultyBreakdown": {
            "easy": 750,
            "medium": 1500,
            "hard": 750
        },
        "phases": phases_meta,
        "tagsUsed": all_tags_used
    },
    "schedule": schedule
}

with open("e:/CP/lc_schedule.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False)

print(f"Successfully generated e:/CP/lc_schedule.json!")
print(f"Total days: {len(schedule)}, Total problems: {sum(len(d['problems']) for d in schedule)}, Unique IDs: {len(used_ids)}")
print("\n=== Sample Day 1 (Arrays & Matrix Fundamentals) ===")
for p in schedule[0]["problems"]:
    print(f"  [{p['difficulty'].upper():<6}] #{p['id']:<4} {p['name']} ({p['solvedCount']:,} solved) - Tags: {', '.join(p['tags'])}")
print("\n=== Sample Day 55 (Hash Tables & Unordered Maps) ===")
for p in schedule[54]["problems"]:
    print(f"  [{p['difficulty'].upper():<6}] #{p['id']:<4} {p['name']} ({p['solvedCount']:,} solved) - Tags: {', '.join(p['tags'])}")
print("\n=== Sample Day 246 (Dynamic Programming - 1D & Linear) ===")
for p in schedule[245]["problems"]:
    print(f"  [{p['difficulty'].upper():<6}] #{p['id']:<4} {p['name']} ({p['solvedCount']:,} solved) - Tags: {', '.join(p['tags'])}")
