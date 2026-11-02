#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        int a[n + 1];
        for (int i = 1; i <= n; i++) cin >> a[i];
        long long L[n + 1];
        L[1] = 0;
        for (int i = 1; i < n; i++)
            if (i == 1)
                L[i + 1] = L[i] + 1;
            else if (a[i + 1] - a[i] < a[i] - a[i - 1])
                L[i + 1] = L[i] + 1;
            else
                L[i + 1] = L[i] + (a[i + 1] - a[i]);
        long long R[n + 1];
        R[n] = 0;
        for (int i = n; i > 1; i--)
            if (i == n)
                R[i - 1] = R[i] + 1;
            else if (a[i] - a[i - 1] <= a[i + 1] - a[i])
                R[i - 1] = R[i] + 1;
            else
                R[i - 1] = R[i] + (a[i] - a[i - 1]);
        int m;
        cin >> m;
        for (int i = 0; i < m; i++) {
            int x, y;
            cin >> x >> y;
            if (x < y)
                cout << L[y] - L[x] << endl;
            else
                cout << R[y] - R[x] << endl;
        }
    }
    return 0;
}
