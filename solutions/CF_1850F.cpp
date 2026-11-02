#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        int cnt[n + 1];
        for (int i = 0; i <= n; i++) cnt[i] = 0;
        for (int i = 0; i < n; i++) {
            int x;
            cin >> x;
            if (x <= n) cnt[x]++;
        }
        int ans[n + 1];
        for (int i = 0; i <= n; i++) ans[i] = 0;
        for (int i = 1; i <= n; i++) {
            if (cnt[i] == 0) continue;
            for (int j = i; j <= n; j += i) ans[j] += cnt[i];
        }
        int max_frogs = 0;
        for (int i = 1; i <= n; i++) {
            if (ans[i] > max_frogs) max_frogs = ans[i];
        }
        cout << max_frogs << endl;
    }
    return 0;
}
