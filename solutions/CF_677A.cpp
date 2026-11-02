#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    int prev = 0;
    for (int i = 0; i < n; i++) {
        int cur;
        cin >> cur;
        if (cur - prev > k) {
            cout << "NO" << endl;
            return 0;
        }
        prev = cur;
    }
    cout << "YES" << endl;
    return 0;
}
