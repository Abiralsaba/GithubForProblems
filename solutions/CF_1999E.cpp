#include <bits/stdc++.h>
using namespace std;

int f[200005];
int pref[200005];

int main() {
    f[0] = 0;
    pref[0] = 0;
    for (int i = 1; i <= 200000; i++) f[i] = f[i / 3] + 1;
    for (int i = 1; i <= 200000; i++) pref[i] = pref[i - 1] + f[i];
    int t;
    cin >> t;
    while (t--) {
        int l, r;
        cin >> l >> r;
        cout << 2 * f[l] + pref[r] - pref[l] << endl;
    }
    return 0;
}
