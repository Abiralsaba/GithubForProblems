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
        sort(a, a + n);
        int ans = 0;
        int l = 0;
        for (int r = 0; r < n; r++) {
            if (r > 0 && a[r] - a[r - 1] > 1) l = r;
            while (a[r] - a[l] >= k) l++;
            ans = max(ans, r - l + 1);
        }
        cout << ans << endl;
    }
    return 0;
}
