"""
LC & CF Daily Grind - Backend Server (v2.0)
Zero external dependencies required (uses urllib.request & Python stdlib).
Features:
- Serves the web app (LeetCode 3,000 + Codeforces 3,650)
- Persistent code storage in user_code/
- Live LeetCode GraphQL problem statement, starter code & test case fetcher with disk caching (lc_cache/)
- Local C++ syntax & compile verifier via g++/clang++ (/api/compile-check)
"""

import http.server
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
import urllib.error
import webbrowser
from pathlib import Path
from urllib.parse import urlparse, parse_qs

PORT = 8080
BASE_DIR = Path(__file__).parent.resolve()
CODE_DIR = BASE_DIR / "user_code"
LC_CACHE_DIR = BASE_DIR / "lc_cache"

CODE_DIR.mkdir(exist_ok=True)
LC_CACHE_DIR.mkdir(exist_ok=True)

# Detect available C++ compiler once at startup
CPP_COMPILER = shutil.which("g++") or shutil.which("clang++")

LEETCODE_PREAMBLE = """#include <bits/stdc++.h>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
"""

LC_GRAPHQL_QUERY = """
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    content
    difficulty
    likes
    dislikes
    exampleTestcases
    sampleTestCase
    hints
    topicTags {
      name
      slug
    }
    codeSnippets {
      lang
      langSlug
      code
    }
  }
}
"""


def get_code_filepath(platform, contest_id, index):
    safe_idx = str(index).replace("/", "_").replace("\\", "_")
    if platform == "leetcode":
        return CODE_DIR / f"lc_{contest_id}_{safe_idx}.json"
    return CODE_DIR / f"{contest_id}_{safe_idx}.json"


class DailyGrindHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler with API endpoints for LeetCode & Codeforces Daily Grind."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/load-code":
            self.handle_load_code(parsed)
        elif parsed.path == "/api/load-all-codes":
            self.handle_load_all_codes(parsed)
        elif parsed.path == "/api/lc-problem":
            self.handle_lc_problem(parsed)
        elif parsed.path == "/api/health":
            self.send_json({
                "status": "ok",
                "version": "2.0.0",
                "compiler": CPP_COMPILER or None
            })
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/save-code":
            self.handle_save_code()
        elif parsed.path == "/api/delete-code":
            self.handle_delete_code()
        elif parsed.path == "/api/compile-check":
            self.handle_compile_check()
        elif parsed.path == "/api/submit-cf":
            self.handle_submit_cf()
        else:
            self.send_error(404, "Not Found")

    def handle_lc_problem(self, parsed):
        """Fetch and cache full LeetCode problem details (HTML content, C++ starter code, testcases, hints)."""
        params = parse_qs(parsed.query)
        slug = params.get("slug", [None])[0]
        if not slug:
            self.send_json({"error": "Missing slug parameter"}, 400)
            return

        safe_slug = "".join(c for c in slug if c.isalnum() or c in "-_")
        cache_file = LC_CACHE_DIR / f"{safe_slug}.json"

        if cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    cached = json.load(f)
                self.send_json(cached)
                return
            except Exception:
                pass

        try:
            payload = json.dumps({
                "query": LC_GRAPHQL_QUERY,
                "variables": {"titleSlug": safe_slug}
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://leetcode.com/graphql",
                data=payload,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Content-Type": "application/json",
                    "Referer": f"https://leetcode.com/problems/{safe_slug}/",
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                raw = json.loads(resp.read().decode("utf-8"))

            qdata = (raw.get("data") or {}).get("question")
            if not qdata:
                self.send_json({"error": "Problem not found on LeetCode"}, 404)
                return

            snippets = {}
            for s in (qdata.get("codeSnippets") or []):
                snippets[s.get("langSlug", "")] = s.get("code", "")

            result = {
                "questionId": qdata.get("questionId"),
                "questionFrontendId": qdata.get("questionFrontendId"),
                "title": qdata.get("title"),
                "titleSlug": qdata.get("titleSlug"),
                "content": qdata.get("content") or "",
                "difficulty": qdata.get("difficulty"),
                "likes": qdata.get("likes", 0),
                "dislikes": qdata.get("dislikes", 0),
                "sampleTestCase": qdata.get("sampleTestCase") or "",
                "exampleTestcases": qdata.get("exampleTestcases") or "",
                "hints": qdata.get("hints") or [],
                "topicTags": [t.get("name") for t in (qdata.get("topicTags") or [])],
                "cppSnippet": snippets.get("cpp", ""),
                "snippets": {
                    "cpp": snippets.get("cpp", ""),
                    "python": snippets.get("python3", snippets.get("python", "")),
                    "java": snippets.get("java", ""),
                    "c": snippets.get("c", ""),
                    "javascript": snippets.get("javascript", ""),
                    "go": snippets.get("golang", ""),
                    "rust": snippets.get("rust", ""),
                    "kotlin": snippets.get("kotlin", ""),
                    "csharp": snippets.get("csharp", ""),
                }
            }

            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

            self.send_json(result)
        except Exception as e:
            self.send_json({"error": f"Failed to fetch from LeetCode: {str(e)}"}, 502)

    def handle_compile_check(self):
        """Run local g++/clang++ syntax & type verification on C++ code."""
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))
            code = data.get("code", "")
            platform = data.get("platform", "leetcode")

            if not code.strip():
                self.send_json({"success": False, "error": "Code is empty."}, 400)
                return

            if not CPP_COMPILER:
                self.send_json({"success": False, "error": "No C++ compiler (g++ / clang++) found in PATH."}, 400)
                return

            if platform == "leetcode":
                full_source = LEETCODE_PREAMBLE + "\n" + code + "\n"
            else:
                full_source = code

            proc = subprocess.Popen(
                [CPP_COMPILER, "-std=c++14", "-fsyntax-only", "-Wno-vla", "-x", "c++", "-"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            _, stderr = proc.communicate(input=full_source, timeout=10)

            if proc.returncode == 0:
                self.send_json({"success": True, "message": "Compiles cleanly (0 errors)"})
            else:
                # Adjust line numbers in error output if preamble was prepended
                preamble_lines = LEETCODE_PREAMBLE.count("\n") + 1 if platform == "leetcode" else 0
                cleaned_lines = []
                for line in stderr.splitlines():
                    if "<stdin>:" in line and preamble_lines > 0:
                        parts = line.split("<stdin>:")
                        rest = parts[1]
                        num_str = rest.split(":", 1)[0]
                        if num_str.isdigit():
                            adj = max(1, int(num_str) - preamble_lines)
                            rest = f"{adj}:" + rest.split(":", 1)[1]
                        cleaned_lines.append("Line " + rest)
                    else:
                        cleaned_lines.append(line)
                self.send_json({"success": False, "error": "\n".join(cleaned_lines[:15])})
        except subprocess.TimeoutExpired:
            proc.kill()
            self.send_json({"success": False, "error": "Compiler check timed out."}, 500)
        except Exception as e:
            self.send_json({"success": False, "error": str(e)}, 500)

    def handle_save_code(self):
        """Save code for a specific problem."""
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))

            contest_id = data.get("contestId")
            index = data.get("index")
            code = data.get("code", "")
            language = data.get("language", "cpp")
            platform = data.get("platform", "leetcode")

            if not contest_id or not index:
                self.send_json({"error": "Missing contestId or index"}, 400)
                return

            filepath = get_code_filepath(platform, contest_id, index)

            code_data = {
                "platform": platform,
                "contestId": contest_id,
                "index": index,
                "code": code,
                "language": language,
                "savedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
            }

            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(code_data, f, ensure_ascii=False, indent=2)

            self.send_json({"success": True, "filename": filepath.name})

        except json.JSONDecodeError:
            self.send_json({"error": "Invalid JSON"}, 400)
        except Exception as e:
            self.send_json({"error": str(e)}, 500)

    def handle_load_code(self, parsed):
        """Load code for a specific problem."""
        params = parse_qs(parsed.query)
        contest_id = params.get("contestId", [None])[0]
        index = params.get("index", [None])[0]
        platform = params.get("platform", ["leetcode"])[0]

        if not contest_id or not index:
            self.send_json({"error": "Missing contestId or index"}, 400)
            return

        filepath = get_code_filepath(platform, contest_id, index)
        # Fallback to legacy filename if needed
        if not filepath.exists():
            legacy = CODE_DIR / f"{contest_id}_{index}.json"
            if legacy.exists():
                filepath = legacy

        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.send_json(data)
        else:
            self.send_json({"code": "", "language": "cpp", "savedAt": None})

    def handle_load_all_codes(self, parsed):
        """Load a summary of all saved codes for instant badge rendering."""
        params = parse_qs(parsed.query)
        platform = params.get("platform", [None])[0]
        codes = {}
        try:
            for f in CODE_DIR.iterdir():
                if f.suffix == ".json":
                    try:
                        with open(f, "r", encoding="utf-8") as fh:
                            data = json.load(fh)
                        file_plat = data.get("platform", "codeforces" if not f.name.startswith("lc_") else "leetcode")
                        if platform and file_plat != platform:
                            continue
                        key = f"{data.get('contestId')}_{data.get('index')}"
                        code_str = data.get("code", "")
                        if code_str.strip():
                            codes[key] = {
                                "code": code_str,
                                "language": data.get("language", "cpp"),
                                "savedAt": data.get("savedAt"),
                                "hasCode": True,
                            }
                    except (json.JSONDecodeError, KeyError):
                        continue
        except Exception:
            pass
        self.send_json(codes)

    def handle_delete_code(self):
        """Delete code for a specific problem."""
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))

            contest_id = data.get("contestId")
            index = data.get("index")
            platform = data.get("platform", "leetcode")

            if not contest_id or not index:
                self.send_json({"error": "Missing contestId or index"}, 400)
                return

            filepath = get_code_filepath(platform, contest_id, index)
            if filepath.exists():
                filepath.unlink()
            legacy = CODE_DIR / f"{contest_id}_{index}.json"
            if legacy.exists():
                legacy.unlink()
            self.send_json({"success": True})
        except Exception as e:
            self.send_json({"error": str(e)}, 500)

    def handle_submit_cf(self):
        """Submit code to Codeforces via Playwright script."""
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)

            process = subprocess.Popen(
                [sys.executable, str(BASE_DIR / "cf_submit.py")],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=str(BASE_DIR)
            )

            stdout, stderr = process.communicate(input=body.decode("utf-8"), timeout=30)

            try:
                result = json.loads(stdout.strip())
                if result.get("success"):
                    self.send_json(result)
                else:
                    self.send_json(result, 400)
            except json.JSONDecodeError:
                self.send_json({"success": False, "error": stderr or stdout}, 500)

        except subprocess.TimeoutExpired:
            process.kill()
            self.send_json({"success": False, "error": "Submission timed out after 30 seconds."}, 500)
        except Exception as e:
            self.send_json({"success": False, "error": str(e)}, 500)

    def send_json(self, data, status=200):
        """Send a JSON response."""
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        """Quieter logging - only show API calls and errors."""
        path = args[0].split()[1] if args else ""
        if path.startswith("/api/") or "404" in str(args) or "500" in str(args):
            super().log_message(format, *args)


def main():
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(("localhost", PORT))
    sock.close()

    if result == 0:
        print(f"[!] Port {PORT} is already in use.")
        print(f"    Either close the other server or change PORT in server.py")
        sys.exit(1)

    server = http.server.HTTPServer(("0.0.0.0", PORT), DailyGrindHandler)

    print(r"""
   _     ____    ____        _ _          ____       _           _ 
  | |   / ___|  |  _ \  __ _(_) |_   _   / ___|_ __ (_)_ __   __| |
  | |  | |      | | | |/ _` | | | | | | | |  _| '__|| | '_ \ / _` |
  | |__| |___   | |_| | (_| | | | |_| | | |_| | |   | | | | | (_| |
  |_____\____|  |____/ \__,_|_|_|\__, |  \____|_|   |_|_| |_|\__,_|
                                 |___/                              
    """)
    print(f"  Server running at: http://localhost:{PORT}")
    print(f"  Code storage dir:  {CODE_DIR}")
    print(f"  LC problem cache:  {LC_CACHE_DIR}")
    print(f"  C++ compiler:      {CPP_COMPILER or 'Not found'}")
    print(f"  Press Ctrl+C to stop\n")

    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except Exception:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped. Goodbye!")
        server.server_close()


if __name__ == "__main__":
    main()
