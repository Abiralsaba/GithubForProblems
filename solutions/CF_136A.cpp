#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, p;
    cin >> n;
    int ans[105];
    for (int i = 1; i <= n; i++) cin >> p, ans[p] = i;
    for (int i = 1; i <= n; i++) cout << ans[i] << (i == n ? "" : " ");
    cout << "\n";
    return 0;
}
