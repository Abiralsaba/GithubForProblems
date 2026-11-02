#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    int b[n];
    for (int i = 0; i < n; i++) cin >> b[i];
    int mn = b[0];
    int mx = b[0];
    for (int i = 1; i < n; i++) {
        if (b[i] < mn) mn = b[i];
        if (b[i] > mx) mx = b[i];
    }
    long long count_mn = 0;
    long long count_mx = 0;
    for (int i = 0; i < n; i++) {
        if (b[i] == mn) count_mn++;
        if (b[i] == mx) count_mx++;
    }
    if (mn == mx) {
        long long ans = (long long)n * (n - 1) / 2;
        cout << 0 << " " << ans << endl;
    } else {
        long long ans = count_mn * count_mx;
        cout << mx - mn << " " << ans << endl;
    }
    return 0;
}
