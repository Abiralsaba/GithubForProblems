#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        int a[n];
        for (int i = 0; i < n; i++) cin >> a[i];
        int b[n];
        int c0 = 0;
        int c1 = 0;
        for (int i = 0; i < n; i++) {
            cin >> b[i];
            if (b[i] == 0) c0++;
            else c1++;
        }
        bool sorted = true;
        for (int i = 0; i < n - 1; i++) if (a[i] > a[i + 1]) sorted = false;
        if (sorted) cout << "Yes" << endl;
        else if (c0 > 0 && c1 > 0) cout << "Yes" << endl;
        else cout << "No" << endl;
    }
    return 0;
}
