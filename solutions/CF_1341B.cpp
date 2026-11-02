#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int n, k;
        cin >> n >> k;
        int a[n];
        for (int i = 0; i < n; i++) cin >> a[i];
        int is_peak[n];
        for (int i = 0; i < n; i++) is_peak[i] = 0;
        for (int i = 1; i < n - 1; i++) if (a[i] > a[i - 1] && a[i] > a[i + 1]) is_peak[i] = 1;
        int pref[n];
        pref[0] = is_peak[0];
        for (int i = 1; i < n; i++) pref[i] = pref[i - 1] + is_peak[i];
        int max_peaks = -1;
        int best_l = 1;
        for (int l = 0; l <= n - k; l++) {
            int r = l + k - 1;
            int peaks = pref[r - 1] - pref[l];
            if (peaks > max_peaks) {
                max_peaks = peaks;
                best_l = l + 1;
            }
        }
        cout << max_peaks + 1 << " " << best_l << endl;
    }
    return 0;
}
