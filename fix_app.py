lines = open('app.js', encoding='utf-8').read().splitlines()
with open('app.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines[:1169]))
    f.write('''

// ========================
// Codeforces Submission
// ========================

async function submitToCF(contestId, index) {
    const key = `${contestId}_${index}`;
    const codeEl = document.getElementById(`code-${key}`);
    const btn = document.getElementById(`submit-cf-btn-${key}`);
    
    if (!codeEl) return;
    
    const code = codeEl.value;
    if (!code.trim()) {
        alert("Cannot submit empty code!");
        return;
    }

    // Save before submit
    await saveCode(contestId, index);

    // Update UI temporarily
    const originalText = btn.innerHTML;
    btn.innerHTML = `✅ Copied!`;
    btn.disabled = true;

    try {
        // Copy to clipboard
        await navigator.clipboard.writeText(code);
        
        // Open CF Submit page in a new tab
        const cfUrl = `https://codeforces.com/contest/${contestId}/submit/${index}`;
        window.open(cfUrl, '_blank');
        
        // Reset button
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    } catch (err) {
        console.error("Clipboard copy failed:", err);
        alert("Failed to copy code. Please copy it manually.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
''')
