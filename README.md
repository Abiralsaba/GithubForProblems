# LC & CF Daily Grind — Competitive Programming & DSA Tracker

A full-stack daily practice tracker and automated C++ problem-solving workspace for **LeetCode (3,000 Curated Problems across 300 Days)** and **Codeforces (3,650 Problems across 365 Days)**.

## Key Features
- **3,000 Best Free LeetCode Problems (`lc_schedule.json`)**: Organized into **7 Progressive Phases** and **30 DSA Topics** over **300 Days** (10 problems/day: Easy, Medium, Hard).
- **3,650 Rated Codeforces Problems (`schedule.json`)**: Organized across **29 CP Topics** over **365 Days**.
- **Live LeetCode Statement, Hints & Starter Code Fetcher (`server.py`)**: Queries LeetCode GraphQL API and caches problem descriptions, sample test cases, hints, and official `class Solution` C++ templates locally in `lc_cache/`.
- **1-Click Fast Auto-Solve (`⚡`) & Batch Day Solver**: Generates C++14-compatible solutions strictly matching personal competitive programming style, verifies syntax via local `g++`, saves to `user_code/`, copies to clipboard, and opens the problem page.
- **Local C++ Compiler Verification (`🔨 Check C++`)**: Instant syntax and type checking via `g++ -std=c++14 -fsyntax-only`.
- **Global Instant Search**: Filter all 3,000+ problems by `#ID`, title, topic tag, difficulty, or solved status.

## Quick Start

### Windows
```bat
start.bat
```

### macOS / Linux / Git Bash
```bash
./start.sh
```

Or run directly with Python 3:
```bash
python server.py
```
Then open `http://localhost:8080`.

