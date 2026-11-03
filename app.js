/**
 * LC & CF Daily Grind (v2.0)
 * 3,000 Curated LeetCode Problems (300 Days) + 3,650 Codeforces Problems (365 Days)
 * Features:
 * - Live LeetCode GraphQL Problem Statement, Starter Template & Hints Fetcher
 * - Strictly Enforced Personal C++ Coding Style Engine
 * - Fast 1-Click Auto-Solve (⚡) + Batch Day Solver + Local g++ Compile Verifier
 * - Global Instant Search across all 3,000+ problems
 */

// ========================
// State
// ========================
let currentPlatform = 'leetcode'; // 'leetcode' | 'codeforces'
let scheduleCache = {};           // { leetcode: scheduleObj, codeforces: scheduleObj }
let scheduleData = null;
let allProblemsFlat = [];         // Flattened list with day reference for fast global search
let currentDay = 1;
let solvedProblems = {};
let currentView = 'daily';

let openStatements = {};          // { key: true }
let statementCache = {};          // { slug: lcProblemData }
let openEditors = {};             // { key: true }
let codeCache = {};               // { key: { code, language, savedAt, hasCode } }
let unsavedChanges = {};          // { key: true }
let openAIPanels = {};            // { key: true }
let aiCache = {};                 // { key: cachedHTML }
let aiStreaming = {};             // { key: true }
let batchRunning = false;

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GROQ_API_BASE = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL_EASY = 'openai/gpt-oss-120b';
const GEMINI_MODEL_MEDIUM = 'gemini-3.5-flash';
const GEMINI_MODEL_PRIMARY = 'gemini-3.7-flash';

const LANGUAGES = [
    { value: 'cpp', label: 'C++' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'csharp', label: 'C#' },
];

const PLACEHOLDERS_LC = {
    cpp: `class Solution {\npublic:\n    // Your C++ solution here\n};`,
    python: `class Solution:\n    def solve(self):\n        pass`,
    java: `class Solution {\n    public void solve() {\n    }\n}`,
    c: `// Your C solution here`,
    javascript: `var solve = function() {\n};`,
    go: `func solve() {\n}`,
    rust: `impl Solution {\n}`,
    kotlin: `class Solution {\n}`,
    csharp: `public class Solution {\n}`,
};

const PLACEHOLDERS_CF = {
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n    while (t--) {\n        \n    }\n    return 0;\n}`,
    python: `import sys\ninput = sys.stdin.readline\n\ndef solve():\n    pass\n\nt = int(input())\nfor _ in range(t):\n    solve()`,
    java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n    }\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    return 0;\n}`,
    javascript: `const readline = require('readline');`,
    go: `package main\n\nfunc main() {}`,
    rust: `fn main() {}`,
    kotlin: `fun main() {}`,
    csharp: `class Program { static void Main() {} }`,
};

// ============================================================================
// Personal C++ Coding Style Prompts (Matched to c:\Users\UseR\Downloads\codeforce\codeforce)
// ============================================================================

const USER_CPP_STYLE_RULES_LC = `CRITICAL C++ CODING STYLE RULES (MUST FOLLOW STRICTLY — MATCH THE USER'S EXACT PERSONAL STYLE):
1. Provide the exact 'class Solution { public: ... };' structure matching LeetCode's starter signature.
2. ZERO COMMENTS: Do NOT include ANY comments ('//' or '/* ... */') anywhere inside the C++ code.
3. ZERO MACROS / TYPEDEFS: Do NOT use '#define', 'typedef', 'using ll = long long;', 'pb', 'all()', etc. Write explicit 'long long', 'pair<int, int>', 'vector<int>', 'vector<vector<int>>'.
4. C++14 COMPATIBLE: Do NOT use C++17 structured bindings like 'auto [u, v] = ...'. Unpack pairs explicitly (e.g. 'int u = p.first; int v = p.second;'). Cast '.size()' to '(int)' when comparing with signed ints (e.g. 'for (int i = 0; i < (int)a.size(); i++)').
5. VARIABLE NAMING: Use short, direct competitive-programming variable names: 'n', 'm', 'ans', 'res', 'cnt', 'sum', 'mn', 'mx', 'ok', 'l', 'r', 'mid', 'cur', 'best', 'vis', 'dp', 'freq', 'st', 'top', 'adj', 'pre'.
6. LOOPS & CONTROL FLOW:
   - Prefer classic indexed loops: 'for (int i = 0; i < n; i++)' and 'for (int j = 0; j < m; j++)'.
   - Omit curly braces '{}' on single-line 'if', 'else', and 'for' statements when short (e.g., 'if (a[i] < mn) mn = a[i];', 'if (!ok) return -1;', 'for (int i = 0; i < n; i++) sum += a[i];').
7. DATA STRUCTURES:
   - Use simple local arrays / C-style arrays (e.g. 'int freq[26] = {0};', 'int st[n]; int top = 0;', 'bool vis[n];') or plain 'vector' cleanly without over-engineered OOP abstractions.
8. INDENTATION: Use clean 4-space indentation.`;

const AI_SYSTEM_PROMPT_LC = `You are an elite competitive programmer and algorithm educator. You explain LeetCode problems clearly and write C++ solutions in the user's exact personal coding style.

When analyzing a LeetCode problem, provide:

## Problem Analysis
Briefly summarize the core problem, input/output, and key constraints.

## Key Observations
List the crucial insights ("aha" moments) that lead to the optimal solution.

## Optimal Approach
Explain the algorithm step-by-step and why it works.

## Solution Code
Provide the complete C++ solution inside a \`\`\`cpp code block:
${USER_CPP_STYLE_RULES_LC}

## Complexity
- **Time:** O(...)
- **Space:** O(...)

## Common Pitfalls
Edge cases to watch out for.`;

const AI_FAST_CODE_PROMPT_LC = `You are an elite competitive programmer. Output ONLY a single \`\`\`cpp code block containing the optimal LeetCode C++ 'class Solution' implementation. Do NOT output any prose before or after the code block.
${USER_CPP_STYLE_RULES_LC}`;

const AI_SYSTEM_PROMPT_CF = `You are an elite competitive programmer and educator. You help users learn by explaining Codeforces problems in depth.

When analyzing a problem, provide:
## Problem Analysis
## Key Observations
## Approach
Do NOT use triple-backtick code blocks in the Approach section — reserve triple-backtick code blocks ONLY for the final C++ solution in the Solution Code section.

## Solution Code
Provide a clean C++ solution inside a \`\`\`cpp code block that strictly matches the user's coding style:
1. Always start with:
#include <bits/stdc++.h>
using namespace std;
2. Do NOT add any comments ('//' or '/* */') inside the C++ code block.
3. Use standard 'int main()' and if multiple test cases exist, use:
    int t;
    cin >> t;
    while (t--) {
        ...
    }
4. Use short variable names ('n', 'm', 'a', 'b', 'ans', 'mn', 'mx', 'cnt', 'ok', 'vis', 'dp').
5. Omit curly braces {} for short single-line 'if' statements and 'for' loops.
6. Declare local arrays using C-style arrays ('int a[n];') where appropriate, and cast '(int)v.size()' in loops.
7. Do NOT use macros like '#define int long long' or 'pb'. Do NOT use C++17 structured bindings.
8. End main() with 'return 0;'.

## Complexity
- **Time:** O(...)
- **Space:** O(...)

## Common Pitfalls`;

const AI_FAST_CODE_PROMPT_CF = `You are an elite competitive programmer.
First, write a brief 2-line summary recalling the exact official Codeforces problem statement, input format, and required output for the given Contest ID + Problem Index. Do NOT use any triple-backtick fences in this 2-line summary.
Then, output a single \`\`\`cpp code block containing the complete, optimal C++ solution strictly in the user's coding style:
1. Always start with:
#include <bits/stdc++.h>
using namespace std;
2. ZERO COMMENTS: Do NOT include any '//' or '/* */' comments inside the C++ code.
3. ZERO MACROS: Do NOT use '#define', 'typedef', 'pb', 'all()'.
4. Use short variable names ('n', 'm', 'a', 'b', 'ans', 'mn', 'mx', 'cnt', 'ok', 'vis', 'dp').
5. Omit curly braces {} for short single-line 'if' statements and 'for' loops.
6. Declare local arrays using C-style arrays ('int a[n];') where appropriate, and cast '(int)v.size()' in loops.
7. End main() with 'return 0;'.`;

// ========================
// Initialization
// ========================

async function init() {
    const savedPlat = localStorage.getItem('daily-grind-platform');
    if (savedPlat === 'codeforces' || savedPlat === 'leetcode') {
        currentPlatform = savedPlat;
    }

    loadSavedState();
    updatePlatformUI();
    await loadSchedule(currentPlatform);
    await loadAllCodesSummary();
    hideLoading();
    renderCurrentView();
    updateStreakBadge();
    registerServiceWorker();
}

function getStoragePrefix() {
    return currentPlatform === 'leetcode' ? 'lc-daily-grind' : 'cf-daily-grind';
}

async function switchPlatform(platform) {
    if (platform === currentPlatform && scheduleData) return;
    currentPlatform = platform;
    localStorage.setItem('daily-grind-platform', currentPlatform);

    openStatements = {};
    openEditors = {};
    openAIPanels = {};
    codeCache = {};
    unsavedChanges = {};

    loadSavedState();
    updatePlatformUI();
    await loadSchedule(currentPlatform);
    await loadAllCodesSummary();
    renderCurrentView();
    updateStreakBadge();
}

function updatePlatformUI() {
    const isLC = currentPlatform === 'leetcode';
    document.getElementById('plat-leetcode')?.classList.toggle('active', isLC);
    document.getElementById('plat-codeforces')?.classList.toggle('active', !isLC);

    document.getElementById('app-title').textContent = isLC ? 'LC Daily Grind' : 'CF Daily Grind';
    document.title = isLC
        ? 'LC Daily Grind - 3,000 Best LeetCode Problems Tracker'
        : 'CF Daily Grind - 365-Day Codeforces Practice Tracker';

    const easyRange = document.getElementById('easy-range-label');
    const medRange = document.getElementById('medium-range-label');
    const hardRange = document.getElementById('hard-range-label');
    if (easyRange) easyRange.textContent = isLC ? '(Foundational)' : '(800-1200)';
    if (medRange) medRange.textContent = isLC ? '(Core Interview & Contest)' : '(1300-1800)';
    if (hardRange) hardRange.textContent = isLC ? '(Advanced)' : '(1900+)';
}

async function loadSchedule(platform) {
    const file = platform === 'leetcode' ? 'lc_schedule.json' : 'schedule.json';
    try {
        if (!scheduleCache[platform]) {
            const response = await fetch(file);
            scheduleCache[platform] = await response.json();
        }
        scheduleData = scheduleCache[platform];
        const totalDays = scheduleData.metadata.totalDays || scheduleData.schedule.length;
        const totalProbs = scheduleData.metadata.totalProblems;
        const totalTopics = scheduleData.metadata.phases.reduce((acc, p) => acc + p.topics.length, 0);

        document.getElementById('app-subtitle').textContent =
            `${totalDays} Days • ${totalProbs.toLocaleString()} Problems • ${totalTopics} Topics`;
        const calTitle = document.getElementById('calendar-title');
        if (calTitle) calTitle.textContent = `${totalDays}-Day Overview`;

        const dayInput = document.getElementById('day-input');
        if (dayInput) dayInput.max = totalDays;

        if (currentDay > totalDays) currentDay = 1;

        // Build flat list for fast global search
        allProblemsFlat = [];
        scheduleData.schedule.forEach(d => {
            d.problems.forEach(p => {
                allProblemsFlat.push({ ...p, day: d.day, topic: d.topic, phase: d.phase });
            });
        });
    } catch (err) {
        console.error('Failed to load schedule:', err);
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.innerHTML = `
                <div class="loader-container">
                    <div style="color: #ef4444; font-size: 16px; font-weight: 600;">Failed to load ${file}</div>
                    <div style="color: #9898b0; font-size: 13px; margin-top: 8px;">Run python build_lc_schedule.py or start server.py</div>
                </div>
            `;
        }
    }
}

async function loadAllCodesSummary() {
    try {
        const res = await fetch(`/api/load-all-codes?platform=${currentPlatform}`);
        if (res.ok) {
            const data = await res.json();
            codeCache = { ...codeCache, ...data };
        }
    } catch (e) {}
}

function loadSavedState() {
    const prefix = getStoragePrefix();
    solvedProblems = {};
    currentDay = 1;
    aiCache = {};

    try {
        const saved = localStorage.getItem(`${prefix}-solved`);
        if (saved) solvedProblems = JSON.parse(saved);

        const savedDay = localStorage.getItem(`${prefix}-current-day`);
        if (savedDay) currentDay = parseInt(savedDay) || 1;

        const savedTheme = localStorage.getItem('cf-daily-grind-theme');
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            document.getElementById('theme-icon-sun').style.display = 'none';
            document.getElementById('theme-icon-moon').style.display = 'block';
        }

        const savedAI = localStorage.getItem(`${prefix}-ai-cache`);
        if (savedAI) aiCache = JSON.parse(savedAI);
    } catch (e) {
        console.warn('Failed to load saved state:', e);
    }
}

function saveState() {
    const prefix = getStoragePrefix();
    try {
        localStorage.setItem(`${prefix}-solved`, JSON.stringify(solvedProblems));
        localStorage.setItem(`${prefix}-current-day`, currentDay.toString());
    } catch (e) {
        console.warn('Failed to save state:', e);
    }
}

function hideLoading() {
    const loader = document.getElementById('loading-screen');
    if (!loader) return;
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 400);
}

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js?v=29');
            reg.update();
        } catch (err) {}
    }
}

// ========================
// Settings
// ========================

function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('open');

    document.getElementById('api-key-input').value = getGeminiKey();
    document.getElementById('groq-key-input').value = getGroqKey();
    document.getElementById('groq-easy-model-input').value = getEasyModel();
    document.getElementById('gemini-medium-model-input').value = getMediumModel();
    document.getElementById('gemini-hard-model-input').value = getHardModel();
    document.getElementById('autosolve-mode-select').value = getAutoSolveMode();

    const status = document.getElementById('settings-status');
    status.textContent = '';
    status.className = 'settings-status';
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('open');
}

function closeSettingsOnOverlay(event) {
    if (event.target === event.currentTarget) closeSettings();
}

function toggleApiKeyVisibility() {
    const input = document.getElementById('api-key-input');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function toggleGroqKeyVisibility() {
    const input = document.getElementById('groq-key-input');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function saveSettings() {
    const geminiKey = document.getElementById('api-key-input').value.trim();
    const groqKey = document.getElementById('groq-key-input').value.trim();
    const easyModel = document.getElementById('groq-easy-model-input').value.trim() || GROQ_MODEL_EASY;
    const mediumModel = document.getElementById('gemini-medium-model-input').value.trim() || GEMINI_MODEL_MEDIUM;
    const hardModel = document.getElementById('gemini-hard-model-input').value.trim() || GEMINI_MODEL_PRIMARY;
    const autoSolveMode = document.getElementById('autosolve-mode-select').value || 'fast';

    localStorage.setItem('cf-daily-grind-api-key', geminiKey);
    localStorage.setItem('cf-daily-grind-groq-key', groqKey);
    localStorage.setItem('cf-daily-grind-model-easy', easyModel);
    localStorage.setItem('cf-daily-grind-model-medium', mediumModel);
    localStorage.setItem('cf-daily-grind-model-hard', hardModel);
    localStorage.setItem('daily-grind-autosolve-mode', autoSolveMode);

    const status = document.getElementById('settings-status');
    status.textContent = '✓ Settings saved successfully!';
    status.className = 'settings-status success';

    setTimeout(() => closeSettings(), 900);
}

function cleanLegacy25Model(m, fallback) {
    if (!m || m.startsWith('gemini-2.5')) return fallback;
    return m;
}

function getGeminiKey() { return localStorage.getItem('cf-daily-grind-api-key') || ''; }
function getGroqKey() { return localStorage.getItem('cf-daily-grind-groq-key') || ''; }
function getEasyModel() { return cleanLegacy25Model(localStorage.getItem('cf-daily-grind-model-easy'), GROQ_MODEL_EASY); }
function getMediumModel() { return cleanLegacy25Model(localStorage.getItem('cf-daily-grind-model-medium'), GEMINI_MODEL_MEDIUM); }
function getHardModel() { return cleanLegacy25Model(localStorage.getItem('cf-daily-grind-model-hard'), GEMINI_MODEL_PRIMARY); }
function getAutoSolveMode() { return localStorage.getItem('daily-grind-autosolve-mode') || 'fast'; }

// ========================
// View Switching
// ========================

function switchView(view) {
    currentView = view;

    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === view);
    });

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(`view-${view}`);
    if (targetView) targetView.classList.add('active');

    renderCurrentView();
    if (view === 'search') {
        requestAnimationFrame(() => document.getElementById('global-search-input')?.focus());
    }
}

function renderCurrentView() {
    switch (currentView) {
        case 'daily': renderDailyView(); break;
        case 'calendar': renderCalendarView(); break;
        case 'topics': renderTopicsView(); break;
        case 'search': renderSearchView(); break;
        case 'stats': renderStatsView(); break;
    }
}

// ========================
// Problem Lookup Helper
// ========================

function findProblemByKey(contestId, index) {
    const dayData = scheduleData?.schedule[currentDay - 1];
    const fromDay = dayData?.problems.find(p => String(p.contestId) === String(contestId) && String(p.index) === String(index));
    if (fromDay) return fromDay;
    return allProblemsFlat.find(p => String(p.contestId) === String(contestId) && String(p.index) === String(index));
}

function formatProblemDisplayId(p) {
    if (currentPlatform === 'leetcode') {
        return `#${p.contestId}`;
    }
    return `${p.contestId}${p.index}`;
}

// ========================
// Daily View
// ========================

function renderDailyView() {
    if (!scheduleData) return;

    const dayData = scheduleData.schedule[currentDay - 1];
    if (!dayData) return;

    document.getElementById('day-number').textContent = `Day ${dayData.day}`;
    document.getElementById('day-topic').textContent = dayData.topic;
    document.getElementById('day-phase').textContent = `Phase ${dayData.phaseNum}: ${dayData.phase}`;

    const problems = dayData.problems;
    const solvedCount = problems.filter(p => isProblemSolved(p)).length;
    const total = problems.length;
    const pct = total > 0 ? (solvedCount / total) * 100 : 0;

    document.getElementById('day-progress-fill').style.width = `${pct}%`;
    document.getElementById('day-progress-text').textContent = `${solvedCount}/${total} solved`;

    const easy = problems.filter(p => p.difficulty === 'easy');
    const medium = problems.filter(p => p.difficulty === 'medium');
    const hard = problems.filter(p => p.difficulty === 'hard');

    renderProblemCards('easy-cards', easy, false);
    renderProblemCards('medium-cards', medium, false);
    renderProblemCards('hard-cards', hard, false);

    document.getElementById('easy-group').style.display = easy.length ? 'block' : 'none';
    document.getElementById('medium-group').style.display = medium.length ? 'block' : 'none';
    document.getElementById('hard-group').style.display = hard.length ? 'block' : 'none';

    document.getElementById('day-input').value = '';
    document.getElementById('day-input').placeholder = `${currentDay}`;
}

function renderProblemCards(containerId, problems, showDayBadge = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const isLC = currentPlatform === 'leetcode';
    const placeholders = isLC ? PLACEHOLDERS_LC : PLACEHOLDERS_CF;

    problems.forEach((p) => {
        const solved = isProblemSolved(p);
        const key = `${p.contestId}_${p.index}`;
        const hasCode = codeCache[key]?.hasCode || codeCache[key]?.code?.trim();
        const isStatementOpen = openStatements[key];
        const isEditorOpen = openEditors[key];
        const isAIOpen = openAIPanels[key];
        const hasAI = !!aiCache[key];

        const wrapper = document.createElement('div');
        wrapper.className = 'problem-card-wrapper';

        const card = document.createElement('div');
        card.className = `problem-card${solved ? ' solved' : ''}`;
        if (isStatementOpen || isEditorOpen || isAIOpen) {
            card.style.borderRadius = 'var(--radius-md) var(--radius-md) 0 0';
        }

        const solvedCountFormatted = formatNumber(p.solvedCount || 0);
        const displayId = formatProblemDisplayId(p);
        const safeIndex = String(p.index).replace(/'/g, "\\'");
        const submitLabel = isLC ? '🚀 Copy & Open LC' : '🚀 Auto-Submit to CF';
        const linkTitle = isLC ? 'Open on LeetCode' : 'Open on Codeforces';

        card.innerHTML = `
            <div class="problem-checkbox" onclick="toggleSolved(event, '${p.contestId}', '${safeIndex}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div class="problem-details">
                <div class="problem-name" title="${escapeHtml(p.name)}">${displayId} - ${escapeHtml(p.name)}</div>
                <div class="problem-tags">
                    ${showDayBadge && p.day ? `<span class="day-jump-pill" onclick="jumpToSpecificDay(event, ${p.day})">Day ${p.day}</span>` : ''}
                    ${(p.tags || []).map(t => `<span class="problem-tag">${escapeHtml(t)}</span>`).join('')}
                </div>
            </div>
            <div class="problem-meta">
                <span class="problem-solved-count">${solvedCountFormatted} solved</span>
                <span class="problem-rating ${p.difficulty}" title="${isLC ? 'Acceptance Rate' : 'CF Rating'}">${p.rating}</span>
                ${isLC ? `
                <button class="statement-btn${isStatementOpen ? ' active' : ''}"
                        onclick="toggleStatement(event, '${p.contestId}', '${safeIndex}')"
                        title="Read Problem Statement & Hints Inline">
                    📖
                </button>` : ''}
                <button class="ai-explain-btn${hasAI ? ' has-explanation' : ''}"
                        onclick="toggleAIPanel(event, '${p.contestId}', '${safeIndex}')"
                        title="AI Explain + Solution in Your Style">
                    🤖
                </button>
                <button class="auto-solve-btn"
                        id="autosolve-btn-${key}"
                        onclick="autoSolveProblem(event, '${p.contestId}', '${safeIndex}')"
                        title="1-Click Auto-Solve (Generates C++ in your style, checks compile, copies & opens)">
                    ⚡
                </button>
                <button class="code-toggle-btn${hasCode ? ' has-code' : ''}"
                        onclick="toggleEditor(event, '${p.contestId}', '${safeIndex}')"
                        title="${hasCode ? 'Edit saved code' : 'Write code'}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                </button>
                <a class="problem-link" href="${p.url}" target="_blank" rel="noopener" title="${linkTitle}" onclick="event.stopPropagation()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.problem-checkbox') &&
                !e.target.closest('.problem-link') &&
                !e.target.closest('.code-toggle-btn') &&
                !e.target.closest('.ai-explain-btn') &&
                !e.target.closest('.auto-solve-btn') &&
                !e.target.closest('.statement-btn') &&
                !e.target.closest('.day-jump-pill')) {
                window.open(p.url, '_blank');
            }
        });

        wrapper.appendChild(card);

        // 1. Inline LeetCode Problem Statement Panel
        if (isLC && isStatementOpen) {
            const stmtPanel = document.createElement('div');
            stmtPanel.className = 'statement-panel open';
            stmtPanel.id = `stmt-panel-${key}`;
            const cachedStmt = statementCache[p.index];

            stmtPanel.innerHTML = `
                <div class="statement-panel-inner">
                    <div class="statement-header">
                        <div class="statement-title">
                            <span>📖</span> ${displayId}. ${escapeHtml(p.name)}
                            ${cachedStmt ? `<span style="font-size:12px;color:var(--text-muted);font-weight:500;">👍 ${formatNumber(cachedStmt.likes || 0)}</span>` : ''}
                        </div>
                        <div class="ai-panel-actions">
                            <button class="ai-btn-action" onclick="loadStarterIntoEditor('${p.contestId}', '${safeIndex}')">📥 Load C++ Starter to Editor</button>
                        </div>
                    </div>
                    <div class="statement-body" id="stmt-body-${key}">
                        ${cachedStmt ? renderStatementBody(cachedStmt) : '<div class="ai-loading"><div class="ai-loading-dots"><span></span><span></span><span></span></div> Fetching official LeetCode statement & starter code...</div>'}
                    </div>
                </div>
            `;
            wrapper.appendChild(stmtPanel);

            if (!cachedStmt) {
                requestAnimationFrame(async () => {
                    const data = await fetchLCProblemDetails(p.index);
                    const bodyEl = document.getElementById(`stmt-body-${key}`);
                    if (bodyEl) {
                        bodyEl.innerHTML = data
                            ? renderStatementBody(data)
                            : '<div class="ai-error">Could not load problem statement.</div>';
                    }
                });
            }
        }

        // 2. AI Panel
        if (isAIOpen) {
            const aiPanel = document.createElement('div');
            aiPanel.className = 'ai-panel open';
            aiPanel.id = `ai-panel-${key}`;

            const cachedHTML = aiCache[key];
            const isCurrentlyStreaming = aiStreaming[key];
            const modelLabel = p.difficulty === 'easy'
                ? getEasyModel()
                : (p.difficulty === 'medium' ? getMediumModel() : getHardModel());

            aiPanel.innerHTML = `
                <div class="ai-panel-inner">
                    <div class="ai-panel-header">
                        <div class="ai-panel-title"><span>🤖</span> ${modelLabel} — ${displayId} ${escapeHtml(p.name)}</div>
                        <div class="ai-panel-actions">
                            <button class="ai-btn-action" onclick="copyAIContent('${key}')">📋 Copy</button>
                            <button class="ai-btn-action primary${isCurrentlyStreaming ? ' loading' : ''}"
                                    onclick="requestAIExplanation('${p.contestId}', '${safeIndex}', true, false)">
                                ${isCurrentlyStreaming ? '⏳ Thinking...' : '🔄 Regenerate'}
                            </button>
                        </div>
                    </div>
                    <div class="ai-content${isCurrentlyStreaming ? ' streaming' : ''}" id="ai-content-${key}">
                        ${cachedHTML || '<div class="ai-loading"><div class="ai-loading-dots"><span></span><span></span><span></span></div> Generating explanation & solution in your C++ style...</div>'}
                    </div>
                </div>
            `;

            wrapper.appendChild(aiPanel);

            if (!cachedHTML && !isCurrentlyStreaming) {
                requestAnimationFrame(() => requestAIExplanation(p.contestId, p.index, false, false));
            }
        }

        // 3. Code Editor Panel
        if (isEditorOpen) {
            const editorPanel = document.createElement('div');
            editorPanel.className = 'code-editor-panel open';
            editorPanel.id = `editor-${key}`;

            const cachedData = codeCache[key] || {};
            const lang = cachedData.language || 'cpp';
            const code = cachedData.code || '';
            const savedAt = cachedData.savedAt;
            const isUnsaved = unsavedChanges[key];

            editorPanel.innerHTML = `
                <div class="editor-toolbar">
                    <div class="editor-toolbar-left">
                        <select class="lang-select" id="lang-${key}" onchange="onLangChange('${key}', '${p.contestId}', '${safeIndex}')">
                            ${LANGUAGES.map(l => `<option value="${l.value}"${l.value === lang ? ' selected' : ''}>${l.label}</option>`).join('')}
                        </select>
                        <span class="editor-label">${displayId} - ${escapeHtml(p.name)}</span>
                    </div>
                    <div class="editor-toolbar-right">
                        ${savedAt ? `<span class="editor-saved-time">Last saved: ${formatSavedTime(savedAt)}</span>` : ''}
                        ${code.trim() ? `<span class="save-status ${isUnsaved ? 'unsaved' : 'saved'}">${isUnsaved ? 'Unsaved' : 'Saved'}</span>` : ''}
                    </div>
                </div>
                <textarea class="code-textarea" id="code-${key}"
                          placeholder="${escapeHtml(placeholders[lang] || '// Write your solution here...')}"
                          spellcheck="false" oninput="markUnsaved('${key}')">${escapeHtml(code)}</textarea>
                <div class="compile-output-box" id="compile-box-${key}"></div>
                <div class="editor-actions">
                    <div class="editor-actions-left">
                        <button class="btn-save" id="save-btn-${key}" onclick="saveCode('${p.contestId}', '${safeIndex}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                            Save (Ctrl+S)
                        </button>
                        <button class="btn-compile-check" id="compile-btn-${key}" onclick="compileCheckCode('${p.contestId}', '${safeIndex}')" title="Verify C++ syntax & types using local g++ compiler">
                            🔨 Check C++
                        </button>
                        <button class="btn-submit-cf" id="submit-cf-btn-${key}" onclick="submitSolution('${p.contestId}', '${safeIndex}')">
                            ${submitLabel}
                        </button>
                        ${code.trim() ? `<button class="btn-delete-code" onclick="deleteCode('${p.contestId}', '${safeIndex}')">Clear</button>` : ''}
                    </div>
                    <span class="editor-saved-time" id="status-${key}"></span>
                </div>
            `;

            wrapper.appendChild(editorPanel);
            requestAnimationFrame(() => setupTabSupport(`code-${key}`));
        }

        container.appendChild(wrapper);
    });
}

// ========================
// LeetCode Statement & Starter Fetcher
// ========================

async function fetchLCProblemDetails(slug) {
    if (!slug) return null;
    if (statementCache[slug]) return statementCache[slug];
    try {
        const res = await fetch(`/api/lc-problem?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
            const data = await res.json();
            statementCache[slug] = data;
            return data;
        }
    } catch (e) {
        console.warn('Failed to fetch LC problem details:', e);
    }
    return null;
}

function renderStatementBody(data) {
    let html = data.content || '<p>No statement content available.</p>';
    if (data.hints && data.hints.length > 0) {
        html += `<div class="statement-hints">`;
        data.hints.forEach((h, i) => {
            html += `<details class="statement-hint-item"><summary>💡 Hint ${i + 1}</summary><div style="margin-top:6px;">${h}</div></details>`;
        });
        html += `</div>`;
    }
    return html;
}

function toggleStatement(event, contestId, index) {
    event.stopPropagation();
    const key = `${contestId}_${index}`;
    if (openStatements[key]) {
        delete openStatements[key];
    } else {
        openStatements[key] = true;
    }
    renderCurrentView();
}

async function loadStarterIntoEditor(contestId, index) {
    const key = `${contestId}_${index}`;
    const data = await fetchLCProblemDetails(index);
    if (!data || !data.cppSnippet) return;

    openEditors[key] = true;
    if (!codeCache[key] || !codeCache[key].code?.trim()) {
        codeCache[key] = {
            code: data.cppSnippet,
            language: 'cpp',
            savedAt: null,
            hasCode: true
        };
        unsavedChanges[key] = true;
    }
    renderCurrentView();
}

// ========================
// AI Explanation & Fast Auto-Solve
// ========================

async function autoSolveProblem(event, contestId, index) {
    event.stopPropagation();
    const key = `${contestId}_${index}`;
    const btn = event.currentTarget;

    if (btn.classList.contains('loading')) return;

    const mode = getAutoSolveMode(); // 'fast' | 'full'

    // If code doesn't exist yet, generate it
    if (!codeCache[key] || !codeCache[key].code?.trim()) {
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '⏳';
        btn.classList.add('loading');

        if (mode === 'full') {
            openAIPanels[key] = true;
            renderCurrentView();
            await new Promise(r => setTimeout(r, 40));
            await requestAIExplanation(contestId, index, false, false);
        } else {
            // Fast Code-Only generation + automatic save + compile check
            openEditors[key] = true;
            renderCurrentView();
            await new Promise(r => setTimeout(r, 40));
            await requestAIExplanation(contestId, index, false, true);
        }

        btn.innerHTML = oldHtml;
        btn.classList.remove('loading');
    }

    if (codeCache[key] && codeCache[key].code?.trim()) {
        // Automatically save & compile-check before copying & opening
        await saveCode(contestId, index, true);
        await compileCheckCode(contestId, index, true);
        await submitSolution(contestId, index, btn);
    } else {
        openAIPanels[key] = true;
        renderCurrentView();
    }
}

let lastAIError = '';

async function batchGenerateDay() {
    if (batchRunning || !scheduleData) return;
    const dayData = scheduleData.schedule[currentDay - 1];
    if (!dayData) return;

    const btn = document.getElementById('btn-batch-day');
    const targets = dayData.problems.filter(p => {
        const key = `${p.contestId}_${p.index}`;
        return !codeCache[key]?.code?.trim();
    });

    if (targets.length === 0) {
        alert('All 10 problems on this day already have generated/saved C++ solutions!');
        return;
    }

    batchRunning = true;
    const origText = btn ? btn.innerHTML : '⚡ Auto-Generate Day\'s Solutions';
    let solvedCount = 0;

    for (let i = 0; i < targets.length; i++) {
        const p = targets[i];
        const key = `${p.contestId}_${p.index}`;
        const displayId = formatProblemDisplayId(p);

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `⏳ Solving ${i + 1}/${targets.length} (${solvedCount} saved): ${displayId}...`;
        }

        const rowBtn = document.getElementById(`autosolve-btn-${key}`);
        if (rowBtn) {
            rowBtn.innerHTML = '⏳';
            rowBtn.classList.add('loading');
        }

        let ok = await requestAIExplanation(p.contestId, p.index, true, true);
        if (!ok || !codeCache[key]?.code?.trim()) {
            await new Promise(r => setTimeout(r, 1500));
            ok = await requestAIExplanation(p.contestId, p.index, true, true);
        }

        if (codeCache[key]?.code?.trim()) {
            await saveCode(p.contestId, p.index, true);
            solvedCount++;
        }

        renderCurrentView();

        if (i + 1 < targets.length) {
            await new Promise(r => setTimeout(r, 900));
        }
    }

    batchRunning = false;
    if (btn) {
        btn.disabled = false;
        if (solvedCount === targets.length) {
            btn.innerHTML = `✅ Solved All (${solvedCount}/${targets.length})!`;
        } else if (solvedCount > 0) {
            btn.innerHTML = `⚠️ Solved ${solvedCount}/${targets.length} (Click to retry rest)`;
        } else {
            btn.innerHTML = `❌ Solved 0/${targets.length}`;
            if (lastAIError) {
                alert(`Could not generate solutions:\n${lastAIError}`);
            }
        }
        setTimeout(() => { btn.innerHTML = origText; }, 5000);
    }
}

function toggleAIPanel(event, contestId, index) {
    event.stopPropagation();
    const key = `${contestId}_${index}`;

    if (openAIPanels[key]) {
        delete openAIPanels[key];
    } else {
        openAIPanels[key] = true;
    }
    renderCurrentView();
}

async function requestAIExplanation(contestId, index, regenerate, fastCodeOnly = false) {
    const key = `${contestId}_${index}`;

    if (aiStreaming[key]) return false;
    if (!fastCodeOnly && aiCache[key] && !regenerate) return true;

    aiStreaming[key] = true;
    const contentEl = document.getElementById(`ai-content-${key}`);

    const problem = findProblemByKey(contestId, index);
    if (!problem) {
        if (contentEl) contentEl.innerHTML = '<div class="ai-error">Problem not found.</div>';
        delete aiStreaming[key];
        return false;
    }

    const diff = problem.difficulty;
    const modelToUse = diff === 'easy' ? getEasyModel() : (diff === 'medium' ? getMediumModel() : getHardModel());
    const isGemini = modelToUse.includes('gemini');

    const geminiKey = getGeminiKey();
    const groqKey = getGroqKey();

    if (!isGemini && !groqKey && !geminiKey) {
        lastAIError = 'No Groq or Gemini API key set in Settings.';
        if (contentEl) contentEl.innerHTML = '<div class="ai-error">⚠️ No API key set. Click ⚙️ Settings to enter your API key.</div>';
        else if (!batchRunning) alert('No API key set. Click ⚙️ Settings to enter your API key.');
        delete aiStreaming[key];
        return false;
    }
    if (isGemini && !geminiKey && !groqKey) {
        lastAIError = 'No Gemini or Groq API key set in Settings.';
        if (contentEl) contentEl.innerHTML = '<div class="ai-error">⚠️ No Gemini API key set. Click ⚙️ Settings to enter your API key.</div>';
        else if (!batchRunning) alert('No Gemini API key set. Click ⚙️ Settings to enter your API key.');
        delete aiStreaming[key];
        return false;
    }

    if (contentEl) {
        contentEl.className = 'ai-content streaming';
        contentEl.innerHTML = `<div class="ai-loading"><div class="ai-loading-dots"><span></span><span></span><span></span></div> ${modelToUse} is ${fastCodeOnly ? 'writing C++ solution' : 'analyzing problem'}...</div>`;
    }

    const statusEl = document.getElementById(`status-${key}`);
    if (statusEl && fastCodeOnly) {
        statusEl.textContent = `⏳ Generating C++ via ${modelToUse}...`;
    }

    // Fetch exact LeetCode problem statement & C++ starter code so the AI has 100% ground-truth context!
    let lcDetails = null;
    if (currentPlatform === 'leetcode') {
        lcDetails = await fetchLCProblemDetails(problem.index);
    }

    const plainStatement = lcDetails?.content
        ? lcDetails.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 6000)
        : '';
    const cppStarter = lcDetails?.cppSnippet || '';

    let userPrompt = '';
    let systemPrompt = '';

    if (currentPlatform === 'leetcode') {
        systemPrompt = fastCodeOnly ? AI_FAST_CODE_PROMPT_LC : AI_SYSTEM_PROMPT_LC;
        userPrompt = `${fastCodeOnly ? 'Write the complete optimal C++ solution for this LeetCode problem strictly in my coding style:' : 'Analyze and solve this LeetCode problem in detail:'}

**Problem:** #${problem.contestId} - ${problem.name}
**Difficulty:** ${problem.difficulty.toUpperCase()} (Acceptance: ${problem.rating})
**Tags:** ${(problem.tags || []).join(', ')}
**URL:** ${problem.url}
${plainStatement ? `\n**Official Problem Description & Constraints:**\n${plainStatement}\n` : ''}
${cppStarter ? `\n**Exact Required C++ Starter Signature (MUST match this class & method signature):**\n\`\`\`cpp\n${cppStarter}\n\`\`\`\n` : ''}`;
    } else {
        systemPrompt = fastCodeOnly ? AI_FAST_CODE_PROMPT_CF : AI_SYSTEM_PROMPT_CF;
        userPrompt = `${fastCodeOnly ? 'First recall the exact Codeforces problem statement and I/O format, then write the complete, optimal C++ solution strictly in my coding style:' : 'Analyze and explain this Codeforces problem in detail:'}

**Problem:** Codeforces ${problem.contestId}${problem.index} - "${problem.name}" (Contest ${problem.contestId}, Problem ${problem.index})
**Rating:** ${problem.rating} (${problem.difficulty})
**Tags:** ${(problem.tags || []).join(', ')}
**URL:** ${problem.url}
**Solved by:** ${(problem.solvedCount || 0).toLocaleString()} users on Codeforces`;
    }

    let success = false;
    try {
        let fullText = '';
        if (isGemini && geminiKey) {
            try {
                fullText = await streamGemini(geminiKey, modelToUse, systemPrompt, userPrompt, contentEl);
            } catch (gemErr) {
                console.warn('Gemini call failed, falling back to Groq:', gemErr.message);
                if (groqKey) {
                    fullText = await streamGroq(groqKey, getEasyModel(), systemPrompt, userPrompt, contentEl);
                } else {
                    throw gemErr;
                }
            }
        } else if (groqKey) {
            fullText = await streamGroq(groqKey, modelToUse.includes('gemini') ? getEasyModel() : modelToUse, systemPrompt, userPrompt, contentEl);
        } else if (geminiKey) {
            fullText = await streamGemini(geminiKey, modelToUse, systemPrompt, userPrompt, contentEl);
        }

        if (contentEl) {
            contentEl.innerHTML = renderMarkdown(fullText);
            contentEl.className = 'ai-content';
        }
        if (!fastCodeOnly && fullText.trim()) {
            aiCache[key] = renderMarkdown(fullText);
            try {
                const prefix = getStoragePrefix();
                const cacheKeys = Object.keys(aiCache);
                if (cacheKeys.length > 50) {
                    cacheKeys.slice(0, cacheKeys.length - 50).forEach(k => delete aiCache[k]);
                }
                localStorage.setItem(`${prefix}-ai-cache`, JSON.stringify(aiCache));
            } catch (e) {}
        }

        // Extract C++ code block reliably (never match pseudocode blocks!)
        let extractedCode = extractCppCodeBlock(fullText);

        if (extractedCode) {
            codeCache[key] = {
                ...(codeCache[key] || {}),
                code: extractedCode,
                language: 'cpp',
                hasCode: true
            };
            unsavedChanges[key] = true;
            success = true;

            const codeEl = document.getElementById(`code-${key}`);
            if (codeEl) {
                codeEl.value = extractedCode;
                markUnsaved(key);
            }
        } else {
            lastAIError = 'AI returned response without a recognizable C++ code block.';
        }
    } catch (err) {
        lastAIError = err.message || 'AI request failed';
        if (contentEl) {
            contentEl.innerHTML = `<div class="ai-error">❌ ${escapeHtml(err.message)}</div>`;
            contentEl.className = 'ai-content';
        } else {
            console.error('AI generation error:', err);
        }
    }

    delete aiStreaming[key];
    return success;
}

// ---- Reliable C++ Code Block Extractor ----
function extractCppCodeBlock(fullText) {
    if (!fullText) return '';

    // 1. Match explicit ```cpp / ```c++ / ```c blocks (never match plain ``` pseudocode blocks!)
    const cppFenceRegex = /```(?:cpp|c\+\+|c|C\+\+)[^\n]*\r?\n([\s\S]*?)```/g;
    const cppBlocks = [];
    let m;
    while ((m = cppFenceRegex.exec(fullText)) !== null) {
        if (m[1] && m[1].trim()) {
            cppBlocks.push(m[1].trim());
        }
    }
    if (cppBlocks.length > 0) {
        const fullSolution = cppBlocks.find(b => b.includes('#include') || b.includes('class Solution') || b.includes('int main'));
        return fullSolution || cppBlocks[cppBlocks.length - 1];
    }

    // 2. Fallback: Check any fenced block that clearly contains C++ code (#include, class Solution, int main)
    const anyFenceRegex = /```[^\n]*\r?\n([\s\S]*?)```/g;
    while ((m = anyFenceRegex.exec(fullText)) !== null) {
        const candidate = (m[1] || '').trim();
        if (candidate.includes('#include') || candidate.includes('class Solution') || candidate.includes('int main')) {
            return candidate;
        }
    }

    // 3. Fallback: Unclosed ```cpp fence or raw C++ output containing #include / class Solution
    const startIdx = fullText.indexOf('#include') !== -1
        ? fullText.indexOf('#include')
        : fullText.indexOf('class Solution');
    if (startIdx !== -1) {
        const lastBrace = fullText.lastIndexOf('}');
        if (lastBrace > startIdx) {
            let slice = fullText.slice(startIdx, lastBrace + 1).trim();
            if (fullText.slice(lastBrace + 1, lastBrace + 5).startsWith(';')) {
                slice += ';';
            }
            return slice.replace(/```$/g, '').trim();
        }
    }

    return '';
}

// ---- Gemini Streaming ----
async function streamGemini(apiKey, model, systemPrompt, prompt, contentEl) {
    let response = null;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
        if (retryCount > 0) {
            if (contentEl) {
                contentEl.innerHTML = `<div class="ai-loading"><div class="ai-loading-dots"><span></span><span></span><span></span></div> ${model} overloaded, retrying (${retryCount}/${maxRetries})...</div>`;
            }
            await new Promise(r => setTimeout(r, 2000 * retryCount));
        }

        response = await fetch(
            `${GEMINI_API_BASE}/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
                }),
            }
        );

        if (response.status === 503) {
            retryCount++;
            continue;
        }
        break;
    }

    if (!response.ok) {
        const errText = await response.text();
        let errMsg = `API Error ${response.status}`;
        try { errMsg = JSON.parse(errText).error?.message || errMsg; } catch {}
        throw new Error(errMsg);
    }

    return await parseSSEStream(response, contentEl, 'gemini');
}

// ---- Groq Streaming with Multi-Model Fallback ----
async function streamGroq(apiKey, model, systemPrompt, prompt, contentEl) {
    const groqChain = [...new Set([
        model || GROQ_MODEL_EASY,
        'openai/gpt-oss-120b',
        'qwen/qwen3.6-27b',
        'llama-3.3-70b-versatile'
    ])];

    let lastErr = null;

    for (let mIdx = 0; mIdx < groqChain.length; mIdx++) {
        const curModel = groqChain[mIdx];
        let retryCount = 0;
        const maxRetries = 1;

        while (retryCount <= maxRetries) {
            if (retryCount > 0) {
                await new Promise(r => setTimeout(r, 2000 * retryCount));
            }

            try {
                const response = await fetch(GROQ_API_BASE, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: curModel,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: prompt },
                        ],
                        temperature: 0.3,
                        max_tokens: 8192,
                        stream: true,
                    }),
                });

                if (response.status === 429 || response.status === 503) {
                    const errText = await response.text();
                    let errMsg = `Groq ${curModel} HTTP ${response.status}`;
                    try { errMsg = JSON.parse(errText).error?.message || errMsg; } catch {}
                    lastErr = new Error(errMsg);
                    break; // Try next model in groqChain
                }

                if (!response.ok) {
                    const errText = await response.text();
                    let errMsg = `Groq ${curModel} Error ${response.status}`;
                    try { errMsg = JSON.parse(errText).error?.message || errMsg; } catch {}
                    lastErr = new Error(errMsg);
                    break;
                }

                const text = await parseSSEStream(response, contentEl, 'groq');
                if (text && text.trim()) {
                    return text;
                }
                lastErr = new Error(`Empty response from Groq ${curModel}`);
                break;
            } catch (netErr) {
                lastErr = netErr;
                retryCount++;
            }
        }
    }

    throw lastErr || new Error('All Groq models failed');
}

async function parseSSEStream(response, contentEl, provider) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    const processLine = (line) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) return;
        const data = trimmed.slice(5).trim();
        if (!data || data === '[DONE]') return;

        try {
            const parsed = JSON.parse(data);
            let text = '';

            if (provider === 'gemini') {
                const parts = parsed.candidates?.[0]?.content?.parts || [];
                for (const part of parts) {
                    if (!part.thought && part.text) {
                        text += part.text;
                    }
                }
            } else {
                text = parsed.choices?.[0]?.delta?.content || '';
            }

            if (text) {
                fullText += text;
                if (contentEl) {
                    contentEl.innerHTML = renderMarkdown(fullText) + '<span class="ai-cursor"></span>';
                    contentEl.scrollTop = contentEl.scrollHeight;
                }
            }
        } catch (e) {}
    };

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            buffer += decoder.decode();
            if (buffer.trim()) {
                for (const line of buffer.split('\n')) {
                    processLine(line);
                }
            }
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            processLine(line);
        }
    }

    return fullText;
}

function copyAIContent(key) {
    const el = document.getElementById(`ai-content-${key}`);
    if (!el) return;
    navigator.clipboard.writeText(el.innerText).then(() => {
        const btn = el.closest('.ai-panel-inner')?.querySelector('.ai-btn-action:not(.primary)');
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '✅ Copied!';
            setTimeout(() => btn.innerHTML = orig, 1500);
        }
    });
}

// ========================
// Markdown Renderer
// ========================

function renderMarkdown(text) {
    if (!text) return '';
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
    });
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^[\s]*[-*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^(?!<[hupob]|<li|<hr|<pre|<blockquote)(.+)$/gm, '<p>$1</p>');
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/\n{2,}/g, '\n');

    return html;
}

// ========================
// Code Editor & Local C++ Compiler
// ========================

async function toggleEditor(event, contestId, index) {
    event.stopPropagation();
    const key = `${contestId}_${index}`;

    if (openEditors[key]) {
        delete openEditors[key];
    } else {
        openEditors[key] = true;
        if (!codeCache[key] || !codeCache[key].code) {
            await loadCodeFromServer(contestId, index);
        }
        // If LeetCode problem has no saved code yet, auto-populate official C++ starter template!
        if (currentPlatform === 'leetcode' && (!codeCache[key] || !codeCache[key].code?.trim())) {
            const lcData = await fetchLCProblemDetails(index);
            if (lcData && lcData.cppSnippet) {
                codeCache[key] = {
                    code: lcData.cppSnippet,
                    language: 'cpp',
                    savedAt: null,
                    hasCode: false
                };
            }
        }
    }
    renderCurrentView();

    if (openEditors[key]) {
        requestAnimationFrame(() => {
            const textarea = document.getElementById(`code-${key}`);
            if (textarea) { textarea.focus(); setupTabSupport(`code-${key}`); }
        });
    }
}

async function loadCodeFromServer(contestId, index) {
    const key = `${contestId}_${index}`;
    try {
        const res = await fetch(`/api/load-code?platform=${currentPlatform}&contestId=${encodeURIComponent(contestId)}&index=${encodeURIComponent(index)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.code && data.code.trim()) {
                codeCache[key] = { ...data, hasCode: true };
                return;
            }
        }
    } catch (e) {}

    const localData = localStorage.getItem(`${getStoragePrefix()}-code-${key}`);
    codeCache[key] = localData ? JSON.parse(localData) : { code: '', language: 'cpp', savedAt: null };
}

async function saveCode(contestId, index, silent = false) {
    const key = `${contestId}_${index}`;
    const textarea = document.getElementById(`code-${key}`);
    const langSelect = document.getElementById(`lang-${key}`);
    const saveBtn = document.getElementById(`save-btn-${key}`);

    const code = textarea ? textarea.value : (codeCache[key]?.code || '');
    const language = langSelect?.value || codeCache[key]?.language || 'cpp';
    if (!code.trim()) return;

    if (saveBtn) saveBtn.classList.add('saving');

    const payload = {
        platform: currentPlatform,
        contestId,
        index,
        code,
        language
    };

    try {
        const res = await fetch('/api/save-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            codeCache[key] = { code, language, savedAt: new Date().toISOString(), hasCode: !!code.trim() };
            delete unsavedChanges[key];
            localStorage.setItem(`${getStoragePrefix()}-code-${key}`, JSON.stringify(codeCache[key]));
        }
    } catch (e) {
        codeCache[key] = { code, language, savedAt: new Date().toISOString(), hasCode: !!code.trim() };
        delete unsavedChanges[key];
        localStorage.setItem(`${getStoragePrefix()}-code-${key}`, JSON.stringify(codeCache[key]));
    }

    if (saveBtn) saveBtn.classList.remove('saving');
    if (!silent) renderCurrentView();
}

async function compileCheckCode(contestId, index, silentOnSuccess = false) {
    const key = `${contestId}_${index}`;
    const textarea = document.getElementById(`code-${key}`);
    const code = textarea ? textarea.value : (codeCache[key]?.code || '');
    const box = document.getElementById(`compile-box-${key}`);
    const btn = document.getElementById(`compile-btn-${key}`);

    if (!code.trim()) return false;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Checking...';
    }

    try {
        const res = await fetch('/api/compile-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, platform: currentPlatform }),
        });
        const data = await res.json();
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = data.success ? '✅ Compiled OK' : '❌ Compile Error';
            setTimeout(() => { if (btn) btn.innerHTML = '🔨 Check C++'; }, 3000);
        }
        if (box) {
            if (data.success) {
                box.className = 'compile-output-box ok';
                box.textContent = `✓ Local g++ check passed: ${data.message}`;
                if (silentOnSuccess) {
                    setTimeout(() => { box.className = 'compile-output-box'; }, 4000);
                }
            } else {
                box.className = 'compile-output-box err';
                box.textContent = `✗ Compiler errors:\n${data.error}`;
            }
        }
        return !!data.success;
    } catch (e) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '🔨 Check C++';
        }
        return false;
    }
}

async function deleteCode(contestId, index) {
    const key = `${contestId}_${index}`;
    if (!confirm('Clear your saved code for this problem?')) return;
    try {
        await fetch('/api/delete-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform: currentPlatform, contestId, index })
        });
    } catch (e) {}
    delete codeCache[key];
    delete unsavedChanges[key];
    localStorage.removeItem(`${getStoragePrefix()}-code-${key}`);
    renderCurrentView();
}

function markUnsaved(key) {
    unsavedChanges[key] = true;
    const toolbar = document.querySelector(`#editor-${key} .editor-toolbar-right`);
    if (toolbar) {
        let badge = toolbar.querySelector('.save-status');
        if (badge) { badge.className = 'save-status unsaved'; badge.textContent = 'Unsaved'; }
        else { badge = document.createElement('span'); badge.className = 'save-status unsaved'; badge.textContent = 'Unsaved'; toolbar.appendChild(badge); }
    }
}

async function onLangChange(key, contestId, index) {
    const langSelect = document.getElementById(`lang-${key}`);
    const textarea = document.getElementById(`code-${key}`);
    if (!langSelect || !textarea) return;
    const lang = langSelect.value;

    if (currentPlatform === 'leetcode') {
        const lcData = await fetchLCProblemDetails(index);
        if (lcData?.snippets?.[lang] && (!unsavedChanges[key] || !textarea.value.trim())) {
            textarea.value = lcData.snippets[lang];
        }
    }
    const placeholders = currentPlatform === 'leetcode' ? PLACEHOLDERS_LC : PLACEHOLDERS_CF;
    if (!textarea.value.trim()) textarea.placeholder = placeholders[lang] || '// Write your solution here...';
    markUnsaved(key);
}

function setupTabSupport(textareaId) {
    const textarea = document.getElementById(textareaId);
    if (!textarea || textarea._tabSetup) return;
    textarea._tabSetup = true;

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textarea.selectionStart, end = textarea.selectionEnd;
            if (e.shiftKey) {
                const before = textarea.value.substring(0, start);
                const lineStart = before.lastIndexOf('\n') + 1;
                if (textarea.value.substring(lineStart, lineStart + 4) === '    ') {
                    textarea.value = textarea.value.substring(0, lineStart) + textarea.value.substring(lineStart + 4);
                    textarea.selectionStart = textarea.selectionEnd = Math.max(start - 4, lineStart);
                }
            } else {
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }
            markUnsaved(textareaId.replace('code-', ''));
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const key = textareaId.replace('code-', '');
            const sep = key.indexOf('_');
            if (sep > 0) saveCode(key.slice(0, sep), key.slice(sep + 1));
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const before = textarea.value.substring(0, start);
            const indent = before.split('\n').pop().match(/^\s*/)[0];
            const lastChar = before.trimEnd().slice(-1);
            const extra = (lastChar === '{' || lastChar === ':') ? '    ' : '';
            textarea.value = before + '\n' + indent + extra + textarea.value.substring(textarea.selectionEnd);
            textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length + extra.length;
            markUnsaved(textareaId.replace('code-', ''));
        }
    });
}

// ========================
// Problem Solving & Navigation
// ========================

function toggleSolved(event, contestId, index) {
    event.stopPropagation();
    const key = `${contestId}_${index}`;
    if (solvedProblems[key]) delete solvedProblems[key];
    else solvedProblems[key] = true;
    saveState();
    renderCurrentView();
    updateStreakBadge();
}

function isProblemSolved(p) {
    return !!solvedProblems[`${p.contestId}_${p.index}`];
}

function getTotalDays() {
    return scheduleData?.metadata?.totalDays || scheduleData?.schedule?.length || 300;
}

function navigateDay(delta) {
    const maxDays = getTotalDays();
    const newDay = currentDay + delta;
    if (newDay >= 1 && newDay <= maxDays) {
        currentDay = newDay;
        openStatements = {};
        openEditors = {};
        openAIPanels = {};
        saveState();
        renderDailyView();
    }
}

function jumpToDay() {
    const maxDays = getTotalDays();
    const input = document.getElementById('day-input');
    const day = parseInt(input.value);
    if (day >= 1 && day <= maxDays) {
        currentDay = day;
        openStatements = {};
        openEditors = {};
        openAIPanels = {};
        saveState();
        renderDailyView();
    }
}

function jumpToSpecificDay(event, day) {
    event.stopPropagation();
    currentDay = day;
    openStatements = {};
    openEditors = {};
    openAIPanels = {};
    saveState();
    switchView('daily');
}

// ========================
// Search View
// ========================

function renderSearchView() {
    if (!scheduleData) return;
    const query = (document.getElementById('global-search-input')?.value || '').trim().toLowerCase();
    const diffFilter = document.getElementById('search-diff-filter')?.value || 'all';
    const statusFilter = document.getElementById('search-status-filter')?.value || 'all';

    const matches = allProblemsFlat.filter(p => {
        if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
        const solved = isProblemSolved(p);
        const key = `${p.contestId}_${p.index}`;
        const hasCode = !!(codeCache[key]?.hasCode || codeCache[key]?.code?.trim());

        if (statusFilter === 'solved' && !solved) return false;
        if (statusFilter === 'unsolved' && solved) return false;
        if (statusFilter === 'has-code' && !hasCode) return false;

        if (!query) return true;
        const idStr = String(p.contestId).toLowerCase();
        const idxStr = String(p.index).toLowerCase();
        const nameStr = p.name.toLowerCase();
        const tagMatch = (p.tags || []).some(t => t.toLowerCase().includes(query));
        return idStr === query.replace(/^#/, '') ||
               idStr.includes(query) ||
               idxStr.includes(query) ||
               nameStr.includes(query) ||
               tagMatch;
    });

    const metaEl = document.getElementById('search-results-meta');
    const shown = matches.slice(0, 60);
    if (metaEl) {
        metaEl.textContent = `Found ${matches.length.toLocaleString()} matching problems (showing top ${shown.length})`;
    }

    renderProblemCards('search-results-container', shown, true);
}

// ========================
// Calendar View
// ========================

function renderCalendarView() {
    if (!scheduleData) return;
    const container = document.getElementById('calendar-phases');
    container.innerHTML = '';

    const phases = {};
    scheduleData.schedule.forEach(day => {
        if (!phases[day.phase]) phases[day.phase] = { phaseNum: day.phaseNum, topics: {} };
        if (!phases[day.phase].topics[day.topic]) phases[day.phase].topics[day.topic] = [];
        phases[day.phase].topics[day.topic].push(day);
    });

    Object.keys(phases).sort((a, b) => phases[a].phaseNum - phases[b].phaseNum).forEach(phaseName => {
        const phase = phases[phaseName];
        const phaseEl = document.createElement('div');
        phaseEl.className = 'calendar-phase';

        let phaseDays = 0, phaseComplete = 0;
        Object.values(phase.topics).forEach(days => days.forEach(d => {
            phaseDays++;
            if (d.problems.filter(p => isProblemSolved(p)).length === d.problems.length) phaseComplete++;
        }));

        phaseEl.innerHTML = `<div class="calendar-phase-header"><div class="calendar-phase-name">Phase ${phase.phaseNum}: ${phaseName}</div><div class="calendar-phase-info">${phaseComplete}/${phaseDays} days complete</div></div>`;

        Object.entries(phase.topics).forEach(([topicName, topicDays]) => {
            const topicGroup = document.createElement('div');
            topicGroup.className = 'calendar-topic-group';
            const topicLabel = document.createElement('div');
            topicLabel.className = 'calendar-topic-name';
            topicLabel.textContent = topicName;
            topicGroup.appendChild(topicLabel);

            const daysRow = document.createElement('div');
            daysRow.className = 'calendar-days';
            topicDays.forEach(day => {
                const sc = day.problems.filter(p => isProblemSolved(p)).length;
                const t = day.problems.length;
                let status = 'none';
                if (sc === t && t > 0) status = 'complete';
                else if (sc > 0) status = 'partial';

                const dayEl = document.createElement('div');
                dayEl.className = `calendar-day ${status}${day.day === currentDay ? ' current' : ''}`;
                dayEl.textContent = day.day;
                dayEl.setAttribute('data-tooltip', `Day ${day.day}: ${sc}/${t} solved`);
                dayEl.onclick = () => { currentDay = day.day; openStatements = {}; openEditors = {}; openAIPanels = {}; saveState(); switchView('daily'); };
                daysRow.appendChild(dayEl);
            });
            topicGroup.appendChild(daysRow);
            phaseEl.appendChild(topicGroup);
        });
        container.appendChild(phaseEl);
    });
}

// ========================
// Topics View
// ========================

function renderTopicsView() {
    if (!scheduleData) return;
    const container = document.getElementById('topics-grid');
    container.innerHTML = '';

    const topics = {};
    scheduleData.schedule.forEach(day => {
        if (!topics[day.topic]) topics[day.topic] = { phase: day.phase, phaseNum: day.phaseNum, days: [], totalProblems: 0, solvedProblems: 0 };
        const t = topics[day.topic];
        t.days.push(day.day);
        day.problems.forEach(p => { t.totalProblems++; if (isProblemSolved(p)) t.solvedProblems++; });
    });

    Object.entries(topics).forEach(([name, data]) => {
        const pct = data.totalProblems > 0 ? (data.solvedProblems / data.totalProblems) * 100 : 0;
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.onclick = () => { currentDay = Math.min(...data.days); openStatements = {}; openEditors = {}; openAIPanels = {}; saveState(); switchView('daily'); };
        card.innerHTML = `
            <div class="topic-card-header"><div class="topic-name">${name}</div><div class="topic-phase-badge">Phase ${data.phaseNum}</div></div>
            <div class="topic-progress-bar"><div class="topic-progress-fill" style="width: ${pct}%"></div></div>
            <div class="topic-stats"><span><span class="topic-stat-value">${data.solvedProblems}</span> / ${data.totalProblems} solved</span><span><span class="topic-stat-value">${data.days.length}</span> days</span></div>
            <div class="topic-days-range">Days ${Math.min(...data.days)} - ${Math.max(...data.days)}</div>
        `;
        container.appendChild(card);
    });
}

// ========================
// Stats View
// ========================

function renderStatsView() {
    if (!scheduleData) return;
    const totalProblems = scheduleData.metadata.totalProblems;
    const totalDays = getTotalDays();
    const totalSolved = Object.keys(solvedProblems).length;

    let daysComplete = 0;
    scheduleData.schedule.forEach(day => { if (day.problems.filter(p => isProblemSolved(p)).length === day.problems.length) daysComplete++; });
    const { current: currentStreak, best: bestStreak } = calculateStreaks();

    document.getElementById('stat-total-solved').textContent = totalSolved;
    document.getElementById('stat-total-pct').textContent = `${((totalSolved / totalProblems) * 100).toFixed(1)}% of ${formatNumber(totalProblems)}`;
    document.getElementById('stat-days-complete').textContent = daysComplete;
    document.getElementById('stat-days-pct').textContent = `${((daysComplete / totalDays) * 100).toFixed(1)}% of ${totalDays}`;
    document.getElementById('stat-current-streak').textContent = currentStreak;
    document.getElementById('stat-best-streak').textContent = bestStreak;

    let es = 0, et = 0, ms = 0, mt = 0, hs = 0, ht = 0;
    scheduleData.schedule.forEach(day => day.problems.forEach(p => {
        const s = isProblemSolved(p);
        if (p.difficulty === 'easy') { et++; if (s) es++; }
        else if (p.difficulty === 'medium') { mt++; if (s) ms++; }
        else { ht++; if (s) hs++; }
    }));

    document.getElementById('bar-easy').style.width = `${et ? (es / et) * 100 : 0}%`;
    document.getElementById('bar-medium').style.width = `${mt ? (ms / mt) * 100 : 0}%`;
    document.getElementById('bar-hard').style.width = `${ht ? (hs / ht) * 100 : 0}%`;
    document.getElementById('val-easy').textContent = `${es}/${et}`;
    document.getElementById('val-medium').textContent = `${ms}/${mt}`;
    document.getElementById('val-hard').textContent = `${hs}/${ht}`;
    renderHeatmap();
}

function calculateStreaks() {
    if (!scheduleData) return { current: 0, best: 0 };
    const ds = scheduleData.schedule.map(d => d.problems.filter(p => isProblemSolved(p)).length > 0);
    let best = 0, s = 0;
    for (let i = 0; i < ds.length; i++) { if (ds[i]) { s++; best = Math.max(best, s); } else s = 0; }
    let cur = 0, last = -1;
    for (let i = ds.length - 1; i >= 0; i--) { if (ds[i]) { last = i; break; } }
    if (last >= 0) for (let i = last; i >= 0; i--) { if (ds[i]) cur++; else break; }
    return { current: cur, best };
}

function renderHeatmap() {
    const container = document.getElementById('heatmap-container');
    container.innerHTML = '';
    scheduleData.schedule.forEach(day => {
        const solved = day.problems.filter(p => isProblemSolved(p)).length;
        const total = day.problems.length;
        const pct = total > 0 ? solved / total : 0;
        let level = 0;
        if (pct > 0 && pct <= 0.2) level = 1;
        else if (pct <= 0.4) level = 2;
        else if (pct <= 0.6) level = 3;
        else if (pct < 1) level = 4;
        else if (pct === 1) level = 5;
        const cell = document.createElement('div');
        cell.className = `heatmap-cell level-${level}`;
        cell.setAttribute('data-tooltip', `Day ${day.day}: ${solved}/${total} — ${day.topic}`);
        cell.onclick = () => { currentDay = day.day; openStatements = {}; openEditors = {}; openAIPanels = {}; saveState(); switchView('daily'); };
        container.appendChild(cell);
    });
}

// ========================
// Theme & Utilities
// ========================

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light') {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('theme-icon-sun').style.display = 'block';
        document.getElementById('theme-icon-moon').style.display = 'none';
        localStorage.setItem('cf-daily-grind-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('theme-icon-sun').style.display = 'none';
        document.getElementById('theme-icon-moon').style.display = 'block';
        localStorage.setItem('cf-daily-grind-theme', 'light');
    }
}

function updateStreakBadge() {
    document.getElementById('streak-count').textContent = calculateStreaks().current;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatSavedTime(isoString) {
    if (!isoString) return '';
    try {
        const diff = Date.now() - new Date(isoString).getTime();
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(isoString).toLocaleDateString();
    } catch { return isoString; }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        switchView('search');
        return;
    }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.key === 'Escape') { closeSettings(); return; }
    switch (e.key) {
        case 'ArrowLeft': if (currentView === 'daily') navigateDay(-1); break;
        case 'ArrowRight': if (currentView === 'daily') navigateDay(1); break;
        case '1': switchView('daily'); break;
        case '2': switchView('calendar'); break;
        case '3': switchView('topics'); break;
        case '4': switchView('search'); break;
        case '5': switchView('stats'); break;
        case '/': e.preventDefault(); switchView('search'); break;
    }
});

window.addEventListener('beforeunload', (e) => {
    if (Object.keys(unsavedChanges).length > 0) { e.preventDefault(); e.returnValue = ''; }
});

window.onload = init;

// ========================
// Automated Submission (LeetCode & Codeforces)
// ========================

async function submitSolution(contestId, index, externalBtn = null) {
    const key = `${contestId}_${index}`;
    const codeEl = document.getElementById(`code-${key}`);
    const btn = externalBtn || document.getElementById(`submit-cf-btn-${key}`);

    let code = '';
    if (codeEl) {
        code = codeEl.value;
    } else if (codeCache[key] && codeCache[key].code) {
        code = codeCache[key].code;
    }

    if (!code || !code.trim()) {
        alert('Cannot submit empty code!');
        return;
    }

    if (codeEl) {
        await saveCode(contestId, index, true);
    }

    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '✅';
        btn.disabled = true;
    }

    // Copy to clipboard
    let copied = false;
    try {
        await navigator.clipboard.writeText(code);
        copied = true;
    } catch (err) {
        try {
            const ta = document.createElement('textarea');
            ta.value = code;
            ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            ta.setSelectionRange(0, code.length);
            copied = document.execCommand('copy');
            document.body.removeChild(ta);
        } catch (e2) {}
    }

    const targetUrl = currentPlatform === 'leetcode'
        ? `https://leetcode.com/problems/${index}/`
        : `https://codeforces.com/contest/${contestId}/submit/${index}`;

    const newTab = window.open(targetUrl, '_blank');
    if (!newTab || newTab.closed) {
        showSubmitBanner(targetUrl, copied);
    }

    setTimeout(() => {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }, 2000);
}

function showSubmitBanner(url, wasCopied) {
    const existing = document.getElementById('submit-banner');
    if (existing) existing.remove();

    const platName = currentPlatform === 'leetcode' ? 'LeetCode' : 'Codeforces';
    const banner = document.createElement('div');
    banner.id = 'submit-banner';
    banner.style.cssText = `
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 10000;
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border-top: 2px solid #f59e0b;
        padding: 16px 20px; display: flex; align-items: center;
        justify-content: space-between; gap: 12px;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.4);
    `;
    banner.innerHTML = `
        <div style="color: #fff; font-size: 14px;">
            ${wasCopied ? '✅ Solution copied to clipboard!' : '⚠️ Copy code manually.'} Open ${platName} to paste & submit →
        </div>
        <div style="display:flex; gap:8px;">
            <a href="${url}" target="_blank" rel="noopener"
               style="background:#f59e0b; color:#000; padding:8px 16px; border-radius:6px;
                      font-weight:600; text-decoration:none; font-size:14px; white-space:nowrap;">
                Open ${platName} ↗
            </a>
            <button onclick="this.parentElement.parentElement.remove()"
                    style="background:transparent; border:1px solid rgba(255,255,255,0.2);
                           color:#fff; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:14px;">
                ✕
            </button>
        </div>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 15000);
}
