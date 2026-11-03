#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    long long a[n + 1];
    long long pref[n + 1], pref2[n + 1];
    pref[0] = 0;
    pref2[0] = 0;

    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        pref[i] = pref[i - 1] + a[i];
        pref2[i] = pref2[i - 1] + pref[i];
    }

    long long P[n + 1];
    P[0] = 0;
    for (int i = 1; i <= n; i++) P[i] = P[i - 1] + (n - i + 1);

    long long block_sum[n + 1];
    long long pref_block[n + 1];
    pref_block[0] = 0;

    for (int i = 1; i <= n; i++) {
        long long len = n - i + 1;
        block_sum[i] = (pref2[n] - pref2[i - 1]) - len * pref[i - 1];
        pref_block[i] = pref_block[i - 1] + block_sum[i];
    }

    auto get_partial = [&](int i, long long m) {
        if (m <= 0) return 0LL;
        return (pref2[i + m - 1] - pref2[i - 1]) - m * pref[i - 1];
    };

    auto f = [&](long long x) {
        if (x <= 0) return 0LL;
        int i = lower_bound(P + 1, P + n + 1, x) - P;
        long long rem = x - P[i - 1];
        return pref_block[i - 1] + get_partial(i, rem);
    };

    int q;
    cin >> q;
    while (q--) {
        long long l, r;
        cin >> l >> r;
        cout << f(r) - f(l - 1) << "\n";
    }

    return 0;
}
