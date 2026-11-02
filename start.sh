#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  LC & CF Daily Grind — Universal Startup Script
#  Handles ALL initialization: deps, dirs, port, server, browser
#  Works on: macOS, Linux, Windows (Git Bash / WSL)
# ═══════════════════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

cd "$(dirname "$0")" || exit 1
SCRIPT_DIR="$(pwd)"

echo ""
echo -e "${CYAN}${BOLD}"
echo "   ╔═══════════════════════════════════════╗"
echo "   ║     LC & CF Daily Grind — Starting    ║"
echo "   ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# ── Step 1: Find working Python 3 (ignoring Windows Store stub) ──
echo -e "  ${BOLD}[1/5]${NC} Checking Python..."

PYTHON=""
for CANDIDATE in python python3 "py -3"; do
    if $CANDIDATE -c "import sys; sys.exit(0 if sys.version_info.major == 3 else 1)" >/dev/null 2>&1; then
        PYTHON="$CANDIDATE"
        break
    fi
done

if [ -z "$PYTHON" ]; then
    echo -e "  ${RED}[ERROR]${NC} Python 3 is not installed or not in PATH."
    exit 1
fi

PY_VERSION=$($PYTHON --version 2>&1)
echo -e "  ${GREEN}✓${NC} Found: $PYTHON ($PY_VERSION)"

# ── Step 2: Verify required files ──────────────────────────────
echo -e "  ${BOLD}[2/5]${NC} Verifying project files..."

MISSING=0
for FILE in server.py index.html app.js styles.css lc_schedule.json; do
    if [ ! -f "$SCRIPT_DIR/$FILE" ]; then
        echo -e "  ${RED}✗${NC} Missing: $FILE"
        MISSING=1
    fi
done

if [ "$MISSING" -eq 1 ]; then
    echo -e "  ${RED}[ERROR]${NC} Required files are missing."
    exit 1
fi

echo -e "  ${GREEN}✓${NC} All required files present"

# ── Step 3: Ensure directories exist ───────────────────────────
echo -e "  ${BOLD}[3/5]${NC} Setting up directories..."

mkdir -p "$SCRIPT_DIR/user_code" "$SCRIPT_DIR/lc_cache"
echo -e "  ${GREEN}✓${NC} user_code/ and lc_cache/ ready"

# ── Step 4: Kill existing server on port 8080 ──────────────────
echo -e "  ${BOLD}[4/5]${NC} Checking port 8080..."

PORT=8080
OS_TYPE="$(uname -s 2>/dev/null || echo "Unknown")"

case "$OS_TYPE" in
    Linux*)
        fuser -k $PORT/tcp 2>/dev/null && echo -e "  ${YELLOW}⚡${NC} Killed existing process on port $PORT" || true
        ;;
    Darwin*)
        lsof -ti:$PORT | xargs kill -9 2>/dev/null && echo -e "  ${YELLOW}⚡${NC} Killed existing process on port $PORT" || true
        ;;
    MINGW*|MSYS*|CYGWIN*)
        PID=$(netstat -aon 2>/dev/null | grep ":$PORT " | grep "LISTENING" | awk '{print $5}' | head -1)
        if [ -n "$PID" ] && [ "$PID" != "0" ]; then
            taskkill //F //PID "$PID" >/dev/null 2>&1 && echo -e "  ${YELLOW}⚡${NC} Killed existing process on port $PORT (PID $PID)" || true
        fi
        ;;
esac

echo -e "  ${GREEN}✓${NC} Port $PORT is available"

# ── Step 5: Launch server ──────────────────────────────────────
echo -e "  ${BOLD}[5/5]${NC} Launching server..."
echo ""
echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${BOLD}  URL:${NC}  ${GREEN}http://localhost:$PORT${NC}"
echo -e "  ${BOLD}  Dir:${NC}  $SCRIPT_DIR"
echo -e "  ${BOLD}  Stop:${NC} Press ${YELLOW}Ctrl+C${NC}"
echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

$PYTHON server.py
