#include <bits/stdc++.h>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    int b[105][105], a[105][105];
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            cin >> b[i][j];
            a[i][j] = 1;
        }
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (b[i][j] == 0) {
                for (int k = 0; k < n; k++) a[i][k] = 0;
                for (int k = 0; k < m; k++) a[k][j] = 0;
            }
    bool ok = true;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            int val = 0;
            for (int k = 0; k < n; k++) val |= a[i][k];
            for (int k = 0; k < m; k++) val |= a[k][j];
            if (val != b[i][j]) ok = false;
        }
    if (!ok) {
        cout << "NO\n";
        return 0;
    }
    cout << "YES\n";
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) cout << a[i][j] << (j == n - 1 ? "" : " ");
        cout << "\n";
    }
    return 0;
}
