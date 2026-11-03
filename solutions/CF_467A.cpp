#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, ans = 0;
    cin >> n;
    for (int i = 0; i < n; i++) {
        int p, q;
        cin >> p >> q;
        if (q - p >= 2) ans++;
    }
    cout << ans << "\n";
    return 0;
}
