#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int m;
        cin >> m;
        int a[2][m];
        for (int i = 0; i < 2; i++)
            for (int j = 0; j < m; j++)
                cin >> a[i][j];
        int sum1 = 0;
        for (int j = 0; j < m; j++)
            sum1 += a[0][j];
        int sum2 = 0;
        int ans = 2e9;
        for (int i = 0; i < m; i++) {
            sum1 -= a[0][i];
            int current = max(sum1, sum2);
            ans = min(ans, current);
            sum2 += a[1][i];
        }
        cout << ans << endl;
    }
    return 0;
}
