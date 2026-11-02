#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        string a[n];
        for (int i = 0; i < n; i++) cin >> a[i];
        bool ok = true;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (a[i][j] == '1') {
                    if (i < n - 1 && j < n - 1) {
                        if (a[i + 1][j] == '0' && a[i][j + 1] == '0') ok = false;
                    }
                }
            }
        }
        if (ok) cout << "YES" << endl;
        else cout << "NO" << endl;
    }
    return 0;
}
