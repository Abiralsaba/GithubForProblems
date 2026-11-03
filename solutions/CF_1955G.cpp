#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int t;
    cin >> t;
    while (t--) {
        int n, m;
        cin >> n >> m;
        vector<vector<int>> a(n, vector<int>(m));
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++)
                cin >> a[i][j];
        int g = __gcd(a[0][0], a[n - 1][m - 1]);
        vector<int> div;
        for (int i = 1; i * i <= g; i++) {
            if (g % i == 0) {
                div.push_back(i);
                if (i * i != g) div.push_back(g / i);
            }
        }
        sort(div.rbegin(), div.rend());
        int ans = 1;
        for (int d : div) {
            vector<vector<int>> dp(n, vector<int>(m, 0));
            dp[0][0] = 1;
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < m; j++) {
                    if (a[i][j] % d != 0) continue;
                    if (i > 0 && dp[i - 1][j]) dp[i][j] = 1;
                    if (j > 0 && dp[i][j - 1]) dp[i][j] = 1;
                }
            }
            if (dp[n - 1][m - 1]) {
                ans = d;
                break;
            }
        }
        cout << ans << "\n";
    }
    return 0;
}
